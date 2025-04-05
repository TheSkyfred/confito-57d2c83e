
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import JamCard from '@/components/JamCard';
import { JamType } from '@/types/supabase';

type JamsGridProps = {
  jams: JamType[] | undefined;
  isLoading: boolean;
  error: Error | null;
  resetFilters: () => void;
};

const JamsGrid: React.FC<JamsGridProps> = ({ jams, isLoading, error, resetFilters }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Une erreur est survenue lors du chargement des confitures.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  if (jams && jams.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {jams.map((jam: JamType) => (
          <Link to={`/jam/${jam.id}`} key={jam.id}>
            <JamCard jam={jam} />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-10">
      <p className="text-muted-foreground">Aucune confiture ne correspond à vos critères.</p>
      <Button onClick={resetFilters} variant="outline" className="mt-4">
        Réinitialiser les filtres
      </Button>
    </div>
  );
};

export default JamsGrid;
