
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RecipeFilters as RecipeFiltersType } from '@/types/recipes';
import { useRecipes } from '@/hooks/useRecipes';
import RecipesHeader from '@/components/recipe/RecipesHeader';
import RecipeSearch from '@/components/recipe/RecipeSearch';
import RecipeFilterCard from '@/components/recipe/RecipeFilterCard';
import RecipeTabs from '@/components/recipe/RecipeTabs';

const Recipes = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<RecipeFiltersType>({
    difficulty: [],
    season: [],
    style: [],
    minRating: 0,
    maxPrepTime: 120,
    ingredients: [],
    allergens: false
  });

  const handleFilterChange = (newFilters: RecipeFiltersType) => {
    setFilters(newFilters);
  };

  // Ajoutons des logs pour debugger
  const { data: recipes, isLoading } = useRecipes(activeTab, filters);
  console.log('Recipes from useRecipes:', recipes);

  return (
    <div className="container py-8">
      <RecipesHeader user={user} />
      
      <RecipeSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
      />
      
      {showFilters && (
        <RecipeFilterCard 
          filters={filters} 
          setFilters={setFilters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}
      
      <RecipeTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recipes={recipes}
        isLoading={isLoading}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default Recipes;
