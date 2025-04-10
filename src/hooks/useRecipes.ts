
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RecipeFilters, RecipeType } from '@/types/recipes';
import { adaptDbRecipeToRecipeType } from '@/utils/supabaseHelpers';

export const useRecipes = (activeTab: string, filters: RecipeFilters) => {
  return useQuery({
    queryKey: ['recipes', activeTab, filters],
    queryFn: async () => {
      let query = supabase
        .from('recipes')
        .select(`
          *,
          ingredients:recipe_ingredients(*),
          tags:recipe_tags(*),
          ratings:recipe_ratings(*)
        `)
        .eq('status', 'approved');

      console.log('Recipe filter - status:', 'approved');

      if (activeTab === 'seasonal') {
        const currentMonth = new Date().getMonth();
        let season = 'été';
        if (currentMonth >= 2 && currentMonth <= 4) season = 'printemps';
        else if (currentMonth >= 5 && currentMonth <= 7) season = 'été';
        else if (currentMonth >= 8 && currentMonth <= 10) season = 'automne';
        else season = 'hiver';
        
        console.log('Recipe filter - season:', season);
        query = query.or(`season.eq.${season},season.eq.toutes_saisons`);
      } else if (activeTab === 'quick') {
        console.log('Recipe filter - quick prep time <= 30');
        query = query.lte('prep_time_minutes', 30);
      } else if (activeTab === 'popular') {
        console.log('Recipe filter - sorting by average_rating');
        query = query.order('average_rating', { ascending: false });
      }

      if (filters.difficulty && filters.difficulty.length > 0) {
        console.log('Recipe filter - difficulty:', filters.difficulty);
        query = query.in('difficulty', filters.difficulty);
      }
      
      if (filters.season && filters.season.length > 0) {
        console.log('Recipe filter - season filter:', filters.season);
        query = query.in('season', filters.season);
      }
      
      if (filters.style && filters.style.length > 0) {
        console.log('Recipe filter - style:', filters.style);
        query = query.in('style', filters.style);
      }
      
      if (filters.maxPrepTime && filters.maxPrepTime < 120) {
        console.log('Recipe filter - max prep time:', filters.maxPrepTime);
        query = query.lte('prep_time_minutes', filters.maxPrepTime);
      }
      
      if (filters.minRating && filters.minRating > 0) {
        console.log('Recipe filter - min rating:', filters.minRating);
        query = query.gte('average_rating', filters.minRating);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching recipes:', error);
        throw error;
      }
      
      console.log('Raw recipes data from API:', data);
      
      // We've removed the author relationship that was causing the error
      // Adapt the data to our RecipeType format
      const typedRecipes = data.map(recipe => adaptDbRecipeToRecipeType(recipe));
      console.log('Adapted recipes:', typedRecipes);
      
      return typedRecipes;
    }
  });
};
