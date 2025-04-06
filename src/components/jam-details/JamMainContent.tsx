
import React from 'react';
import { JamType } from '@/types/supabase';
import { JamImageCarousel } from './JamImageCarousel';
import { JamHeader } from './JamHeader';
import { JamDetailsSection } from './JamDetailsSection';
import { JamFavoriteShare } from './JamFavoriteShare';
import { JamActions } from './JamActions';

type JamMainContentProps = {
  jam: JamType;
  primaryImage: string | null;
  secondaryImages: { id: string; url: string }[];
  favorited: boolean;
  toggleFavorite: () => void;
  isAuthenticated: boolean;
};

export const JamMainContent = ({
  jam,
  primaryImage,
  secondaryImages,
  favorited,
  toggleFavorite,
  isAuthenticated
}: JamMainContentProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <JamImageCarousel
          primaryImage={primaryImage}
          secondaryImages={secondaryImages}
          jamName={jam.name}
        />
      </div>

      <div>
        <div className="flex justify-between items-start">
          <JamHeader
            name={jam.name}
            profile={jam.profiles}
          />
          <JamFavoriteShare 
            favorited={favorited}
            toggleFavorite={toggleFavorite}
          />
        </div>

        <JamDetailsSection
          description={jam.description}
          ingredients={jam.ingredients}
          weight_grams={jam.weight_grams}
          sugar_content={jam.sugar_content}
          available_quantity={jam.available_quantity}
          created_at={jam.created_at}
          allergens={jam.allergens}
        />

        <JamActions
          price_credits={jam.price_credits}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
};
