
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Paiement annulé</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium mb-4">Votre paiement a été annulé</p>
          <p className="text-sm text-muted-foreground">
            Aucun montant n'a été débité de votre compte.
          </p>
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

export default PaymentCanceled;
