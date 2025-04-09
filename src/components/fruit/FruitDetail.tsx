
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Leaf, Info, Book } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type FruitDetailProps = {
  fruit: any;
};

const FruitDetail: React.FC<FruitDetailProps> = ({ fruit }) => {
  const [activeTab, setActiveTab] = useState("info");

  // Fetch seasons
  const { data: seasons, isLoading: loadingSeasons } = useQuery({
    queryKey: ['fruitSeasons', fruit.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fruit_seasons')
        .select('month')
        .eq('fruit_id', fruit.id)
        .order('month');

      if (error) throw error;
      return data.map(s => s.month);
    },
    enabled: !!fruit.id,
  });

  // Fetch tags
  const { data: tags, isLoading: loadingTags } = useQuery({
    queryKey: ['fruitTags', fruit.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fruit_tags')
        .select('tag')
        .eq('fruit_id', fruit.id);

      if (error) throw error;
      return data.map(t => t.tag);
    },
    enabled: !!fruit.id,
  });

  // Fetch related recipes
  const { data: recipes, isLoading: loadingRecipes } = useQuery({
    queryKey: ['fruitRecipes', fruit.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id, 
          title, 
          image_url, 
          difficulty, 
          prep_time_minutes
        `)
        .eq('primary_fruit_id', fruit.id)
        .limit(5);

      if (error) throw error;

      // Get recipes from recipe links
      const { data: linkedRecipes, error: linkError } = await supabase
        .from('fruit_recipe_links')
        .select(`
          recipe_id,
          recipes (
            id, 
            title, 
            image_url, 
            difficulty, 
            prep_time_minutes
          )
        `)
        .eq('fruit_id', fruit.id)
        .limit(10);

      if (linkError) throw linkError;

      // Combine both sets of recipes and filter out any null values
      const allRecipes = [
        ...(data || []), 
        ...(linkedRecipes?.filter(link => link.recipes).map(link => link.recipes) || [])
      ].filter(Boolean);

      // Remove duplicates - use a Map with ID as key to ensure uniqueness
      const recipeMap = new Map();
      allRecipes.forEach(recipe => {
        if (recipe && recipe.id) {
          recipeMap.set(recipe.id, recipe);
        }
      });
      
      // Convert back to array
      return Array.from(recipeMap.values());
    },
    enabled: !!fruit.id,
  });

  // Fetch related advice
  const { data: advices, isLoading: loadingAdvices } = useQuery({
    queryKey: ['fruitAdvices', fruit.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fruit_advice_links')
        .select(`
          advice_id,
          is_suggested,
          advice_articles (
            id,
            title,
            cover_image_url,
            type
          )
        `)
        .eq('fruit_id', fruit.id);

      if (error) throw error;
      
      // Filter out any null advice_articles and ensure each has a unique ID
      const validAdvice = data
        .filter(link => link.advice_articles)
        .map(link => ({
          ...link.advice_articles,
          is_suggested: link.is_suggested,
          // Add a unique display key based on advice ID
          displayKey: `advice-${link.advice_articles.id}`
        }));
        
      // Ensure no duplicates by using a Map with ID as key
      const adviceMap = new Map();
      validAdvice.forEach(advice => {
        if (advice && advice.id) {
          adviceMap.set(advice.id, advice);
        }
      });
      
      // Convert back to array
      return Array.from(adviceMap.values());
    },
    enabled: !!fruit.id,
  });

  // Fonction pour obtenir le nom du mois
  const getMonthName = (monthIndex: number) => {
    return format(new Date(2000, monthIndex - 1, 1), 'MMMM', { locale: fr });
  };

  // Grouper les mois par saison
  const getSeason = (month: number): string => {
    if ([3, 4, 5].includes(month)) return "Printemps";
    if ([6, 7, 8].includes(month)) return "Été";
    if ([9, 10, 11].includes(month)) return "Automne";
    return "Hiver"; // 12, 1, 2
  };

  const seasonGroups = seasons ? seasons.reduce((acc: Record<string, number[]>, month: number) => {
    const season = getSeason(month);
    if (!acc[season]) acc[season] = [];
    acc[season].push(month);
    return acc;
  }, {}) : {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          {fruit.image_url ? (
            <div className="relative h-64 rounded-md overflow-hidden">
              <img 
                src={fruit.image_url}
                alt={fruit.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-64 bg-muted flex items-center justify-center rounded-md">
              <Leaf className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          <div className="mt-4 space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Famille</h4>
              <p>{fruit.family || "Non spécifiée"}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Statut</h4>
              <Badge variant={fruit.is_published ? "default" : "outline"}>
                {fruit.is_published ? "Publié" : "Non publié"}
              </Badge>
            </div>
            
            {!loadingTags && tags && tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag, index) => (
                    <Badge key={`tag-${index}-${tag}`} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:w-2/3 space-y-4">
          <h2 className="text-2xl font-serif font-medium">{fruit.name}</h2>
          
          {!loadingSeasons && seasons && (
            <div>
              <h3 className="text-sm font-medium flex items-center gap-1 mb-2">
                <CalendarDays className="h-4 w-4" />
                Saisonnalité
              </h3>
              <div className="space-y-2">
                {Object.entries(seasonGroups).map(([season, months]) => (
                  <div key={`season-${season}`} className="rounded-md p-3 bg-secondary/50">
                    <p className="font-medium mb-1">{season}</p>
                    <div className="flex flex-wrap gap-1">
                      {months.map((month) => (
                        <Badge key={`month-${season}-${month}`} variant="secondary" className="capitalize">
                          {getMonthName(month)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList>
              <TabsTrigger value="info">
                <Info className="h-4 w-4 mr-1" />
                Informations
              </TabsTrigger>
              <TabsTrigger value="recipes">
                <Book className="h-4 w-4 mr-1" />
                Recettes liées
              </TabsTrigger>
              <TabsTrigger value="advice">Conseils</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 mt-4">
              {fruit.description && (
                <div>
                  <h3 className="font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">{fruit.description}</p>
                </div>
              )}
              
              {fruit.conservation_tips && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-1">Conseils de conservation</h3>
                    <p className="text-sm text-muted-foreground">{fruit.conservation_tips}</p>
                  </div>
                </>
              )}
              
              {fruit.cooking_tips && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-1">Conseils de préparation</h3>
                    <p className="text-sm text-muted-foreground">{fruit.cooking_tips}</p>
                  </div>
                </>
              )}
              
              {!fruit.description && !fruit.conservation_tips && !fruit.cooking_tips && (
                <p className="text-muted-foreground">Aucune information supplémentaire disponible.</p>
              )}
            </TabsContent>
            
            <TabsContent value="recipes" className="mt-4">
              {loadingRecipes ? (
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
              ) : recipes && recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipes.map((recipe) => (
                    <Card key={`recipe-${recipe.id}`}>
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
              ) : (
                <p className="text-muted-foreground">
                  Aucune recette liée à ce fruit pour le moment.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="advice" className="mt-4">
              {loadingAdvices ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={`skeleton-advice-${i}`}>
                      <CardHeader className="p-4">
                        <Skeleton className="h-5 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : advices && advices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advices.map((advice) => (
                    <Card key={advice.displayKey || `advice-${advice.id}`}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{advice.title}</CardTitle>
                        <CardDescription>
                          {advice.is_suggested ? "Suggestion" : "Associé"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {advice.cover_image_url && (
                          <div className="h-28 rounded-md overflow-hidden">
                            <img 
                              src={advice.cover_image_url} 
                              alt={advice.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <Badge className="mt-2">{advice.type}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Aucun conseil lié à ce fruit pour le moment.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FruitDetail;
