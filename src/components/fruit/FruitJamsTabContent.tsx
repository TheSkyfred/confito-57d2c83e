
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Jam {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  badges?: string[];
  price_credits?: number;
  available_quantity?: number;
  status?: string;
  creator?: {
    username: string;
  };
}

interface FruitJamsTabContentProps {
  fruitName: string;
  jams: Jam[] | null;
  loadingJams: boolean;
}

const FruitJamsTabContent: React.FC<FruitJamsTabContentProps> = ({ 
  fruitName,
  jams,
  loadingJams 
}) => {
  if (loadingJams) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden border">
              <div className="animate-pulse">
                <Skeleton className="h-40 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-4/5 mb-2" />
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!jams || jams.length === 0) {
    return <p className="text-muted-foreground">Aucune confiture liée à ce fruit pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Confitures à base de {fruitName}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jams.map((jam) => (
          <Card key={jam.id} className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
              {jam.image_url ? (
                <img 
                  src={jam.image_url} 
                  alt={jam.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 text-muted-foreground flex items-center justify-center">
                  🍯
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{jam.name}</CardTitle>
              <div className="flex flex-wrap gap-1 mt-1">
                {jam.badges && jam.badges.map((badge: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">{badge}</Badge>
                ))}
              </div>
              <CardDescription className="text-sm">
                Par {jam.creator?.username || 'Confiturier anonyme'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm line-clamp-2">{jam.description}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium">{jam.price_credits} crédits</span>
                {jam.available_quantity ? (
                  <span className="ml-2 text-green-600">• Disponible ({jam.available_quantity})</span>
                ) : (
                  <span className="ml-2 text-red-500">• Rupture de stock</span>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/jam/${jam.id}`}>
                  Voir la confiture
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FruitJamsTabContent;
