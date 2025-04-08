
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, CalendarDays, ChevronRight } from "lucide-react";

type FruitCardProps = {
  fruit: {
    id: string;
    name: string;
    description: string | null;
    conservation_tips: string | null;
    image_url: string | null;
    family: string | null;
    tags?: string[];
    seasons?: number[];
  };
};

const FruitCard: React.FC<FruitCardProps> = ({ fruit }) => {
  // Fonction pour obtenir le nom du mois
  const getMonthName = (monthIndex: number) => {
    return format(new Date(2000, monthIndex - 1, 1), 'MMM', { locale: fr });
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-0">
        <CardTitle>{fruit.name}</CardTitle>
        <CardDescription>
          {fruit.family || "Fruit de saison"}
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
        
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Saison : 
          </span>
          <div className="flex flex-wrap gap-1">
            {fruit.seasons && fruit.seasons.length > 0 ? (
              fruit.seasons
                .sort((a, b) => a - b)
                .slice(0, 3)
                .map((month) => (
                  <Badge 
                    key={month}
                    variant="outline"
                    className="text-xs capitalize"
                  >
                    {getMonthName(month)}
                  </Badge>
                ))
            ) : (
              <span className="text-xs text-muted-foreground">Non spécifiée</span>
            )}
            {fruit.seasons && fruit.seasons.length > 3 && (
              <Badge variant="outline" className="text-xs">+{fruit.seasons.length - 3}</Badge>
            )}
          </div>
        </div>
        
        {fruit.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {fruit.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/fruits/${fruit.id}`}>
            Voir détails
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FruitCard;
