import React from 'react';
import { Star, BadgeEuro } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { JamType } from '@/types/supabase';
import { CreditBadge } from '@/components/ui/credit-badge';

export interface JamCardProps {
  jam: JamType;
}

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

const JamCard: React.FC<JamCardProps> = ({ jam }) => {
  if (!jam) {
    return <div className="p-4 border border-muted rounded-lg">Loading...</div>;
  }
  
  // Safe toFixed function to handle undefined/null values
  const safeToFixed = (value: number | undefined | null, digits: number = 1): string => {
    if (value === undefined || value === null) return '0.0';
    return value.toFixed(digits);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-muted bg-background hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden">
        <img 
          src={jam.cover_image_url || '/placeholder.svg'} 
          alt={jam.name} 
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {jam.is_pro && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-jam-honey text-white flex items-center gap-1">
              <BadgeEuro className="h-3 w-3" />
              PRO
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium line-clamp-2">{jam.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {safeToFixed(jam.avgRating)}
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {jam.description}
        </div>
        <div className="flex flex-wrap gap-1">
          {jam.ingredients?.slice(0, 2).map((ingredient, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {getIngredientName(ingredient)}
            </Badge>
          ))}
          {jam.ingredients && jam.ingredients.length > 2 && (
            <Badge variant="outline" className="text-xs">+{jam.ingredients.length - 2}</Badge>
          )}
        </div>
        <div className="flex items-end justify-between mt-2">
          <div className="flex flex-wrap gap-1">
            {jam.is_pro && jam.price_euros ? (
              <span className="text-sm font-medium">{jam.price_euros.toFixed(2)} €</span>
            ) : (
              <CreditBadge amount={jam.price_credits} size="sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JamCard;
