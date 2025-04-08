
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Book, GridIcon, ListBullet, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import RecipeCard from '@/components/recipe/RecipeCard';
import RecipeFilters from '@/components/recipe/RecipeFilters';
import { RecipeType, RecipeFilters as RecipeFiltersType } from '@/types/recipes';
import { useAuth } from '@/contexts/AuthContext';

const Recipes = () => {
  const { session } = useAuth();
  const [filters, setFilters] = useState<RecipeFiltersType>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Fetch recipes with filters
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['recipes', filters],
    queryFn: async () => {
      let query = supabase
        .from('recipes')
        .select(`
          *,
          author:author_id (username, avatar_url),
          ingredients:recipe_ingredients (*),
          tags:recipe_tags (*),
          ratings:recipe_ratings (*),
          badges:recipe_badge_assignments (
            id,
            badge_id,
            badge:badge_id (name, description, icon)
          ),
          jam:jam_id (id, name)
        `)
        .eq('status', 'approved');
      
      // Apply filters
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      if (filters.ingredients && filters.ingredients.length > 0) {
        // This is a simplified approach - a more complex query might be needed
        // to properly filter by ingredients in a real application
        query = query.contains('ingredients', filters.ingredients.join(','));
      }
      
      if (filters.maxPrepTime) {
        query = query.lte('prep_time_minutes', filters.maxPrepTime);
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
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Calculate average rating for each recipe
      const recipesWithRatings = data.map((recipe: any) => {
        const ratings = recipe.ratings || [];
        const totalRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
        const average_rating = ratings.length > 0 ? totalRating / ratings.length : 0;
        
        return {
          ...recipe,
          average_rating
        };
      });
      
      // Apply minimum rating filter after calculating averages
      let filteredRecipes = recipesWithRatings;
      if (filters.minRating && filters.minRating > 0) {
        filteredRecipes = recipesWithRatings.filter(
          (recipe: any) => recipe.average_rating >= filters.minRating
        );
      }
      
      return filteredRecipes;
    }
  });
  
  const handleFilterChange = (newFilters: RecipeFiltersType) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Book className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-3xl font-serif font-bold">Recettes</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-secondary rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-md"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-md"
            >
              <ListBullet className="h-4 w-4" />
            </Button>
          </div>
          
          {session?.user && (
            <Button asChild>
              <Link to="/recipes/create">
                <Plus className="h-4 w-4 mr-1" />
                Nouvelle recette
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <RecipeFilters onFilterChange={handleFilterChange} />
        </div>
        
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Chargement des recettes...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-800 p-4 rounded-md">
              <p>Erreur lors du chargement des recettes</p>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          ) : recipes && recipes.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {recipes.map((recipe: RecipeType) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Book className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucune recette trouvée</h3>
              <p className="text-muted-foreground mb-6">
                Aucune recette ne correspond à vos critères de recherche.
              </p>
              <Button variant="outline" onClick={() => setFilters({})}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
