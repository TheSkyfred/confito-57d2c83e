
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useCredits = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handlePurchase = async (selectedPackage: string) => {
    if (!user) {
      toast({
        title: "Connectez-vous",
        description: "Veuillez vous connecter pour acheter des crédits",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log("Calling create-checkout function with package:", selectedPackage);
      
      // Log the session info and auth status for debugging
      const session = supabase.auth.getSession();
      console.log("Current session:", session);
      
      // Call the Stripe checkout function with error handling
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { packageId: selectedPackage }
      });
      
      console.log("Response from create-checkout:", data, error);
      
      if (error) {
        console.error("Error calling create-checkout function:", error);
        throw new Error(`Erreur lors de la création du checkout: ${error.message || error}`);
      }
      
      if (!data || !data.url) {
        console.error("Invalid response from create-checkout:", data);
        throw new Error("Aucune URL de paiement n'a été retournée");
      }
      
      console.log("Redirecting to Stripe checkout:", data.url);
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue lors du traitement de votre paiement");
      
      toast({
        title: "Erreur lors de l'achat",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors du traitement de votre paiement",
        variant: "destructive"
      });
      
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    setError,
    handlePurchase
  };
};
