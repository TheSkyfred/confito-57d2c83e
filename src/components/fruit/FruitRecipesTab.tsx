
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Recipe {
  id: string;
  title: string;
  image_url?: string;
  difficulty: string;
  prep_time_minutes: number;
}

interface FruitRecipesTabProps {
  recipes: Recipe[] | undefined;
  loadingRecipes: boolean;
}

export const FruitRecipesTab: React.FC<FruitRecipesTabProps> = ({ 
  recipes, 
  loadingRecipes 
}) => {
  if (loadingRecipes) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={`skeleton-recipe-${i}`}>
            <CardHeader className="p-4">
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return <p className="text-muted-foreground">Aucune recette liée à ce fruit pour le moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recipes.map((recipe, index) => (
        <Card key={`recipe-${recipe.id}-${index}`}>
          <CardHeader className="p-4">
            <CardTitle className="text-base">{recipe.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {recipe.image_url && (
              <div className="h-28 mb-2 rounded-md overflow-hidden">
                <img 
                  src={recipe.image_url} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex justify-between">
              <Badge variant="outline">{recipe.difficulty}</Badge>
              <span className="text-sm text-muted-foreground">
                {recipe.prep_time_minutes} min
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FruitRecipesTab;
