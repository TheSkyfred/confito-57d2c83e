
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type JamDetailsSectionProps = {
  description: string;
  ingredients: string[];
  weight_grams: number;
  sugar_content: number | null;
  available_quantity: number;
  created_at: string;
  allergens: string[] | null;
};

export const JamDetailsSection = ({
  description,
  ingredients,
  weight_grams,
  sugar_content,
  available_quantity,
  created_at,
  allergens,
}: JamDetailsSectionProps) => {
  return (
    <>
      <div className="mt-4">
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Ingrédients</h3>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient: string, index: number) => (
            <Badge key={index} variant="outline">{ingredient}</Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <p className="text-sm text-muted-foreground">Poids</p>
          <p className="font-medium">{weight_grams} g</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Teneur en sucre</p>
          <p className="font-medium">
            {sugar_content ? `${sugar_content}%` : 'Non spécifié'}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Disponibilité</p>
          <p className="font-medium">{available_quantity} pot{available_quantity > 1 ? 's' : ''}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Date de création</p>
          <p className="font-medium">
            {format(new Date(created_at), 'dd MMMM yyyy', { locale: fr })}
          </p>
        </div>
      </div>

      {allergens && allergens.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            <p className="font-medium">Allergènes</p>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {allergens.map((allergen: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-amber-100 border-amber-200 text-amber-800">
                {allergen}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
