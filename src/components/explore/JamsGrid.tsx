
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw } from "lucide-react";
import JamCard from '@/components/JamCard';
import { JamType } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';
import { checkSupabaseConnection } from '@/utils/supabaseHelpers';

type JamsGridProps = {
  jams: JamType[] | undefined;
  isLoading: boolean;
  error: Error | null;
  resetFilters: () => void;
  refreshData?: () => void;
};

const JamsGrid: React.FC<JamsGridProps> = ({ jams, isLoading, error, resetFilters, refreshData }) => {
  // Vérification de la connexion Supabase
  useEffect(() => {
    const verifyConnection = async () => {
      const { success, error } = await checkSupabaseConnection();
      if (!success) {
        console.error("Problème de connexion à Supabase:", error);
        toast({
          title: "Problème de connexion",
          description: "Impossible de se connecter à la base de données.",
          variant: "destructive",
        });
      }
    };
    
    verifyConnection();
  }, []);
  
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
      description: "Une erreur est survenue lors du chargement des confitures.",
      variant: "destructive"
    });

    return (
      <div className="text-center py-10">
        <p className="text-destructive text-xl font-medium">Une erreur est survenue lors du chargement des confitures</p>
        <pre className="text-xs mt-2 p-2 bg-muted rounded text-left overflow-auto max-h-40">
          {error.message}
        </pre>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={refreshData || (() => window.location.reload())} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Rafraîchir les données
          </Button>
          <Button onClick={resetFilters} variant="outline">
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    );
  }

  // Vérification des données
  if (!jams) {
    console.log("JamsGrid: jams est undefined");
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Aucune donnée n'a été retournée.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={refreshData || (() => window.location.reload())} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Rafraîchir les données
          </Button>
          <Button onClick={resetFilters} variant="outline">
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    );
  }

  if (jams.length === 0) {
    console.log("JamsGrid: jams est un tableau vide");
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Aucune confiture ne correspond à vos critères.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={resetFilters} variant="outline">
            Réinitialiser les filtres
          </Button>
          <Button onClick={refreshData || (() => window.location.reload())} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Rafraîchir les données
          </Button>
        </div>
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
