
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RecipeFilters from '@/components/recipe/RecipeFilters';
import { RecipeFilters as RecipeFiltersType } from '@/types/recipes';

interface RecipeFilterCardProps {
  filters: RecipeFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<RecipeFiltersType>>;
  onFilterChange: (filters: RecipeFiltersType) => void;
  onClose: () => void;
}

const RecipeFilterCard: React.FC<RecipeFilterCardProps> = ({ 
  filters, 
  setFilters, 
  onFilterChange,
  onClose
}) => {
  const resetFilters = () => {
    const resetValues: RecipeFiltersType = {
      difficulty: [],
      season: [],
      style: [],
      minRating: 0,
      maxPrepTime: 120,
      ingredients: [],
      allergens: false
    };
    
    setFilters(resetValues);
    onFilterChange(resetValues);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filtres</CardTitle>
        <CardDescription>
          Affinez votre recherche de recettes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RecipeFilters 
          onFilterChange={onFilterChange} 
          filters={filters} 
          setFilters={setFilters}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetFilters}
        >
          Réinitialiser
        </Button>
        <Button onClick={onClose}>
          Appliquer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecipeFilterCard;
