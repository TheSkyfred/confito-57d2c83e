
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
  
  // Find primary image, or use the first one, or fallback to placeholder
  const primaryImage = jam.jam_images && jam.jam_images.length > 0 
    ? (jam.jam_images.find(img => img.is_primary)?.url || jam.jam_images[0].url) 
    : '/placeholder.svg';
  
  // Calculate average rating
  const avgRating = jam.avgRating || 0;
  
  // Safe toFixed function to handle undefined/null values
  const safeToFixed = (value: number | undefined | null, digits: number = 1): string => {
    if (value === undefined || value === null) return '0.0';
    return value.toFixed(digits);
  };
  
  return (
    <div className="group relative overflow-hidden rounded-lg border border-muted bg-background hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden">
        <img 
          src={primaryImage} 
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
              {safeToFixed(avgRating)}
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {jam.description}
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-wrap gap-1">
            {jam.ingredients?.slice(0, 2).map((ingredient, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {ingredient}
              </Badge>
            ))}
            {jam.ingredients && jam.ingredients.length > 2 && (
              <Badge variant="outline" className="text-xs">+{jam.ingredients.length - 2}</Badge>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className="font-medium flex items-center gap-2">
              {jam.is_pro && jam.price_euros ? (
                <span className="text-sm font-medium">{jam.price_euros.toFixed(2)} €</span>
              ) : (
                <CreditBadge amount={jam.price_credits} size="sm" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JamCard;
