
import React from 'react';
import { ReviewType } from '@/types/supabase';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { JamRecipeTab } from './JamRecipeTab';
import { JamReviewsTab } from './JamReviewsTab';

type JamTabsSectionProps = {
  recipe: string | null;
  reviews: ReviewType[];
  avgRating: number;
  ratings: number[];
  isAuthenticated: boolean;
};

export const JamTabsSection = ({
  recipe,
  reviews,
  avgRating,
  ratings,
  isAuthenticated
}: JamTabsSectionProps) => {
  return (
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
            recipe={recipe}
            isAuthenticated={isAuthenticated}
          />
        </TabsContent>
        
        <TabsContent value="reviews" className="pt-4">
          <JamReviewsTab
            reviews={reviews || []}
            avgRating={avgRating}
            isAuthenticated={isAuthenticated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
