
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
          author:profiles!recipes_author_id_fkey (username, avatar_url),
          ingredients:recipe_ingredients(*),
          ratings:recipe_ratings(*)
        `)
        .eq('status', 'approved');

      if (activeTab === 'seasonal') {
        const currentMonth = new Date().getMonth();
        let season = 'été';
        if (currentMonth >= 2 && currentMonth <= 4) season = 'printemps';
        else if (currentMonth >= 5 && currentMonth <= 7) season = 'été';
        else if (currentMonth >= 8 && currentMonth <= 10) season = 'automne';
        else season = 'hiver';
        
        query = query.or(`season.eq.${season},season.eq.toutes_saisons`);
      } else if (activeTab === 'quick') {
        query = query.lte('prep_time_minutes', 30);
      } else if (activeTab === 'popular') {
        query = query.order('average_rating', { ascending: false });
      }

      if (filters.difficulty && filters.difficulty.length > 0) {
        query = query.in('difficulty', filters.difficulty);
      }
      
      if (filters.season && filters.season.length > 0) {
        query = query.in('season', filters.season);
      }
      
      if (filters.style && filters.style.length > 0) {
        query = query.in('style', filters.style);
      }
      
      if (filters.maxPrepTime && filters.maxPrepTime < 120) {
        query = query.lte('prep_time_minutes', filters.maxPrepTime);
      }
      
      if (filters.minRating && filters.minRating > 0) {
        query = query.gte('average_rating', filters.minRating);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const typedRecipes = data.map(recipe => adaptDbRecipeToRecipeType(recipe));
      
      return typedRecipes;
    }
  });
};
