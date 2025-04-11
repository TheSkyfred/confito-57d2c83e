import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import { AdviceFilters } from '@/types/advice';

interface AdviceSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: AdviceFilters;
}

const AdviceSearch: React.FC<AdviceSearchProps> = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  filters
}) => {
  const hasActiveFilters = 
    (filters.type && filters.type.length > 0) || 
    filters.hasVideo || 
    filters.hasProducts;

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher un conseil..." 
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
        <SlidersHorizontal className="mr-2 h-4 w-4" />
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

export default AdviceSearch;
