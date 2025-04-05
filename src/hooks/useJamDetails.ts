
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTypedSupabaseQuery, getJamById } from '@/utils/supabaseHelpers';
import { JamType } from '@/types/supabase';
import { formatProfileData } from '@/utils/profileHelpers';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useJamDetails = (jamId: string | undefined) => {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  
  const { data: jam, isLoading, error } = useQuery({
    queryKey: ['jam', jamId],
    queryFn: async () => {
      if (!jamId) {
        console.error("ID de confiture non défini");
        throw new Error("ID de confiture manquant");
      }
      
      console.log("useJamDetails - Début de la récupération pour ID:", jamId);
      const { jam, error } = await getJamById(jamId);
      
      if (error) {
        console.error("Erreur lors de la récupération de la confiture:", error);
        throw error;
      }
      
      if (!jam) {
        console.log("Aucune confiture trouvée pour cet ID");
        throw new Error("Confiture introuvable");
      }
      
      console.log("Confiture récupérée avec succès:", jam);
      
      // Vérifier si la confiture est dans les favoris de l'utilisateur
      if (user) {
        try {
          console.log("Vérification des favoris pour l'utilisateur:", user.id);
          const { data: favorite } = await getTypedSupabaseQuery('favorites')
            .select('id')
            .eq('jam_id', jamId)
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (favorite) {
            console.log("Confiture trouvée dans les favoris");
            setFavorited(true);
          }
        } catch (favError) {
          console.error("Erreur lors de la vérification des favoris:", favError);
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
    },
    enabled: !!jamId,
    retry: 2,
    staleTime: 60000, // 1 minute
  });

  // Safely extract ratings with proper type handling
  const ratings = (jam?.reviews?.map(review => review.rating) || []) as number[];
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
    : 0;

  // Safely handle images
  const primaryImage = jam?.jam_images.find((img: any) => img.is_primary)?.url || 
                      (jam?.jam_images.length ? jam.jam_images[0].url : null);
  const secondaryImages = jam?.jam_images.filter((img: any) => 
    img.url !== primaryImage
  ) || [];

  return {
    jam,
    isLoading,
    error,
    favorited,
    setFavorited,
    avgRating,
    ratings,
    primaryImage,
    secondaryImages,
    isAuthenticated: !!user
  };
};
