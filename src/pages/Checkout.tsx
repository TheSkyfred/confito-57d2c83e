
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-4xl py-16">
      <h1 className="text-3xl font-bold mb-6">Personnalisation de l'envoi</h1>
      
      <div className="bg-card p-8 rounded-lg border shadow-sm mb-6 text-center">
        <p className="mb-4">Cette page est en cours de développement.</p>
        <Button onClick={() => navigate("/cart")} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour au panier
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
