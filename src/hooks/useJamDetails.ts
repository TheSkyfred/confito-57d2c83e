
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTypedSupabaseQuery } from '@/utils/supabaseHelpers';
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
      const { data, error } = await getTypedSupabaseQuery('jams')
        .select(`
          *,
          jam_images (*),
          reviews (*, reviewer:reviewer_id(id, username, full_name, avatar_url)),
          profiles:creator_id (id, username, full_name, avatar_url)
        `)
        .eq('id', jamId)
        .single();

      if (error) throw error;
      
      if (user) {
        const { data: favorite } = await getTypedSupabaseQuery('favorites')
          .select('id')
          .eq('jam_id', jamId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (favorite) {
          setFavorited(true);
        }
      }

      // Process data before returning it
      if (data) {
        // Format creator profile data
        if (data.profiles) {
          data.profiles = formatProfileData(data.profiles);
        }

        // Format reviewer profile data in reviews
        if (data.reviews && Array.isArray(data.reviews)) {
          data.reviews = data.reviews.map(review => {
            if (review.reviewer) {
              review.reviewer = formatProfileData(review.reviewer);
            }
            return review;
          });
        }
      }
      
      return data as JamType;
    },
    enabled: !!jamId,
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
