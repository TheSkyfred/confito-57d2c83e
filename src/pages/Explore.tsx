import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronDown, Sliders, SlidersHorizontal } from 'lucide-react';
import { JamType } from '@/types/supabase';

import JamCard from '@/components/JamCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Types
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

// Filtres statiques (en production, viendrait de la base de données)
const fruitOptions = ["Fraise", "Framboise", "Abricot", "Pêche", "Pomme", "Poire", "Rhubarbe", "Myrtille", "Cassis", "Cerise"];
const allergenOptions = ["Fruits à coque", "Sulfites", "Lait", "Œuf", "Soja", "Gluten"];

const Explore = () => {
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
      let query = supabase.from('jams')
        .select(`
          *,
          jam_images (*),
          profiles:creator_id (username, avatar_url),
          reviews (rating)
        `)
        .eq('is_active', true);
      
      // Appliquer les filtres
      if (filters.searchTerm) {
        query = query.ilike('name', `%${filters.searchTerm}%`);
      }
      
      // Filtrer par fruit si sélectionné
      if (filters.filters.fruit && filters.filters.fruit.length > 0) {
        query = query.contains('ingredients', filters.filters.fruit);
      }
      
      // Filtrer par allergènes (exclure ceux qui contiennent les allergènes sélectionnés)
      if (filters.filters.allergens && filters.filters.allergens.length > 0) {
        query = query.not('allergens', 'cs', `{${filters.filters.allergens.join(',')}}`);
      }
      
      // Filtre par prix max
      if (filters.filters.maxPrice) {
        query = query.lte('price_credits', filters.filters.maxPrice);
      }
      
      // Appliquer le tri
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
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Calculer les notes moyennes et filtrer par note minimale
      return data.map(jam => {
        const ratings = jam.reviews?.map((review: any) => review.rating) || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
          : 0;
          
        return {
          ...jam,
          avgRating
        };
      }).filter(jam => jam.avgRating >= (filters.filters.minRating || 0));
    },
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

  return (
    <div className="container py-8">
      <div className="flex flex-col mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2">
          Découvrir les confitures
        </h1>
        <p className="text-muted-foreground">
          Explorez notre collection de confitures artisanales et trouvez votre prochain coup de cœur
        </p>
      </div>

      {/* Barre de recherche et filtres */}
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

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-jam-raspberry text-white text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>
                  Affinez votre recherche avec nos filtres
                </SheetDescription>
              </SheetHeader>

              <div className="py-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="fruit">
                    <AccordionTrigger>Fruits</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2">
                        {fruitOptions.map(fruit => (
                          <div key={fruit} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`fruit-${fruit}`} 
                              checked={filters.filters.fruit?.includes(fruit)}
                              onCheckedChange={() => toggleFruitFilter(fruit)}
                            />
                            <label htmlFor={`fruit-${fruit}`} className="text-sm cursor-pointer">
                              {fruit}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="allergens">
                    <AccordionTrigger>Allergènes (exclure)</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2">
                        {allergenOptions.map(allergen => (
                          <div key={allergen} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`allergen-${allergen}`} 
                              checked={filters.filters.allergens?.includes(allergen)}
                              onCheckedChange={() => toggleAllergenFilter(allergen)}
                            />
                            <label htmlFor={`allergen-${allergen}`} className="text-sm cursor-pointer">
                              {allergen}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="sugar">
                    <AccordionTrigger>Teneur en sucre max</AccordionTrigger>
                    <AccordionContent>
                      <div className="px-1">
                        <Slider
                          defaultValue={[100]}
                          max={100}
                          step={5}
                          value={[filters.filters.maxSugar || 100]}
                          onValueChange={updateMaxSugar}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-sm">{filters.filters.maxSugar}% max</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="rating">
                    <AccordionTrigger>Note minimale</AccordionTrigger>
                    <AccordionContent>
                      <div className="px-1">
                        <Slider
                          defaultValue={[0]}
                          max={5}
                          step={0.5}
                          value={[filters.filters.minRating || 0]}
                          onValueChange={updateMinRating}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-sm">Min: {filters.filters.minRating} étoiles</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="price">
                    <AccordionTrigger>Prix maximum</AccordionTrigger>
                    <AccordionContent>
                      <div className="px-1">
                        <Slider
                          defaultValue={[50]}
                          max={50}
                          step={1}
                          value={[filters.filters.maxPrice || 50]}
                          onValueChange={updateMaxPrice}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-sm">Max: {filters.filters.maxPrice} crédits</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="secondary" onClick={resetFilters}>Réinitialiser les filtres</Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button className="bg-jam-raspberry hover:bg-jam-raspberry/90">
                    Appliquer les filtres
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Filtres actifs */}
      {activeFilterCount > 0 && (
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
      )}

      {/* Résultats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-destructive">Une erreur est survenue lors du chargement des confitures.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Réessayer
          </Button>
        </div>
      ) : jams && jams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {jams.map((jam: JamType) => (
            <Link to={`/jam/${jam.id}`} key={jam.id}>
              <JamCard jam={jam} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Aucune confiture ne correspond à vos critères.</p>
          <Button onClick={resetFilters} variant="outline" className="mt-4">
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};

export default Explore;
