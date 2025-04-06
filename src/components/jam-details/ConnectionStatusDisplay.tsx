
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

type ConnectionStatusDisplayProps = {
  onRefresh: () => void;
};

export const ConnectionStatusDisplay = ({ onRefresh }: ConnectionStatusDisplayProps) => {
  return (
    <div className="text-center py-10">
      <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
      <h2 className="mt-4 text-2xl font-bold">Problème de connexion</h2>
      <p className="mt-2 text-muted-foreground">
        Impossible de se connecter à la base de données.
      </p>
      <Button onClick={onRefresh} className="mt-6">
        Rafraîchir la page
      </Button>
    </div>
  );
};
