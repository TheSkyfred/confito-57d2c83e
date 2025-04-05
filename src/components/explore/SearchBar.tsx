
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FilterSheet from './FilterSheet';

// Filtres statiques (en production, viendrait de la base de données)
const fruitOptions = ["Fraise", "Framboise", "Abricot", "Pêche", "Pomme", "Poire", "Rhubarbe", "Myrtille", "Cassis", "Cerise"];
const allergenOptions = ["Fruits à coque", "Sulfites", "Lait", "Œuf", "Soja", "Gluten"];

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

type SearchBarProps = {
  filters: FilterState;
  updateSearchTerm: (term: string) => void;
  updateSortBy: (value: string) => void;
  toggleFruitFilter: (fruit: string) => void;
  toggleAllergenFilter: (allergen: string) => void;
  updateMaxSugar: (value: number[]) => void;
  updateMinRating: (value: number[]) => void;
  updateMaxPrice: (value: number[]) => void;
  resetFilters: () => void;
  activeFilterCount: number;
};

const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  updateSearchTerm,
  updateSortBy,
  toggleFruitFilter,
  toggleAllergenFilter,
  updateMaxSugar,
  updateMinRating,
  updateMaxPrice,
  resetFilters,
  activeFilterCount,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-grow">
        <Input
          placeholder="Rechercher une confiture..."
          value={filters.searchTerm}
          onChange={(e) => updateSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex gap-2">
        <Select value={filters.sortBy} onValueChange={updateSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récentes</SelectItem>
            <SelectItem value="popular">Plus populaires</SelectItem>
            <SelectItem value="price_asc">Prix croissant</SelectItem>
            <SelectItem value="price_desc">Prix décroissant</SelectItem>
          </SelectContent>
        </Select>

        <FilterSheet
          fruitOptions={fruitOptions}
          allergenOptions={allergenOptions}
          filters={filters.filters}
          activeFilterCount={activeFilterCount}
          toggleFruitFilter={toggleFruitFilter}
          toggleAllergenFilter={toggleAllergenFilter}
          updateMaxSugar={updateMaxSugar}
          updateMinRating={updateMinRating}
          updateMaxPrice={updateMaxPrice}
          resetFilters={resetFilters}
        />
      </div>
    </div>
  );
};

export default SearchBar;
