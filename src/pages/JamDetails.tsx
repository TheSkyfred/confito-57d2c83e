
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

import { JamDetailsSkeleton } from '@/components/jam-details/JamDetailsSkeleton';
import { useJamDetails } from '@/hooks/useJamDetails';
import { useFavoriteHandler } from '@/components/jam-details/JamFavoriteHandler';
import { checkSupabaseConnection } from '@/utils/supabaseHelpers';
import { JamDetailsLayout } from '@/components/jam-details/JamDetailsLayout';
import { ConnectionStatusDisplay } from '@/components/jam-details/ConnectionStatusDisplay';
import { ErrorDisplay } from '@/components/jam-details/ErrorDisplay';
import { JamMainContent } from '@/components/jam-details/JamMainContent';
import { JamTabsSection } from '@/components/jam-details/JamTabsSection';

const JamDetails = () => {
  const { jamId } = useParams<{ jamId: string }>();
  const { user } = useAuth();
  
  // Vérifier la connexion à Supabase au chargement
  const [connectionStatus, setConnectionStatus] = React.useState<'checking' | 'success' | 'error'>('checking');
  
  useEffect(() => {
    const verifyConnection = async () => {
      const result = await checkSupabaseConnection();
      
      if (result.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        toast({
          title: "Problème de connexion",
          description: "Impossible de se connecter à la base de données.",
          variant: "destructive",
        });
      }
    };
    
    verifyConnection();
  }, []);
  
  // Récupération des données
  const {
    jam,
    isLoading,
    error,
    favorited,
    setFavorited,
    avgRating,
    ratings,
    primaryImage,
    secondaryImages,
    isAuthenticated,
    retryFetch
  } = useJamDetails(jamId);

  // Gestion des favoris
  const { toggleFavorite } = useFavoriteHandler({
    jamId: jamId || '',
    userId: user?.id,
    favorited,
    setFavorited
  });
  
  // Notification d'erreur
  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les détails de cette confiture.",
        variant: "destructive",
      });
    }
  }, [error]);

  // Affichage pendant le chargement
  if (isLoading || connectionStatus === 'checking') {
    return <JamDetailsSkeleton />;
  }

  // Affichage en cas de problème de connexion
  if (connectionStatus === 'error') {
    return (
      <JamDetailsLayout>
        <ConnectionStatusDisplay onRefresh={() => window.location.reload()} />
      </JamDetailsLayout>
    );
  }

  // Affichage en cas d'erreur ou confiture non trouvée
  if (error || !jam) {
    return (
      <JamDetailsLayout>
        <ErrorDisplay onRetry={retryFetch} />
      </JamDetailsLayout>
    );
  }

  // Succès : affichage normal de la page
  return (
    <JamDetailsLayout>
      <JamMainContent
        jam={jam}
        primaryImage={primaryImage}
        secondaryImages={secondaryImages}
        favorited={favorited}
        toggleFavorite={toggleFavorite}
        isAuthenticated={isAuthenticated}
      />
      
      <JamTabsSection
        recipe={jam.recipe}
        reviews={jam.reviews || []}
        avgRating={avgRating}
        ratings={ratings}
        isAuthenticated={isAuthenticated}
      />
    </JamDetailsLayout>
  );
};

export default JamDetails;
