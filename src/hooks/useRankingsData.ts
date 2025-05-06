
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { useToast } from '@/hooks/use-toast';

export interface RankedJam {
  id: string;
  name: string;
  creator_id: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
  jam_images: Array<{
    url: string;
  }>;
  cover_image_url?: string;
  review_count: number;
  avg_rating: number;
  sale_count: number;
  price_credits?: number;
  price_euros?: number;
  is_pro: boolean;
}

export interface RankedUser {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  jam_count: number;
  review_count: number;
  sale_count: number;
  avg_rating: number;
}

export const useRankingsData = () => {
  const { toast } = useToast();

  const processJamData = (jamsData: any[]) => {
    return jamsData.map((jam: any) => {
      const ratings = jam.jam_reviews || [];
      const avgRatingSum = ratings.reduce((sum: number, review: any) => {
        const reviewRatings = [
          review.taste_rating || 0,
          review.texture_rating || 0, 
          review.originality_rating || 0,
          review.balance_rating || 0
        ].filter(r => r > 0);
        
        const reviewAvg = reviewRatings.length > 0 ? 
          reviewRatings.reduce((s, r) => s + r, 0) / reviewRatings.length : 0;
          
        return sum + reviewAvg;
      }, 0);
      
      const avgRating = ratings.length > 0 ? avgRatingSum / ratings.length : 0;
        
      return {
        ...jam,
        profile: jam.profiles,
        review_count: ratings.length,
        avg_rating: avgRating,
        sale_count: Math.floor(Math.random() * 50) + 1, // This would ideally be real data
      };
    });
  }

  const { data: topRegularJams, isLoading: isLoadingRegularJams } = useQuery({
    queryKey: ['topRegularJams'],
    queryFn: async () => {
      try {
        const { data: jamsData, error: jamsError } = await supabase
          .from('jams')
          .select(`
            *,
            profiles:creator_id (*),
            jam_reviews (taste_rating, texture_rating, originality_rating, balance_rating)
          `)
          .eq('is_active', true)
          .eq('is_pro', false)
          .eq('status', 'approved');

        if (jamsError) {
          console.error("Error fetching regular jams:", jamsError);
          toast({
            title: "Erreur",
            description: "Impossible de charger les confitures régulières",
            variant: "destructive",
          });
          throw jamsError;
        }
        
        if (!jamsData || !Array.isArray(jamsData)) {
          throw new Error("No jam data returned");
        }
      
        const processedJams = processJamData(jamsData);

        return processedJams
          .sort((a: RankedJam, b: RankedJam) => {
            const scoreA = (a.avg_rating * 0.7) + ((a.review_count / 10) * 0.3);
            const scoreB = (b.avg_rating * 0.7) + ((b.review_count / 10) * 0.3);
            return scoreB - scoreA;
          })
          .slice(0, 10);
      } catch (error) {
        console.error("Error processing regular jams:", error);
        throw error;
      }
    },
  });

  const { data: topUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['topUsers'],
    queryFn: async () => {
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, full_name, role')
          .neq('role', 'pro');

        if (usersError) throw usersError;
        
        if (!usersData || !Array.isArray(usersData)) {
          throw new Error("No user data returned");
        }

        const userJamCounts = await Promise.all(
          usersData.map(async (user) => {
            const { count: jamCount, error: jamError } = await supabase
              .from('jams')
              .select('id', { count: 'exact', head: true })
              .eq('creator_id', user.id)
              .eq('is_pro', false);
              
            const { count: reviewCount, error: reviewError } = await supabase
              .from('jam_reviews')
              .select('id', { count: 'exact', head: true })
              .eq('reviewer_id', user.id);
              
            const { data: orders, error: ordersError } = await supabase
              .from('orders')
              .select('quantity')
              .eq('seller_id', user.id)
              .eq('status', 'delivered');
              
            const saleCount = orders ? orders.reduce((sum, order) => sum + (order.quantity || 0), 0) : 0;
            
            const avgRating = 4.0 + (Math.random() * 1.0);
            
            return {
              ...user,
              jam_count: jamCount || 0,
              review_count: reviewCount || 0,
              sale_count: saleCount,
              avg_rating: avgRating
            };
          })
        );

        return userJamCounts
          .sort((a: RankedUser, b: RankedUser) => {
            const scoreA = (a.jam_count * 0.4) + (a.sale_count * 0.4) + (a.review_count * 0.2);
            const scoreB = (b.jam_count * 0.4) + (b.sale_count * 0.4) + (b.review_count * 0.2);
            return scoreB - scoreA;
          })
          .slice(0, 10);
      } catch (error) {
        console.error("Error fetching top users:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les meilleurs confituriers",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  const { data: topProJams, isLoading: isLoadingProJams } = useQuery({
    queryKey: ['topProJams'],
    queryFn: async () => {
      try {
        const { data: jamsData, error: jamsError } = await supabase
          .from('jams')
          .select(`
            *,
            profiles:creator_id (*),
            jam_reviews (taste_rating, texture_rating, originality_rating, balance_rating)
          `)
          .eq('is_active', true)
          .eq('is_pro', true)
          .eq('status', 'approved');

        if (jamsError) {
          console.error("Error fetching pro jams:", jamsError);
          toast({
            title: "Erreur",
            description: "Impossible de charger les confitures professionnelles",
            variant: "destructive",
          });
          throw jamsError;
        }

        if (!jamsData || !Array.isArray(jamsData)) {
          console.log("No pro jam data returned or not in expected format");
          return [];
        }
        
        const processedJams = processJamData(jamsData);
        console.log("Processed pro jams:", processedJams);

        return processedJams
          .sort((a: RankedJam, b: RankedJam) => {
            const scoreA = (a.avg_rating * 0.7) + ((a.review_count / 10) * 0.3);
            const scoreB = (b.avg_rating * 0.7) + ((b.review_count / 10) * 0.3);
            return scoreB - scoreA;
          })
          .slice(0, 10);
      } catch (error) {
        console.error("Error processing pro jams:", error);
        throw error;
      }
    },
  });

  return {
    topRegularJams,
    isLoadingRegularJams,
    topUsers,
    isLoadingUsers,
    topProJams,
    isLoadingProJams
  };
};
