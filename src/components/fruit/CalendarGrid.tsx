
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CalendarGridProps = {
  fruits: {
    id: string;
    name: string;
    image_url: string | null;
    seasons?: number[];
  }[];
};

const CalendarGrid: React.FC<CalendarGridProps> = ({ fruits }) => {
  // Create a mapping of months to fruits
  const monthsMap: Record<number, {id: string, name: string, image_url: string | null}[]> = {};
  
  // Populate the monthsMap
  fruits.forEach(fruit => {
    if (fruit.seasons && fruit.seasons.length > 0) {
      fruit.seasons.forEach(month => {
        if (!monthsMap[month]) {
          monthsMap[month] = [];
        }
        monthsMap[month].push({
          id: fruit.id,
          name: fruit.name,
          image_url: fruit.image_url
        });
      });
    }
  });
  
  // Fonction pour obtenir le nom du mois
  const getMonthName = (monthIndex: number) => {
    return format(new Date(2000, monthIndex - 1, 1), 'MMMM', { locale: fr });
  };

  // Fonction pour obtenir la saison du mois
  const getSeasonClass = (month: number): string => {
    if ([3, 4, 5].includes(month)) return "bg-green-50 border-green-200"; // Printemps
    if ([6, 7, 8].includes(month)) return "bg-yellow-50 border-yellow-200"; // Été
    if ([9, 10, 11].includes(month)) return "bg-amber-50 border-amber-200"; // Automne
    return "bg-blue-50 border-blue-200"; // Hiver (12, 1, 2)
  };

  // Fonction pour obtenir le badge de saison
  const getSeasonBadge = (month: number): JSX.Element => {
    if ([3, 4, 5].includes(month)) 
      return <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-none">Printemps</Badge>;
    if ([6, 7, 8].includes(month)) 
      return <Badge className="bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-none">Été</Badge>;
    if ([9, 10, 11].includes(month)) 
      return <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-none">Automne</Badge>;
    return <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-none">Hiver</Badge>;
  };

  // Render months in order (start with January)
  const months = Array.from({length: 12}, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {months.map((month) => (
        <Card key={month} className={`border-2 ${getSeasonClass(month)}`}>
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <div>
              <CardTitle className="capitalize">{getMonthName(month - 1)}</CardTitle>
              {monthsMap[month] ? (
                <p className="text-sm text-muted-foreground">
                  {monthsMap[month].length} fruit{monthsMap[month].length > 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Pas de fruits référencés</p>
              )}
            </div>
            {getSeasonBadge(month)}
          </CardHeader>
          <CardContent>
            {monthsMap[month] && monthsMap[month].length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {monthsMap[month].map((fruit) => (
                  <Link
                    key={fruit.id}
                    to={`/fruits/${fruit.id}`}
                    className="group"
                  >
                    <div className="border rounded-md p-2 h-full flex flex-col hover:bg-secondary/40 transition-colors">
                      <div className="aspect-square w-full overflow-hidden rounded-md mb-2">
                        {fruit.image_url ? (
                          <img 
                            src={fruit.image_url} 
                            alt={fruit.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-3xl">🍓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-center font-medium group-hover:text-foreground/90 transition-colors">
                        {fruit.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                Aucun fruit référencé pour ce mois
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CalendarGrid;
