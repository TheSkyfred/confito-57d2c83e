
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RecipeFilters as RecipeFiltersType } from '@/types/recipes';

interface RecipeSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: RecipeFiltersType;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  filters
}) => {
  const hasActiveFilters = Object.values(filters).some(f => 
    Array.isArray(f) ? f.length > 0 : f !== false && f !== 0 && f !== 120
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher par titre ou ingrédient..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Button 
        variant="outline" 
        onClick={() => setShowFilters(!showFilters)}
        className="md:w-auto w-full"
      >
        <Filter className="mr-2 h-4 w-4" />
        Filtres
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-2">
            Actifs
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default RecipeSearch;
