
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";
import FruitSeasonality from './FruitSeasonality';

interface FruitSeasonalityCardProps {
  seasons: number[] | undefined;
  loadingSeasons: boolean;
}

export const FruitSeasonalityCard: React.FC<FruitSeasonalityCardProps> = ({
  seasons,
  loadingSeasons
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center">
          <CalendarDays className="h-5 w-5 mr-2 text-primary" />
          <CardTitle>Saisonnalité</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loadingSeasons ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <FruitSeasonality 
            seasons={seasons}
            loadingSeasons={loadingSeasons}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default FruitSeasonalityCard;
