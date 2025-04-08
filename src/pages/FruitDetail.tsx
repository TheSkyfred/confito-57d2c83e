
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarDays, 
  ChevronLeft, 
  Book, 
  AlignJustify, 
  Sparkles,
  Leaf,
  ArrowRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FruitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = React.useState("info");

  // Fetch fruit details
  const { data: fruit, isLoading, error } = useQuery({
    queryKey: ['fruit', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fruits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch seasons
  const { data: seasons, isLoading: loadingSeasons } = useQuery({
    queryKey: ['fruitSeasons', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fruit_seasons')
        .select('month')
        .eq('fruit_id', id)
        .order('month');

      if (error) throw error;
      return data.map(s => s.month);
    },
    enabled: !!id,
  });

  // Fetch tags
  const { data: tags, isLoading: loadingTags } = useQuery({
    queryKey: ['fruitTags', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fruit_tags')
        .select('tag')
        .eq('fruit_id', id);

      if (error) throw error;
      return data.map(t => t.tag);
    },
    enabled: !!id,
  });

  // Fetch related recipes
  const { data: recipes, isLoading: loadingRecipes } = useQuery({
    queryKey: ['fruitRecipes', id],
    queryFn: async () => {
      try {
        // Fetch recipes where this fruit is the primary fruit
        const { data: primaryRecipes, error: primaryError } = await supabase
          .from('recipes')
          .select(`
            id, 
            title, 
            image_url, 
            difficulty, 
            prep_time_minutes
          `)
          .eq('primary_fruit_id', id)
          .limit(6);

        if (primaryError) throw primaryError;

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
          .eq('fruit_id', id)
          .limit(10);

        if (linkError) throw linkError;

        // Combine both sets of recipes
        const allRecipes = [
          ...(primaryRecipes || []), 
          ...(linkedRecipes?.filter(r => r.recipes).map(link => link.recipes) || [])
        ];

        // Remove duplicates
        const uniqueRecipes = Array.from(
          new Map(allRecipes.filter(Boolean).map(item => [item['id'], item]))
        ).map(([_, item]) => item);

        return uniqueRecipes;
      } catch (error) {
        console.error("Erreur lors de la récupération des recettes:", error);
        return [];
      }
    },
    enabled: !!id,
  });

  // Fetch related advice
  const { data: advices, isLoading: loadingAdvices } = useQuery({
    queryKey: ['fruitAdvices', id],
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
        .eq('fruit_id', id);

      if (error) throw error;
      return data
        .filter(link => link.advice_articles)
        .map(link => ({
          ...link.advice_articles,
          is_suggested: link.is_suggested
        }));
    },
    enabled: !!id,
  });

  // Fonction pour obtenir le nom du mois
  const getMonthName = (monthIndex: number) => {
    return format(new Date(2000, monthIndex - 1, 1), 'MMMM', { locale: fr });
  };

  // Fonction pour capitaliser la première lettre
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Grouper les mois par saison
  const getSeason = (month: number): string => {
    if ([3, 4, 5].includes(month)) return "printemps";
    if ([6, 7, 8].includes(month)) return "été";
    if ([9, 10, 11].includes(month)) return "automne";
    return "hiver"; // 12, 1, 2
  };

  const seasonGroups = seasons ? seasons.reduce((acc: Record<string, number[]>, month: number) => {
    const season = getSeason(month);
    if (!acc[season]) acc[season] = [];
    acc[season].push(month);
    return acc;
  }, {}) : {};

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-72 w-full" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !fruit) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Fruit non trouvé</CardTitle>
            <CardDescription>Le fruit demandé n'existe pas ou a été supprimé.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to="/seasonal">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour au calendrier
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button asChild variant="outline" className="mb-4">
          <Link to="/seasonal">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Calendrier des fruits
          </Link>
        </Button>
        <h1 className="text-3xl font-serif font-bold">{fruit.name}</h1>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="mb-6">
            {fruit.image_url ? (
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src={fruit.image_url}
                  alt={fruit.name}
                  className="w-full h-auto object-cover"
                />
              </div>
            ) : (
              <div className="bg-muted flex items-center justify-center rounded-lg h-72">
                <Leaf className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                <CardTitle>Saisonnalité</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSeasons ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : seasons && seasons.length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(seasonGroups).map(([season, months]) => (
                    <div key={season} className="rounded-md p-3 bg-secondary/40">
                      <p className="font-semibold mb-2 capitalize">{season}</p>
                      <div className="flex flex-wrap gap-1">
                        {months.map((month) => (
                          <Badge key={month} variant="secondary" className="capitalize">
                            {getMonthName(month)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Information non disponible</p>
              )}
            </CardContent>
          </Card>

          {recipes && recipes.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Book className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle>Recettes avec ce fruit</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Button variant="ghost" className="w-full justify-between" asChild>
                  <Link to={`/recipes?fruit=${fruit.name}`}>
                    Voir toutes les recettes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="flex items-center">
                <AlignJustify className="h-4 w-4 mr-2" />
                <span>Description</span>
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex items-center">
                <Book className="h-4 w-4 mr-2" />
                <span>Recettes</span>
              </TabsTrigger>
              <TabsTrigger value="tips" className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Conseils</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>À propos du {fruit.name.toLowerCase()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fruit.description ? (
                    <div>
                      <p>{fruit.description}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Pas de description disponible pour ce fruit.</p>
                  )}
                  
                  {fruit.family && (
                    <div>
                      <h3 className="font-medium mb-1">Famille</h3>
                      <p className="text-muted-foreground">{fruit.family}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recettes avec {fruit.name.toLowerCase()}</CardTitle>
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
                      {recipes.map((recipe: any) => (
                        <Link to={`/recipes/${recipe.id}`} key={recipe.id}>
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
                    <Link to={`/recipes?fruit=${fruit.name}`}>
                      Voir toutes les recettes
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="mt-6">
              <div className="space-y-6">
                {fruit.conservation_tips && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Conservation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{fruit.conservation_tips}</p>
                    </CardContent>
                  </Card>
                )}

                {fruit.cooking_tips && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Conseils de préparation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{fruit.cooking_tips}</p>
                    </CardContent>
                  </Card>
                )}

                {advices && advices.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Articles liés</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {advices.map((advice) => (
                          <Link to={`/conseils/${advice.id}`} key={advice.id}>
                            <Card className="h-full hover:shadow-md transition-shadow">
                              <CardHeader className="p-4">
                                <CardTitle className="text-base">{advice.title}</CardTitle>
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
                                <Badge className="mt-2">{capitalize(advice.type)}</Badge>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!fruit.conservation_tips && !fruit.cooking_tips && (!advices || advices.length === 0) && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <p>Pas de conseils disponibles pour ce fruit.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FruitDetail;
