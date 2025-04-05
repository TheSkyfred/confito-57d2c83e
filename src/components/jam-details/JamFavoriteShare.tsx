
import React from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type JamFavoriteShareProps = {
  favorited: boolean;
  toggleFavorite: () => void;
};

export const JamFavoriteShare = ({ favorited, toggleFavorite }: JamFavoriteShareProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="icon"
        onClick={toggleFavorite}
        className={favorited ? "text-jam-raspberry" : ""}
      >
        <Heart className="h-5 w-5" fill={favorited ? "currentColor" : "none"} />
      </Button>
      <Button variant="outline" size="icon">
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
};
