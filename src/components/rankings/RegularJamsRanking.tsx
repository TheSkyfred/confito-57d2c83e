
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpRight, ShoppingCart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Medal } from 'lucide-react';

interface Jam {
  id: string;
  name: string;
  creator_id: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
  jam_images: Array<{
    url: string;
  }>;
  review_count: number;
  avg_rating: number;
  sale_count: number;
  ingredients?: Array<{name: string, quantity: string}> | string[];
}

interface RegularJamsRankingProps {
  jams: Jam[] | undefined;
  isLoading: boolean;
}

const getJamRankBadge = (index: number) => {
  switch (index) {
    case 0:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 1:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 2:
      return <Medal className="h-6 w-6 text-amber-700" />;
    default:
      return <Badge variant="outline">{index + 1}</Badge>;
  }
};

const safeToFixed = (value: number | undefined | null, digits: number = 1): string => {
  if (value === undefined || value === null) return '0.0';
  return value.toFixed(digits);
};

// Function to get ingredient name based on type
const getIngredientName = (ingredient: any): string => {
  // Si c'est une chaîne simple
  if (typeof ingredient === 'string' && !ingredient.includes('{')) {
    return ingredient;
  }
  
  // Si c'est un objet
  if (typeof ingredient === 'object' && ingredient !== null) {
    if (ingredient.name) {
      // Handle nested stringified objects
      if (typeof ingredient.name === 'string' && ingredient.name.includes('{')) {
        try {
          const parsedName = JSON.parse(ingredient.name);
          if (parsedName.name) {
            if (typeof parsedName.name === 'string' && parsedName.name.includes('{')) {
              try {
                const deeperParsed = JSON.parse(parsedName.name);
                if (deeperParsed.name) {
                  return deeperParsed.name;
                }
              } catch (e) {
                return parsedName.name;
              }
            }
            return parsedName.name;
          }
        } catch (e) {
          return ingredient.name;
        }
      }
      return ingredient.name;
    }
  }
  
  // Si c'est une chaîne qui contient un objet JSON
  if (typeof ingredient === 'string' && ingredient.includes('{')) {
    try {
      const parsed = JSON.parse(ingredient);
      if (parsed.name) {
        // Handle deeper nesting
        if (typeof parsed.name === 'string' && parsed.name.includes('{')) {
          try {
            const deeperParsed = JSON.parse(parsed.name);
            if (deeperParsed.name) {
              return deeperParsed.name;
            }
          } catch (e) {
            return parsed.name;
          }
        }
        return parsed.name;
      }
    } catch (e) {
      // Si le parsing échoue, retourner la chaîne originale
    }
  }
  
  // Fallback
  return String(ingredient);
};

const RegularJamsRanking: React.FC<RegularJamsRankingProps> = ({ jams, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jams?.map((jam: Jam, index: number) => (
        <Card key={jam.id} className={index < 3 ? "border-jam-honey" : ""}>
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="flex items-center justify-center w-10 mr-4">
                {getJamRankBadge(index)}
              </div>
              <div className="flex-shrink-0 mr-4">
                <img 
                  src={jam.jam_images?.[0]?.url || '/placeholder.svg'} 
                  alt={jam.name}
                  className="h-16 w-16 object-cover rounded-md"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium">{jam.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Avatar className="h-4 w-4 mr-1">
                    <AvatarImage src={jam.profile?.avatar_url || undefined} />
                    <AvatarFallback>{jam.profile?.username?.[0]?.toUpperCase() || 'J'}</AvatarFallback>
                  </Avatar>
                  <span>{jam.profile?.username || 'Utilisateur'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center mb-1">
                  <Star className="h-4 w-4 text-jam-honey fill-jam-honey mr-1" />
                  <span className="font-medium">{safeToFixed(jam.avg_rating)}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({jam.review_count || 0})
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  <span>{jam.sale_count} vendu{jam.sale_count > 1 ? 's' : ''}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild className="ml-2">
                <Link to={`/jam/${jam.id}`}>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {(!jams || jams.length === 0) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucune confiture trouvée</p>
        </div>
      )}
    </div>
  );
};

export default RegularJamsRanking;
