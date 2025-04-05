
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getTypedSupabaseQuery } from '@/utils/supabaseHelpers';
import { JamType, ReviewType } from '@/types/supabase';
import { formatProfileData, formatProfilesData } from '@/utils/profileHelpers';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

import { JamImageCarousel } from '@/components/jam-details/JamImageCarousel';
import { JamHeader } from '@/components/jam-details/JamHeader';
import { JamDetailsSection } from '@/components/jam-details/JamDetailsSection';
import { JamPriceAction } from '@/components/jam-details/JamPriceAction';
import { JamRecipeTab } from '@/components/jam-details/JamRecipeTab';
import { JamReviewsTab } from '@/components/jam-details/JamReviewsTab';
import { JamDetailsSkeleton, JamDetailsError } from '@/components/jam-details/JamDetailsSkeleton';

const JamDetails = () => {
  const { jamId } = useParams<{ jamId: string }>();
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

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter aux favoris",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (favorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('jam_id', jamId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('favorites')
          .insert([{ jam_id: jamId, user_id: user.id }]);
      }
      
      setFavorited(!favorited);
      toast({
        title: favorited ? "Retiré des favoris" : "Ajouté aux favoris",
        description: favorited ? "Cette confiture a été retirée de vos favoris" : "Cette confiture a été ajoutée à vos favoris",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const addToCart = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour commander",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Ajouté au panier",
      description: "Cette confiture a été ajoutée à votre panier",
    });
  };

  if (isLoading) {
    return <JamDetailsSkeleton />;
  }

  if (error || !jam || !jam.profiles) {
    return <JamDetailsError />;
  }

  // Safely extract ratings with proper type handling
  const ratings = (jam.reviews?.map(review => review.rating) || []) as number[];
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
    : 0;

  // Safely handle images
  const primaryImage = jam.jam_images.find((img: any) => img.is_primary)?.url || 
                      (jam.jam_images.length > 0 ? jam.jam_images[0].url : null);
  const secondaryImages = jam.jam_images.filter((img: any) => 
    img.url !== primaryImage
  );

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/explore">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <JamImageCarousel
            primaryImage={primaryImage}
            secondaryImages={secondaryImages}
            jamName={jam.name}
          />
        </div>

        <div>
          <JamHeader
            name={jam.name}
            profile={jam.profiles}
            favorited={favorited}
            toggleFavorite={toggleFavorite}
          />

          <JamDetailsSection
            description={jam.description}
            ingredients={jam.ingredients}
            weight_grams={jam.weight_grams}
            sugar_content={jam.sugar_content}
            available_quantity={jam.available_quantity}
            created_at={jam.created_at}
            allergens={jam.allergens}
          />

          <JamPriceAction
            price_credits={jam.price_credits}
            addToCart={addToCart}
          />
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="recipe">
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="recipe">Recette</TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-1">
              Avis
              {ratings.length > 0 && (
                <Badge variant="secondary" className="ml-1">{ratings.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recipe" className="pt-4">
            <JamRecipeTab
              recipe={jam.recipe}
              isAuthenticated={!!user}
            />
          </TabsContent>
          
          <TabsContent value="reviews" className="pt-4">
            <JamReviewsTab
              reviews={jam.reviews || []}
              avgRating={avgRating}
              isAuthenticated={!!user}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JamDetails;
