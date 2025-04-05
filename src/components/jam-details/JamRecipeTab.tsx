
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

type JamRecipeTabProps = {
  recipe: string | null;
  isAuthenticated: boolean;
};

export const JamRecipeTab = ({ recipe, isAuthenticated }: JamRecipeTabProps) => {
  return (
    <>
      {recipe ? (
        <div className="prose prose-slate max-w-none">
          <h3 className="text-xl font-serif font-medium mb-4">Recette</h3>
          <div className="whitespace-pre-line">{recipe}</div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">Pas de recette partagée</h3>
          <p className="text-muted-foreground mt-2">
            Le créateur n'a pas souhaité partager la recette de cette confiture.
          </p>
        </div>
      )}
    </>
  );
};
