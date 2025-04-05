
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { JamPriceAction } from './JamPriceAction';

type JamActionsProps = {
  price_credits: number;
  isAuthenticated: boolean;
};

export const JamActions = ({ price_credits, isAuthenticated }: JamActionsProps) => {
  const addToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour commander",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Ajouté au panier",
      description: "Cette confiture a été ajoutée à votre panier",
    });
  };

  return (
    <JamPriceAction 
      price_credits={price_credits} 
      addToCart={addToCart} 
    />
  );
};
