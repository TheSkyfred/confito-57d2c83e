
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { supabaseDirect } from '@/utils/supabaseAdapter';

const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1; // JavaScript months are 0-indexed
};

const monthToField = (month: number): string => {
  const fields = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return fields[month - 1];
};

const SeasonalSection = () => {
  const currentMonth = getCurrentMonth();
  const monthField = monthToField(currentMonth);
  
  const { data: seasonalFruits, isLoading } = useQuery({
    queryKey: ['seasonalFruits', currentMonth],
    queryFn: async () => {
      const { data, error } = await supabaseDirect.select(
        'seasonal_fruits',
        `id, name, image_url, description`
      );
      
      if (error) throw error;
      
      // Filtrer pour ne garder que les fruits de saison pour le mois en cours
      return data.filter(fruit => fruit[monthField] === true).slice(0, 3);
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
            <Link to="/calendar">
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
                    <img 
                      src={fruit.image_url || '/placeholder.svg'} 
                      alt={fruit.name} 
                      className="w-full h-full object-cover"
                    />
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
                Aucun fruit de saison n'est disponible pour le moment.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/calendar">
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
