
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

type ErrorDisplayProps = {
  onRetry: () => void;
};

export const ErrorDisplay = ({ onRetry }: ErrorDisplayProps) => {
  return (
    <div className="text-center py-10">
      <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
      <h2 className="mt-4 text-2xl font-bold">Confiture introuvable</h2>
      <p className="mt-2 text-muted-foreground">
        Cette confiture n'existe pas ou a été retirée.
      </p>
      <div className="flex flex-col gap-4 items-center mt-6">
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
        <Button asChild>
          <Link to="/explore">Découvrir d'autres confitures</Link>
        </Button>
      </div>
    </div>
  );
};
