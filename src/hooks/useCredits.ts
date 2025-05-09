
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
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session:", sessionData);
      
      // Check if we have a valid session before proceeding
      if (!sessionData?.session?.access_token) {
        throw new Error("Session d'authentification invalide");
      }
      
      // Call the Stripe checkout function with error handling
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout', {
        body: { packageId: selectedPackage }
      });
      
      console.log("Response from create-checkout:", data, functionError);
      
      if (functionError) {
        console.error("Error calling create-checkout function:", functionError);
        throw new Error(`Erreur lors de la création du checkout: ${functionError.message || functionError}`);
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
      
      let errorMessage: string;
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Failed to send')) {
          errorMessage = "Impossible de contacter le serveur de paiement. Veuillez vérifier votre connexion internet et réessayer. Si le problème persiste, contactez notre support.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = "Une erreur est survenue lors du traitement de votre paiement";
      }
      
      setError(errorMessage);
      
      toast({
        title: "Erreur lors de l'achat",
        description: errorMessage,
        variant: "destructive"
      });
      
    } finally {
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
