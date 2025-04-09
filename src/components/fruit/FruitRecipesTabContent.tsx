
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Recipe {
  id: string;
  title: string;
  image_url?: string;
  difficulty: string;
  prep_time_minutes: number;
  author?: any;
}

interface FruitRecipesTabContentProps {
  fruitName: string;
  recipes: Recipe[] | undefined;
  loadingRecipes: boolean;
}

export const FruitRecipesTabContent: React.FC<FruitRecipesTabContentProps> = ({ 
  fruitName,
  recipes, 
  loadingRecipes 
}) => {
  const getAuthorProperty = (author: any, property: string, fallback: string = ''): string => {
    if (!author) return fallback;
    return author[property] || fallback;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recettes avec {fruitName.toLowerCase()}</CardTitle>
        <CardDescription>
          Découvrez des recettes de confitures et préparations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingRecipes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i}>
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
        ) : recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe: any, index: number) => (
              <Link to={`/recipes/${recipe.id}`} key={`recipe-${recipe.id}-${index}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
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
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Aucune recette associée à ce fruit pour le moment.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to={`/recipes?fruit=${fruitName}`}>
            Voir toutes les recettes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FruitRecipesTabContent;
