
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

type JamPriceActionProps = {
  price_credits: number;
  addToCart: () => void;
};

export const JamPriceAction = ({ price_credits, addToCart }: JamPriceActionProps) => {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-baseline">
        <span className="text-2xl font-bold">{price_credits}</span>
        <span className="ml-1 text-muted-foreground">crédits</span>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="default" 
          className="bg-jam-raspberry hover:bg-jam-raspberry/90"
          onClick={addToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </Button>
      </div>
    </div>
  );
};
