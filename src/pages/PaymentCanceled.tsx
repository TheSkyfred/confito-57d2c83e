
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Paiement annulé</CardTitle>
          <CardDescription className="text-center">
            Votre demande d'achat de crédits a été annulée
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium mb-4">Votre paiement a été annulé</p>
          <p className="text-sm text-muted-foreground text-center">
            Aucun montant n'a été débité de votre compte. 
            Vous pouvez retourner à la page des crédits pour essayer à nouveau.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={() => navigate("/credits")} 
            className="w-full bg-jam-raspberry hover:bg-jam-raspberry/90 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux crédits
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentCanceled;
