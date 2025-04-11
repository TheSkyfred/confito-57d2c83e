
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowRight, Calendar, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { supabaseDirect } from '@/utils/supabaseAdapter';

interface FruitData {
  id: string;
  name: string;
  family: string | null;
  description: string | null;
  image_url: string | null;
  conservation_tips: string | null;
  cooking_tips: string | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string;
}

const SeasonalSection = () => {
  // Obtenir le mois actuel (1-12)
  const currentMonth = new Date().getMonth() + 1;
  const monthName = format(new Date(), 'MMMM', { locale: fr });
  
  const { data: seasonalFruits, isLoading } = useQuery({
    queryKey: ['seasonalFruits', currentMonth],
    queryFn: async () => {
      // Utiliser la table seasonal_fruits
      const { data: fruits, error } = await supabaseDirect.select<FruitData>(
        'seasonal_fruits',
        '*'
      );
      
      if (error) throw error;
      
      // Filtrer les fruits qui sont de saison ce mois-ci
      // On utilise une structure de table différente où chaque mois est une colonne
      const monthColumn = getMonthColumn(currentMonth);
      const inSeason = fruits.filter(fruit => fruit[monthColumn as keyof FruitData] === true);
      
      return inSeason;
    },
  });
  
  // Fonction pour obtenir le nom de la colonne du mois
  const getMonthColumn = (month: number): string => {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return months[month - 1];
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold flex items-center gap-2">
              <Skeleton className="h-8 w-56" />
            </h2>
            <Skeleton className="h-10 w-32" />
          </div>
          <Carousel>
            <CarouselContent>
              {Array(4).fill(0).map((_, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg" />
                    <CardContent className="pt-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                      <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>
    );
  }

  if (!seasonalFruits || seasonalFruits.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-jam-raspberry" />
            Fruits de saison en {monthName}
          </h2>
          <Button variant="outline" asChild>
            <Link to="/seasonal-fruits">
              Calendrier des fruits
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <Carousel>
          <CarouselContent>
            {seasonalFruits.map((fruit) => (
              <CarouselItem key={fruit.id} className="md:basis-1/2 lg:basis-1/3">
                <Link to={`/fruits/${fruit.id}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 overflow-hidden">
                      {fruit.image_url ? (
                        <img 
                          src={fruit.image_url} 
                          alt={fruit.name} 
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                          <Apple className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <CardTitle className="text-lg">{fruit.name}</CardTitle>
                      {fruit.family && (
                        <CardDescription className="text-sm italic">
                          Famille : {fruit.family}
                        </CardDescription>
                      )}
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                        {fruit.description || `Découvrez les meilleures façons de cuisiner et conserver ${fruit.name}.`}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:flex">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default SeasonalSection;
