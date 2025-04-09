
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { CalendarDays, Info, Book } from "lucide-react";

import FruitSidebar from './FruitSidebar';
import FruitInfoTab from './FruitInfoTab';
import FruitRecipesTab from './FruitRecipesTab';
import FruitAdviceTab from './FruitAdviceTab';

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
          is_suggested: link.is_suggested
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <FruitSidebar 
            fruit={fruit} 
            tags={tags}
            seasons={seasons}
            loadingTags={loadingTags}
            loadingSeasons={loadingSeasons}
          />
        </div>
        
        <div className="md:w-2/3 space-y-4">
          <h2 className="text-2xl font-serif font-medium">{fruit.name}</h2>
          
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
              <FruitInfoTab
                description={fruit.description}
                conservationTips={fruit.conservation_tips}
                cookingTips={fruit.cooking_tips}
              />
            </TabsContent>
            
            <TabsContent value="recipes" className="mt-4">
              <FruitRecipesTab 
                recipes={recipes}
                loadingRecipes={loadingRecipes}
              />
            </TabsContent>
            
            <TabsContent value="advice" className="mt-4">
              <FruitAdviceTab 
                advices={advices}
                loadingAdvices={loadingAdvices}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FruitDetail;
