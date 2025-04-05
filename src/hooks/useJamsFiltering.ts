import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getTypedSupabaseQuery } from '@/utils/supabaseHelpers';
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
  
  // Charge les confitures
  const { data: jams, isLoading, error } = useQuery({
    queryKey: ['jams', filters],
    queryFn: async () => {
      console.log("Début de la requête Supabase pour les confitures");
      try {
        let query = getTypedSupabaseQuery('jams')
          .select(`
            *,
            jam_images (*),
            profiles:creator_id (username, avatar_url),
            reviews (rating)
          `)
          .eq('is_active', true);
        
        console.log("Requête initiale construite");
        
        // Appliquer les filtres
        if (filters.searchTerm) {
          console.log("Filtrage par terme de recherche:", filters.searchTerm);
          query = query.ilike('name', `%${filters.searchTerm}%`);
        }
        
        // Filtrer par fruit si sélectionné
        if (filters.filters.fruit && filters.filters.fruit.length > 0) {
          console.log("Filtrage par fruits:", filters.filters.fruit);
          for (const fruit of filters.filters.fruit) {
            query = query.contains('ingredients', [fruit]);
          }
        }
        
        // Filtrer par allergènes (exclure ceux qui contiennent les allergènes sélectionnés)
        if (filters.filters.allergens && filters.filters.allergens.length > 0) {
          console.log("Filtrage par allergènes:", filters.filters.allergens);
          query = query.not('allergens', 'cs', `{${filters.filters.allergens.join(',')}}`);
        }
        
        // Filtre par prix max
        if (filters.filters.maxPrice !== undefined && filters.filters.maxPrice < 50) {
          console.log("Filtrage par prix max:", filters.filters.maxPrice);
          query = query.lte('price_credits', filters.filters.maxPrice);
        }
        
        // Appliquer le tri
        console.log("Application du tri:", filters.sortBy);
        switch (filters.sortBy) {
          case 'price_asc':
            query = query.order('price_credits', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price_credits', { ascending: false });
            break;
          case 'popular':
            // En production, utiliserait une métrique de popularité
            query = query.order('available_quantity', { ascending: false });
            break;
          case 'recent':
          default:
            query = query.order('created_at', { ascending: false });
        }
        
        console.log("Exécution de la requête Supabase");
        const { data, error } = await query;
        
        if (error) {
          console.error("Erreur Supabase:", error);
          throw error;
        }
        
        if (!data) {
          console.log("Aucune donnée retournée par Supabase");
          return [];
        }
        
        console.log(`${data.length} confitures trouvées`);
        
        // Calculer les notes moyennes et filtrer par note minimale
        const processedJams = data.map((jam: any) => {
          const ratings = jam.reviews?.map((review: any) => review.rating) || [];
          const avgRating = ratings.length > 0 
            ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
            : 0;
            
          return {
            ...jam,
            avgRating
          } as JamType;
        });
        
        const filteredJams = processedJams.filter((jam: JamType) => 
          (jam.avgRating || 0) >= (filters.filters.minRating || 0)
        );
        
        console.log(`${filteredJams.length} confitures après filtrage par note`);
        return filteredJams;
      } catch (error) {
        console.error("Erreur lors de la récupération des confitures:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les confitures",
          variant: "destructive"
        });
        throw error;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
    resetFilters
  };
};
