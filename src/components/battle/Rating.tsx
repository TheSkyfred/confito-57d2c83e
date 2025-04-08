
import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  readOnly = false,
}) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  
  const handleClick = (rating: number) => {
    if (readOnly) return;
    
    // Toggle off if clicking the same star
    if (rating === value) {
      onChange?.(0);
    } else {
      onChange?.(rating);
    }
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-7 w-7';
      default: return 'h-5 w-5';
    }
  };
  
  const sizeClass = getSizeClass();
  
  return (
    <div className="flex">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={cn(
            "p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"
          )}
          onClick={() => handleClick(star)}
          disabled={readOnly}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
        >
          <Star
            className={cn(
              sizeClass,
              "transition-colors",
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
};
