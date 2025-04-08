
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Leaf,
  InfoIcon,
  ChevronRight,
  Search,
  Filter,
  ListFilter,
  Grid,
  X,
  Book,
  Tag,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from '@/components/ui/toggle';
import { useUserRole } from '@/hooks/useUserRole';
import FruitCard from '@/components/fruit/FruitCard';
import CalendarGrid from '@/components/fruit/CalendarGrid';

type Fruit = {
  id: string;
  name: string;
  description: string | null;
  conservation_tips: string | null;
  image_url: string | null;
  family: string | null;
  tags?: string[];
  seasons?: number[];
};

type Season = "printemps" | "été" | "automne" | "hiver" | "toutes";

const SeasonalCalendar = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<Season>('toutes');
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const { isAdmin, isModerator } = useUserRole();
  
  // Fetch seasonal fruits with associated tags and seasons
  const { data: fruits, isLoading, error } = useQuery({
    queryKey: ['seasonalFruits', selectedMonth, searchTerm, selectedSeason, selectedFamily],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fruits')
        .select('*')
        .eq('is_published', true)
        .order('name');

      if (error) throw error;

      // For each fruit, get its seasons and tags
      const fruitsWithDetails = await Promise.all(
        data.map(async (fruit) => {
          // Get seasons
          const { data: seasons } = await supabase
            .from('fruit_seasons')
            .select('month')
            .eq('fruit_id', fruit.id)
            .order('month');

          // Get tags
          const { data: tags } = await supabase
            .from('fruit_tags')
            .select('tag')
            .eq('fruit_id', fruit.id);

          return {
            ...fruit,
            seasons: seasons?.map(s => s.month) || [],
            tags: tags?.map(t => t.tag) || []
          };
        })
      );

      return fruitsWithDetails as Fruit[];
    },
  });

  // Get fruits in season based on filters
  const filteredFruits = React.useMemo(() => {
    if (!fruits) return [];

    return fruits.filter((fruit: Fruit) => {
      // Filter by month if not in season view
      const matchesMonth = selectedSeason === 'toutes' 
        ? true 
        : fruit.seasons?.some(month => {
            if (selectedSeason === 'printemps') return [3, 4, 5].includes(month);
            if (selectedSeason === 'été') return [6, 7, 8].includes(month);
            if (selectedSeason === 'automne') return [9, 10, 11].includes(month);
            if (selectedSeason === 'hiver') return [12, 1, 2].includes(month);
            return false;
          });

      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        fruit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (fruit.description && fruit.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fruit.family && fruit.family.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fruit.tags && fruit.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      // Filter by family
      const matchesFamily = selectedFamily === '' || fruit.family === selectedFamily;

      return matchesMonth && matchesSearch && matchesFamily;
    });
  }, [fruits, selectedMonth, searchTerm, selectedSeason, selectedFamily]);

  // Get fruits in season for the selected month only
  const fruitsInMonth = React.useMemo(() => {
    if (!fruits) return [];
    
    return fruits.filter((fruit: Fruit) => {
      return fruit.seasons?.includes(selectedMonth + 1);
    });
  }, [fruits, selectedMonth]);

  // Get unique families for the filter
  const families = React.useMemo(() => {
    if (!fruits) return [];
    
    return Array.from(
      new Set(
        fruits
          .map((fruit: Fruit) => fruit.family)
          .filter(Boolean) as string[]
      )
    ).sort();
  }, [fruits]);

  // Get month name
  const getMonthName = (monthIndex: number) => {
    return format(new Date(2000, monthIndex, 1), 'MMMM', { locale: fr });
  };

  // Handle month selection
  const selectMonth = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setSelectedSeason('toutes');
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSeason('toutes');
    setSelectedFamily('');
  };

  return (
    <div className="container py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-jam-leaf" />
            <h1 className="font-serif text-3xl font-bold">
              Calendrier des fruits de saison
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Découvrez les fruits disponibles chaque mois pour réaliser vos meilleures confitures
          </p>
        </div>
        
        {(isAdmin || isModerator) && (
          <Button asChild>
            <Link to="/admin/fruits">
              Gérer les fruits
            </Link>
          </Button>
        )}
      </div>

      {/* Filtre et recherche */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un fruit..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedSeason} onValueChange={(value: Season) => setSelectedSeason(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Saison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toutes">Toutes les saisons</SelectItem>
                <SelectItem value="printemps">Printemps</SelectItem>
                <SelectItem value="été">Été</SelectItem>
                <SelectItem value="automne">Automne</SelectItem>
                <SelectItem value="hiver">Hiver</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedFamily} onValueChange={setSelectedFamily}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Famille" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les familles</SelectItem>
                {families.map(family => (
                  <SelectItem key={family} value={family || "unknown"}>
                    {family}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {(searchTerm || selectedSeason !== 'toutes' || selectedFamily) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Effacer les filtres
              </Button>
            )}
            {filteredFruits.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {filteredFruits.length} fruit{filteredFruits.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Toggle
              variant="outline"
              aria-label="View as grid"
              pressed={viewMode === 'grid'}
              onPressedChange={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Toggle>
            <Toggle
              variant="outline"
              aria-label="View as list"
              pressed={viewMode === 'list'}
              onPressedChange={() => setViewMode('list')}
            >
              <ListFilter className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
      </div>

      {/* Month selector - only shown when in grid mode and no seasonal filter */}
      {viewMode === 'grid' && selectedSeason === 'toutes' && (
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-8">
          {Array.from({length: 12}).map((_, index) => {
            const isCurrentMonth = index === selectedMonth;
            const isCurrentRealMonth = index === new Date().getMonth();
            
            return (
              <Button
                key={index}
                variant={isCurrentMonth ? "default" : "outline"}
                className={`
                  ${isCurrentMonth ? 'bg-jam-leaf text-white hover:bg-jam-leaf/90' : ''}
                  ${isCurrentRealMonth && !isCurrentMonth ? 'border-jam-leaf text-jam-leaf' : ''}
                `}
                onClick={() => selectMonth(index)}
              >
                {getMonthName(index)}
              </Button>
            );
          })}
        </div>
      )}

      {/* Affichage des fruits */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full rounded-md" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="my-8">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-destructive">
              Une erreur est survenue lors du chargement des données.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          {viewMode === 'grid' && selectedSeason === 'toutes' ? (
            <>
              <h2 className="text-2xl font-serif font-medium mb-6">
                Fruits disponibles en {getMonthName(selectedMonth)}
                <Badge variant="outline" className="ml-2">
                  {fruitsInMonth.length} fruit{fruitsInMonth.length > 1 ? 's' : ''}
                </Badge>
              </h2>
              
              {fruitsInMonth.length === 0 ? (
                <Card className="my-8">
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-muted-foreground">
                      Aucun fruit référencé pour ce mois.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fruitsInMonth.map((fruit: Fruit) => (
                    <FruitCard key={fruit.id} fruit={fruit} />
                  ))}
                </div>
              )}
            </>
          ) : viewMode === 'grid' ? (
            <>
              <h2 className="text-2xl font-serif font-medium mb-6">
                {selectedSeason === 'toutes' ? 'Tous les fruits' : `Fruits de ${selectedSeason}`}
                <Badge variant="outline" className="ml-2">
                  {filteredFruits.length} fruit{filteredFruits.length > 1 ? 's' : ''}
                </Badge>
              </h2>
              
              {filteredFruits.length === 0 ? (
                <Card className="my-8">
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-muted-foreground">
                      Aucun fruit ne correspond à vos critères de recherche.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFruits.map((fruit: Fruit) => (
                    <FruitCard key={fruit.id} fruit={fruit} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <CalendarGrid fruits={filteredFruits as any} />
          )}
        </div>
      )}
    </div>
  );
};

export default SeasonalCalendar;
