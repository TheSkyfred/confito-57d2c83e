
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTypedSupabaseQuery, getJamById } from '@/utils/supabaseHelpers';
import { JamType } from '@/types/supabase';
import { formatProfileData } from '@/utils/profileHelpers';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useJamDetails = (jamId: string | undefined) => {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    data: jam, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['jam', jamId, retryCount],
    queryFn: async () => {
      if (!jamId) {
        console.error("[useJamDetails] ID de confiture non défini");
        throw new Error("ID de confiture manquant");
      }
      
      console.log("[useJamDetails] Début de la récupération pour ID:", jamId);
      console.log("[useJamDetails] Tentative #" + (retryCount + 1));
      
      // Attendre un peu si c'est une nouvelle tentative
      if (retryCount > 0) {
        console.log(`[useJamDetails] Délai de ${retryCount * 500}ms avant la requête...`);
        await new Promise(resolve => setTimeout(resolve, retryCount * 500));
      }
      
      try {
        const { jam, error } = await getJamById(jamId);
        
        if (error) {
          console.error("[useJamDetails] Erreur lors de la récupération de la confiture:", error);
          
          // Notification d'erreur à l'utilisateur
          toast({
            title: "Erreur de chargement",
            description: "Problème lors de la récupération des données",
            variant: "destructive",
          });
          
          throw error;
        }
        
        if (!jam) {
          console.log("[useJamDetails] Aucune confiture trouvée pour cet ID");
          throw new Error("Confiture introuvable");
        }
        
        console.log("[useJamDetails] Confiture récupérée avec succès:", jam);
        
        // Vérifier si la confiture est dans les favoris de l'utilisateur
        if (user) {
          try {
            console.log("[useJamDetails] Vérification des favoris pour l'utilisateur:", user.id);
            const { data: favorite } = await getTypedSupabaseQuery('favorites')
              .select('id')
              .eq('jam_id', jamId)
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (favorite) {
              console.log("[useJamDetails] Confiture trouvée dans les favoris");
              setFavorited(true);
            }
          } catch (favError) {
            console.error("[useJamDetails] Erreur lors de la vérification des favoris:", favError);
          }
        }

        // Process data before returning it
        if (jam) {
          // Format creator profile data
          if (jam.profiles) {
            jam.profiles = formatProfileData(jam.profiles);
          }

          // Format reviewer profile data in reviews
          if (jam.reviews && Array.isArray(jam.reviews)) {
            jam.reviews = jam.reviews.map(review => {
              if (review.reviewer) {
                review.reviewer = formatProfileData(review.reviewer);
              }
              return review;
            });
          }
        }
        
        return jam as JamType;
      } catch (error) {
        console.error("[useJamDetails] Exception non gérée:", error);
        throw error;
      }
    },
    enabled: !!jamId,
    retry: retryCount < 3 ? 2 : 0, // Réduire les tentatives automatiques après plusieurs échecs manuels
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    staleTime: 30000, // 30 seconds
  });

  // Fonction pour forcer une nouvelle tentative avec un compteur incrémenté
  const retryFetch = () => {
    console.log("[useJamDetails] Relance manuelle de la requête");
    setRetryCount(prev => prev + 1);
    toast({
      title: "Nouvelle tentative",
      description: "Tentative de récupération des données...",
    });
  };

  return {
    jam,
    isLoading,
    error,
    favorited,
    setFavorited,
    avgRating: (jam?.reviews?.map(review => review.rating) || []).reduce((sum, r) => sum + r, 0) / 
               (jam?.reviews?.length || 1) || 0,
    ratings: (jam?.reviews?.map(review => review.rating) || []) as number[],
    primaryImage: jam?.jam_images?.find((img: any) => img.is_primary)?.url || 
                 (jam?.jam_images?.length ? jam.jam_images[0].url : null),
    secondaryImages: jam?.jam_images?.filter((img: any) => 
      img.url !== (jam?.jam_images?.find((img: any) => img.is_primary)?.url || 
                 (jam?.jam_images?.length ? jam.jam_images[0].url : null))
    ) || [],
    isAuthenticated: !!user,
    refetch,
    retryFetch
  };
};
