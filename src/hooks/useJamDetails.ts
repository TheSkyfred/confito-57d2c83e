
import { useQuery } from '@tanstack/react-query';
import { getJamById, getTypedSupabaseQuery } from '@/utils/supabaseHelpers';
import { JamType } from '@/types/supabase';
import { formatProfileData } from '@/utils/profileHelpers';
import { useState } from 'react';
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
        throw new Error("ID de confiture manquant");
      }
      
      const { jam, error } = await getJamById(jamId);
      
      if (error) {
        toast({
          title: "Erreur de chargement",
          description: "Problème lors de la récupération des données",
          variant: "destructive",
        });
        throw error;
      }
      
      if (!jam) {
        throw new Error("Confiture introuvable");
      }
      
      // Vérifier si la confiture est dans les favoris de l'utilisateur
      if (user) {
        const { data: favorite } = await getTypedSupabaseQuery('favorites')
          .select('id')
          .eq('jam_id', jamId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        setFavorited(!!favorite);
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
    },
    enabled: !!jamId,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

  // Fonction pour forcer une nouvelle tentative
  const retryFetch = () => {
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
