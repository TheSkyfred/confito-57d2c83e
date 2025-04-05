
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { JamRecipeTab } from '@/components/jam-details/JamRecipeTab';
import { JamReviewsTab } from '@/components/jam-details/JamReviewsTab';
import { JamDetailsSkeleton, JamDetailsError } from '@/components/jam-details/JamDetailsSkeleton';
import { useJamDetails } from '@/hooks/useJamDetails';
import { JamFavoriteShare } from '@/components/jam-details/JamFavoriteShare';
import { useFavoriteHandler } from '@/components/jam-details/JamFavoriteHandler';
import { JamActions } from '@/components/jam-details/JamActions';

const JamDetails = () => {
  const { jamId } = useParams<{ jamId: string }>();
  const { user } = useAuth();
  
  const {
    jam,
    isLoading,
    error,
    favorited,
    setFavorited,
    avgRating,
    ratings,
    primaryImage,
    secondaryImages,
    isAuthenticated
  } = useJamDetails(jamId);

  const { toggleFavorite } = useFavoriteHandler({
    jamId: jamId || '',
    userId: user?.id,
    favorited,
    setFavorited
  });

  if (isLoading) {
    return <JamDetailsSkeleton />;
  }

  if (error || !jam || !jam.profiles) {
    return <JamDetailsError />;
  }

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
          <div className="flex justify-between items-start">
            <JamHeader
              name={jam.name}
              profile={jam.profiles}
            />
            <JamFavoriteShare 
              favorited={favorited}
              toggleFavorite={toggleFavorite}
            />
          </div>

          <JamDetailsSection
            description={jam.description}
            ingredients={jam.ingredients}
            weight_grams={jam.weight_grams}
            sugar_content={jam.sugar_content}
            available_quantity={jam.available_quantity}
            created_at={jam.created_at}
            allergens={jam.allergens}
          />

          <JamActions
            price_credits={jam.price_credits}
            isAuthenticated={isAuthenticated}
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
              isAuthenticated={isAuthenticated}
            />
          </TabsContent>
          
          <TabsContent value="reviews" className="pt-4">
            <JamReviewsTab
              reviews={jam.reviews || []}
              avgRating={avgRating}
              isAuthenticated={isAuthenticated}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JamDetails;
