
import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { JamType } from '@/types/supabase';

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
  
  return (
    <div className="group relative overflow-hidden rounded-lg border border-muted bg-background hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden">
        <img 
          src={primaryImage} 
          alt={jam.name} 
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium line-clamp-2">{jam.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {avgRating ? avgRating.toFixed(1) : 'N/A'}
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
          <div className="font-medium">
            {jam.price_credits} crédits
          </div>
        </div>
      </div>
    </div>
  );
};

export default JamCard;
