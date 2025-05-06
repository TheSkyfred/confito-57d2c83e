
import React from 'react';
import { Star, BadgeEuro } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { JamType } from '@/types/supabase';
import { CreditBadge } from '@/components/ui/credit-badge';

export interface JamCardProps {
  jam: JamType;
}

const JamCard: React.FC<JamCardProps> = ({ jam }) => {
  if (!jam) {
    return <div className="p-4 border border-muted rounded-lg">Loading...</div>;
  }
  
  // Safe toFixed function to handle undefined/null values
  const safeToFixed = (value: number | undefined | null, digits: number = 1): string => {
    if (value === undefined || value === null) return '0.0';
    return value.toFixed(digits);
  };

  // Function to get ingredient name based on type
  const getIngredientName = (ingredient: any): string => {
    if (typeof ingredient === 'string') return ingredient;
    if (typeof ingredient === 'object' && ingredient.name) return ingredient.name;
    return String(ingredient);
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
