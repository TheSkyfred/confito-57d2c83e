
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, ArrowRight, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FruitType, FruitSeasonType } from '@/types/supabase';
import { Skeleton } from '@/components/ui/skeleton';

const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1; // JavaScript months are 0-indexed
};

const monthToField = (month: number): string => {
  const fields = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return fields[month - 1];
};

const getMonthName = (monthIndex: number): string => {
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  return monthNames[monthIndex - 1];
};

// Define a more specific return type for the query
type SeasonalFruit = FruitType & { seasons?: number[] };

const SeasonalSection = () => {
  const currentMonth = getCurrentMonth();
  const monthField = monthToField(currentMonth);
  
  const { data: seasonalFruits, isLoading } = useQuery<SeasonalFruit[]>({
    queryKey: ['seasonalFruits', currentMonth],
    queryFn: async () => {
      try {
        // Get fruits with seasons for the current month
        const { data: seasonData, error: seasonError } = await supabase
          .from('fruit_seasons')
          .select('fruit_id')
          .eq(monthField, true);

        if (seasonError) throw seasonError;

        // If no seasonal fruits found, return empty array
        if (!seasonData || seasonData.length === 0) return [] as SeasonalFruit[];

        // Extract fruit IDs safely
        const fruitIds = seasonData
          .map(season => season.fruit_id)
          .filter(id => id !== null) as string[];
        
        if (fruitIds.length === 0) return [] as SeasonalFruit[];
        
        // Get the fruit details
        const { data: fruitsData, error: fruitsError } = await supabase
          .from('fruits')
          .select('id, name, image_url, description')
          .in('id', fruitIds)
          .filter('is_published', 'eq', true)
          .limit(3);
          
        if (fruitsError) throw fruitsError;
        
        return (fruitsData || []) as SeasonalFruit[];
      } catch (error) {
        console.error("Error fetching seasonal fruits:", error);
        return [] as SeasonalFruit[];
      }
    },
  });

  return (
    <section className="py-16 bg-gradient-to-br from-jam-honey/10 to-white">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-5 w-5 text-jam-raspberry" />
              <h2 className="text-3xl font-serif font-bold">Fruits de saison</h2>
            </div>
            <p className="text-muted-foreground">
              Découvrez les fruits du moment pour vos confitures
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/seasonal">
              Calendrier complet
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="rounded-full bg-gray-200 w-20 h-20 mx-auto mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : seasonalFruits && seasonalFruits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seasonalFruits.map(fruit => (
              <Card key={fruit.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-jam-honey/20">
                    {fruit.image_url ? (
                      <img 
                        src={fruit.image_url || '/placeholder.svg'} 
                        alt={fruit.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Leaf className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{fruit.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {fruit.description || `Parfait pour vos confitures de ${fruit.name}.`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Aucun fruit de saison n'est disponible pour {getMonthName(currentMonth)}.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/seasonal">
                  Consulter le calendrier
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default SeasonalSection;
