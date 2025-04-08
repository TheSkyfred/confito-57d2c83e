
import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListFilter } from 'lucide-react';
import RecipeCard from '@/components/recipe/RecipeCard';
import { RecipeType } from '@/types/recipes';

interface RecipeTabContentProps {
  recipes: RecipeType[] | undefined;
  isLoading: boolean;
  searchTerm?: string;
}

const RecipeTabContent: React.FC<RecipeTabContentProps> = ({ 
  recipes, 
  isLoading,
  searchTerm = ''
}) => {
  const filteredRecipes = recipes && searchTerm 
    ? recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients?.some(ing => 
          ing.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : recipes;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        Array(3).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video w-full">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        ))
      ) : filteredRecipes && filteredRecipes.length > 0 ? (
        filteredRecipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <ListFilter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucune recette trouvée</h3>
          <p className="text-muted-foreground">
            Essayez de modifier vos filtres ou votre recherche
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeTabContent;
