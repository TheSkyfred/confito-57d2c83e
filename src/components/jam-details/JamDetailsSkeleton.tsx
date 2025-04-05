
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export const JamDetailsSkeleton = () => {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Skeleton className="h-[400px] w-full rounded-md" />
        </div>
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
};

export const JamDetailsError = () => {
  return (
    <div className="container py-8">
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-2xl font-bold">Confiture introuvable</h2>
        <p className="mt-2 text-muted-foreground">
          Cette confiture n'existe pas ou a été retirée.
        </p>
        <Button asChild className="mt-6">
          <Link to="/explore">Découvrir d'autres confitures</Link>
        </Button>
      </div>
    </div>
  );
};
