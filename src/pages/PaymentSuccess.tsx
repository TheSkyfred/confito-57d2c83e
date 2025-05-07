
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { CreditBadge } from '@/components/ui/credit-badge';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !user) {
        setError("Informations de paiement manquantes");
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) {
          throw new Error(error.message);
        }

        setVerificationResult(data);

        if (data.success) {
          toast({
            title: "Paiement réussi !",
            description: `${data.creditsAdded} crédits ont été ajoutés à votre compte.`,
          });
        } else {
          setError(data.message || "Erreur lors de la vérification du paiement.");
        }
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors de la vérification du paiement.");
        console.error("Payment verification error:", err);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, user]);

  return (
    <div className="container py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Paiement {isVerifying ? "en cours de vérification" : verificationResult?.success ? "réussi" : "échoué"}</CardTitle>
          <CardDescription className="text-center">
            {isVerifying ? "Nous vérifions votre paiement..." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {isVerifying ? (
            <Loader2 className="h-16 w-16 animate-spin text-jam-raspberry" />
          ) : verificationResult?.success ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-lg font-medium mb-2">Transaction réussie !</p>
              <div className="flex items-center gap-2 mb-4">
                <span>Nouveau solde :</span>
                <CreditBadge amount={verificationResult.newBalance} size="large" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {verificationResult.creditsAdded} crédits ont été ajoutés à votre compte
              </p>
            </>
          ) : (
            <>
              <div className="text-center text-red-500 mb-4">
                <p className="text-lg font-medium">Le paiement n'a pas pu être vérifié</p>
                <p className="text-sm">{error || "Erreur inconnue"}</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate("/credits")} className="bg-jam-raspberry hover:bg-jam-raspberry/90">
            Retour aux crédits
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
