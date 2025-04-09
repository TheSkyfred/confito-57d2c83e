
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FruitSeasonalityProps {
  seasons: number[] | undefined;
  loadingSeasons: boolean;
}

export const FruitSeasonality: React.FC<FruitSeasonalityProps> = ({ 
  seasons, 
  loadingSeasons 
}) => {
  // Function to get month name
  const getMonthName = (monthIndex: number) => {
    return format(new Date(2000, monthIndex - 1, 1), 'MMMM', { locale: fr });
  };

  // Group months by season
  const getSeason = (month: number): string => {
    if ([3, 4, 5].includes(month)) return "Printemps";
    if ([6, 7, 8].includes(month)) return "Été";
    if ([9, 10, 11].includes(month)) return "Automne";
    return "Hiver"; // 12, 1, 2
  };

  const seasonGroups = seasons ? seasons.reduce((acc: Record<string, number[]>, month: number) => {
    const season = getSeason(month);
    if (!acc[season]) acc[season] = [];
    acc[season].push(month);
    return acc;
  }, {}) : {};

  if (loadingSeasons) {
    return <p className="text-muted-foreground">Chargement des informations de saison...</p>;
  }

  if (!seasons || seasons.length === 0) {
    return <p className="text-muted-foreground">Information non disponible</p>;
  }

  return (
    <div className="space-y-3">
      {Object.entries(seasonGroups).map(([season, months]) => (
        <div key={`season-${season}`} className="rounded-md p-3 bg-secondary/50">
          <p className="font-medium mb-1">{season}</p>
          <div className="flex flex-wrap gap-1">
            {months.map((month) => (
              <Badge key={`month-${season}-${month}`} variant="secondary" className="capitalize">
                {getMonthName(month)}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FruitSeasonality;
