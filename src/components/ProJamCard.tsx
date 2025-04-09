
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProJamCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  priceEuros?: number;
  isPro?: boolean;
  isSponsored?: boolean;
  isAvailable?: boolean;
}

const ProJamCard: React.FC<ProJamCardProps> = ({
  id,
  name,
  imageUrl,
  priceEuros = 0,
  isPro = true,
  isSponsored = false,
  isAvailable = true
}) => {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
              <span className="text-amber-800 opacity-70">Image non disponible</span>
            </div>
          )}
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isPro && (
            <Badge className="bg-indigo-600 hover:bg-indigo-700">
              PRO
            </Badge>
          )}
          
          {isSponsored && (
            <Badge variant="outline" className="bg-white border-amber-500 text-amber-700">
              Sponsorisé
            </Badge>
          )}
        </div>
        
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg font-semibold px-3 py-1">
              Indisponible
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-base mb-1 line-clamp-1">{name}</h3>
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-lg">
            {priceEuros.toFixed(2)} €
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProJamCard;
