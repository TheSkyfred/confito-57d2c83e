
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJams } from '@/utils/supabaseHelpers';
import { JamType } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

export type FilterState = {
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

export const useJamsFiltering = () => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    sortBy: 'recent',
    filters: {
      fruit: [],
      allergens: [],
      maxSugar: 100,
      minRating: 0,
      maxPrice: 50
    }
  });
  
  const [retryCount, setRetryCount] = useState(0);
  
  const refreshData = useCallback(() => {
    setRetryCount(prev => prev + 1);
    toast({
      title: "Rafraîchissement",
      description: "Tentative de récupération des données...",
    });
  }, []);
  
  const { data: allJams, isLoading, error } = useQuery({
    queryKey: ['jams', filters, retryCount],
    queryFn: async () => {
      console.log("Début de la requête pour les confitures");
      
      const { jams, error } = await getJams();
      
      if (error) {
        console.error("Erreur lors de la récupération des confitures:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les confitures",
          variant: "destructive"
        });
        throw error;
      }
      
      if (!jams) {
        console.log("Aucune confiture retournée");
        return [];
      }
      
      console.log(`${jams.length} confitures récupérées avant filtrage`);
      return jams;
    },
    retry: 2,
    staleTime: 1000 * 30, // 30 secondes
  });
  
  const jams = useMemo(() => {
    if (!allJams) return [];
    
    let filteredJams = [...allJams];
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredJams = filteredJams.filter(jam => 
        jam.name.toLowerCase().includes(searchLower) || 
        (jam.description && jam.description.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.filters.fruit && filters.filters.fruit.length > 0) {
      filteredJams = filteredJams.filter(jam => {
        if (!jam.ingredients) return false;
        return filters.filters.fruit!.some(fruit => 
          jam.ingredients.includes(fruit)
        );
      });
    }
    
    if (filters.filters.allergens && filters.filters.allergens.length > 0) {
      filteredJams = filteredJams.filter(jam => {
        if (!jam.allergens) return true;
        return !filters.filters.allergens!.some(allergen => 
          jam.allergens?.includes(allergen)
        );
      });
    }
    
    if (filters.filters.maxPrice !== undefined && filters.filters.maxPrice < 50) {
      filteredJams = filteredJams.filter(jam => 
        jam.price_credits <= filters.filters.maxPrice!
      );
    }
    
    if (filters.filters.minRating !== undefined && filters.filters.minRating > 0) {
      filteredJams = filteredJams.filter(jam => 
        (jam.avgRating || 0) >= filters.filters.minRating!
      );
    }
    
    filteredJams.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price_credits - b.price_credits;
        case 'price_desc':
          return b.price_credits - a.price_credits;
        case 'popular':
          return (b.avgRating || 0) - (a.avgRating || 0);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    console.log(`${filteredJams.length} confitures après filtrage`);
    return filteredJams;
  }, [allJams, filters]);
  
  const updateSearchTerm = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };
  
  const updateSortBy = (value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
  };
  
  const toggleFruitFilter = (fruit: string) => {
    setFilters(prev => {
      const currentFruits = prev.filters.fruit || [];
      const newFruits = currentFruits.includes(fruit)
        ? currentFruits.filter(f => f !== fruit)
        : [...currentFruits, fruit];
        
      return {
        ...prev,
        filters: {
          ...prev.filters,
          fruit: newFruits
        }
      };
    });
  };
  
  const toggleAllergenFilter = (allergen: string) => {
    setFilters(prev => {
      const currentAllergens = prev.filters.allergens || [];
      const newAllergens = currentAllergens.includes(allergen)
        ? currentAllergens.filter(a => a !== allergen)
        : [...currentAllergens, allergen];
        
      return {
        ...prev,
        filters: {
          ...prev.filters,
          allergens: newAllergens
        }
      };
    });
  };
  
  const updateMaxSugar = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        maxSugar: value[0]
      }
    }));
  };
  
  const updateMinRating = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        minRating: value[0]
      }
    }));
  };
  
  const updateMaxPrice = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        maxPrice: value[0]
      }
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      sortBy: 'recent',
      filters: {
        fruit: [],
        allergens: [],
        maxSugar: 100,
        minRating: 0,
        maxPrice: 50
      }
    });
  };
  
  const activeFilterCount = 
    (filters.filters.fruit?.length || 0) +
    (filters.filters.allergens?.length || 0) +
    (filters.filters.maxSugar !== 100 ? 1 : 0) +
    (filters.filters.minRating !== 0 ? 1 : 0) +
    (filters.filters.maxPrice !== 50 ? 1 : 0);

  return {
    jams,
    isLoading,
    error,
    filters,
    activeFilterCount,
    updateSearchTerm,
    updateSortBy,
    toggleFruitFilter,
    toggleAllergenFilter,
    updateMaxSugar,
    updateMinRating,
    updateMaxPrice,
    resetFilters,
    refreshData
  };
};
