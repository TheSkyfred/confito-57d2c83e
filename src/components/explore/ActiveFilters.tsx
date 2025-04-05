
import React from 'react';
import { Badge } from "@/components/ui/badge";

type FilterState = {
  searchTerm: string;
  sortBy: string;
  filters: {
    fruit?: string[];
    allergens?: string[];
    maxSugar?: number;
    minRating?: number;
    maxPrice?: number;
  }
};

type ActiveFiltersProps = {
  filters: FilterState;
  toggleFruitFilter: (fruit: string) => void;
  toggleAllergenFilter: (allergen: string) => void;
  updateMaxSugar: (value: number[]) => void;
  updateMinRating: (value: number[]) => void;
  updateMaxPrice: (value: number[]) => void;
  activeFilterCount: number;
};

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  toggleFruitFilter,
  toggleAllergenFilter,
  updateMaxSugar,
  updateMinRating,
  updateMaxPrice,
  activeFilterCount,
}) => {
  if (activeFilterCount === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.filters.fruit?.map(fruit => (
        <Badge key={fruit} variant="secondary" className="flex items-center gap-1">
          {fruit}
          <button onClick={() => toggleFruitFilter(fruit)} className="ml-1 hover:text-muted-foreground">×</button>
        </Badge>
      ))}
      
      {filters.filters.allergens?.map(allergen => (
        <Badge key={allergen} variant="outline" className="flex items-center gap-1">
          Sans {allergen}
          <button onClick={() => toggleAllergenFilter(allergen)} className="ml-1 hover:text-muted-foreground">×</button>
        </Badge>
      ))}
      
      {filters.filters.maxSugar !== 100 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Max {filters.filters.maxSugar}% sucre
          <button onClick={() => updateMaxSugar([100])} className="ml-1 hover:text-muted-foreground">×</button>
        </Badge>
      )}
      
      {filters.filters.minRating !== 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Min {filters.filters.minRating} étoiles
          <button onClick={() => updateMinRating([0])} className="ml-1 hover:text-muted-foreground">×</button>
        </Badge>
      )}
      
      {filters.filters.maxPrice !== 50 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Max {filters.filters.maxPrice} crédits
          <button onClick={() => updateMaxPrice([50])} className="ml-1 hover:text-muted-foreground">×</button>
        </Badge>
      )}
    </div>
  );
};

export default ActiveFilters;
