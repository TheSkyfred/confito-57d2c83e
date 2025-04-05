
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import JamCard from '@/components/JamCard';
import { JamType } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

type JamsGridProps = {
  jams: JamType[] | undefined;
  isLoading: boolean;
  error: Error | null;
  resetFilters: () => void;
};

const JamsGrid: React.FC<JamsGridProps> = ({ jams, isLoading, error, resetFilters }) => {
  // Debug pour voir ce qui est réellement retourné
  useEffect(() => {
    console.log("JamsGrid - jams:", jams);
    console.log("JamsGrid - isLoading:", isLoading);
    console.log("JamsGrid - error:", error);
  }, [jams, isLoading, error]);

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
    console.error("Erreur lors du chargement des confitures:", error);
    // Notification pour l'utilisateur
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors du chargement des confitures: " + error.message,
      variant: "destructive"
    });

    return (
      <div className="text-center py-10">
        <p className="text-destructive">Une erreur est survenue lors du chargement des confitures.</p>
        <pre className="text-xs mt-2 p-2 bg-muted rounded text-left overflow-auto max-h-40">
          {error.message}
        </pre>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  // Vérification des données
  if (!jams) {
    console.log("JamsGrid: jams est undefined");
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Aucune donnée n'a été retournée.</p>
        <Button onClick={resetFilters} variant="outline" className="mt-4">
          Réinitialiser les filtres
        </Button>
      </div>
    );
  }

  if (jams.length === 0) {
    console.log("JamsGrid: jams est un tableau vide");
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Aucune confiture ne correspond à vos critères.</p>
        <Button onClick={resetFilters} variant="outline" className="mt-4">
          Réinitialiser les filtres
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-2 ml-2">
          Rafraîchir la page
        </Button>
      </div>
    );
  }

  console.log(`JamsGrid: Affichage de ${jams.length} confitures`);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {jams.map((jam: JamType) => (
        <Link to={`/jam/${jam.id}`} key={jam.id}>
          <JamCard jam={jam} />
        </Link>
      ))}
    </div>
  );
};

export default JamsGrid;
