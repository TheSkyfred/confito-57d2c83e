
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, AlignJustify, Book, Sparkles, ChevronLeft, Candy } from "lucide-react";

import FruitHeader from '@/components/fruit/FruitHeader';
import FruitSeasonalityCard from '@/components/fruit/FruitSeasonalityCard';
import FruitRecipesShortcut from '@/components/fruit/FruitRecipesShortcut';
import FruitDescriptionTab from '@/components/fruit/FruitDescriptionTab';
import FruitRecipesTabContent from '@/components/fruit/FruitRecipesTabContent';
import FruitTipsTabContent from '@/components/fruit/FruitTipsTabContent';
import FruitJamsTabContent from '@/components/fruit/FruitJamsTabContent';

const FruitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = React.useState("info");

  // Fetch fruit details
  const { data: fruit, isLoading, error } = useQuery({
    queryKey: ['fruit', id],
    queryFn: async () => {
      // On cherche d'abord dans la table seasonal_fruits
      const { data: seasonalFruit, error: seasonalError } = await supabase
        .from('seasonal_fruits')
        .select('*')
        .eq('id', id)
        .single();

      if (!seasonalError && seasonalFruit) {
        return seasonalFruit;
      }

      // Si pas trouvé, on cherche dans l'ancienne table fruits
      const { data: oldFruit, error } = await supabase
        .from('fruits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return oldFruit;
    },
    enabled: !!id,
  });

  // Fetch seasons
  const { data: seasons, isLoading: loadingSeasons } = useQuery({
    queryKey: ['fruitSeasons', id],
    queryFn: async () => {
      // Pour les fruits saisonniers, on utilise les colonnes mensuelles
      if (fruit && 'jan' in fruit) {
        const seasonalMonths = [];
        const monthFields = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        for (let i = 0; i < monthFields.length; i++) {
          if (fruit[monthFields[i]]) {
            seasonalMonths.push(i + 1); // Les mois sont 1-12
          }
        }
        return seasonalMonths;
      }
      
      // Pour les anciens fruits, on utilise la table fruit_seasons
      const { data, error } = await supabase
        .from('fruit_seasons')
        .select('month')
        .eq('fruit_id', id)
        .order('month');

      if (error) throw error;
      return data.map(s => s.month);
    },
    enabled: !!fruit,
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
      return data;
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
            prep_time_minutes,
            author:profiles!recipes_author_id_fkey (username)
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
              prep_time_minutes,
              author:profiles!recipes_author_id_fkey (username)
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

  // Fetch related jams that use this fruit
  const { data: jams, isLoading: loadingJams } = useQuery({
    queryKey: ['fruitJams', id, fruit?.name],
    queryFn: async () => {
      if (!fruit?.name) return [];
      
      const fruitName = fruit.name.toLowerCase();
      
      const { data, error } = await supabase
        .from('jams')
        .select(`
          id,
          name,
          description,
          price_credits,
          badges,
          ingredients,
          creator_id,
          available_quantity,
          creator:profiles!jams_creator_id_fkey (username, avatar_url)
        `)
        .filter('ingredients', 'cs', `{${fruitName}}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);
        
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!fruit?.name,
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
      <FruitHeader 
        name={fruit.name} 
        tags={tags} 
        loadingTags={loadingTags} 
      />

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

          <FruitSeasonalityCard
            seasons={seasons}
            loadingSeasons={loadingSeasons}
          />

          <FruitRecipesShortcut 
            fruitName={fruit.name} 
            hasRecipes={!!(recipes && recipes.length > 0)}
          />
        </div>

        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info" className="flex items-center">
                <AlignJustify className="h-4 w-4 mr-2" />
                <span>Description</span>
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex items-center">
                <Book className="h-4 w-4 mr-2" />
                <span>Recettes</span>
              </TabsTrigger>
              <TabsTrigger value="jams" className="flex items-center">
                <Candy className="h-4 w-4 mr-2" />
                <span>Confitures</span>
              </TabsTrigger>
              <TabsTrigger value="tips" className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Conseils</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6">
              <FruitDescriptionTab 
                name={fruit.name}
                description={fruit.description} 
                family={fruit.family} 
              />
            </TabsContent>

            <TabsContent value="recipes" className="mt-6">
              <FruitRecipesTabContent 
                fruitName={fruit.name}
                recipes={recipes} 
                loadingRecipes={loadingRecipes}
              />
            </TabsContent>
            
            <TabsContent value="jams" className="mt-6">
              <FruitJamsTabContent 
                fruitName={fruit.name}
                jams={jams} 
                loadingJams={loadingJams}
              />
            </TabsContent>

            <TabsContent value="tips" className="mt-6">
              <FruitTipsTabContent 
                conservationTips={fruit.conservation_tips}
                cookingTips={fruit.cooking_tips}
                advices={advices}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FruitDetail;
