
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Leaf,
  InfoIcon,
  ChevronRight
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

type Fruit = {
  id: string;
  name: string;
  description: string | null;
  conservation_tips: string | null;
  image_url: string | null;
  jan: boolean;
  feb: boolean;
  mar: boolean;
  apr: boolean;
  may: boolean;
  jun: boolean;
  jul: boolean;
  aug: boolean;
  sep: boolean;
  oct: boolean;
  nov: boolean;
  dec: boolean;
};

const SeasonalCalendar = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  
  // Fetch seasonal fruits
  const { data: fruits, isLoading, error } = useQuery({
    queryKey: ['seasonalFruits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasonal_fruits')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
  
  // Map month index to database field name
  const monthFields = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];
  
  // Get fruits in season for the selected month
  const fruitsInSeason = fruits?.filter((fruit: Fruit) => {
    return fruit[monthFields[selectedMonth] as keyof Fruit] === true;
  }) || [];

  // Get month name
  const getMonthName = (monthIndex: number) => {
    return format(new Date(2000, monthIndex, 1), 'MMMM', { locale: fr });
  };

  // Handle month selection
  const selectMonth = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
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
      </div>

      {/* Month selector */}
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-8">
        {monthFields.map((_, index) => {
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
          <h2 className="text-2xl font-serif font-medium mb-6">
            Fruits disponibles en {getMonthName(selectedMonth)}
            <Badge variant="outline" className="ml-2">
              {fruitsInSeason.length} fruit{fruitsInSeason.length > 1 ? 's' : ''}
            </Badge>
          </h2>
          
          {fruitsInSeason.length === 0 ? (
            <Card className="my-8">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">
                  Aucun fruit référencé pour ce mois.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fruitsInSeason.map((fruit: Fruit) => (
                <Card key={fruit.id} className="overflow-hidden">
                  <CardHeader className="pb-0">
                    <CardTitle>{fruit.name}</CardTitle>
                    <CardDescription>
                      Fruit de saison
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {fruit.image_url ? (
                      <img 
                        src={fruit.image_url} 
                        alt={fruit.name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center rounded-md mb-4">
                        <Leaf className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {fruit.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {fruit.description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm">
                            <InfoIcon className="h-4 w-4 mr-1" />
                            Période de récolte
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="p-3 bg-white">
                          <div className="flex flex-wrap gap-1">
                            {monthFields.map((month, idx) => (
                              <Badge 
                                key={month}
                                variant={fruit[month as keyof Fruit] ? "default" : "outline"}
                                className={fruit[month as keyof Fruit] ? "bg-jam-leaf" : "text-muted-foreground"}
                              >
                                {getMonthName(idx).slice(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {fruit.conservation_tips && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Conservation
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Conservation du {fruit.name.toLowerCase()}</DialogTitle>
                            <DialogDescription>
                              Conseils pour conserver au mieux ce fruit
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground">
                              {fruit.conservation_tips}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeasonalCalendar;
