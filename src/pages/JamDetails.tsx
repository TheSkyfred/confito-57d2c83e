
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

import { JamImageCarousel } from '@/components/jam-details/JamImageCarousel';
import { JamHeader } from '@/components/jam-details/JamHeader';
import { JamDetailsSection } from '@/components/jam-details/JamDetailsSection';
import { JamRecipeTab } from '@/components/jam-details/JamRecipeTab';
import { JamReviewsTab } from '@/components/jam-details/JamReviewsTab';
import { JamDetailsSkeleton } from '@/components/jam-details/JamDetailsSkeleton';
import { useJamDetails } from '@/hooks/useJamDetails';
import { JamFavoriteShare } from '@/components/jam-details/JamFavoriteShare';
import { useFavoriteHandler } from '@/components/jam-details/JamFavoriteHandler';
import { JamActions } from '@/components/jam-details/JamActions';
import { checkSupabaseConnection } from '@/utils/supabaseHelpers';

const JamDetails = () => {
  const { jamId } = useParams<{ jamId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/explore">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Retour aux confitures
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-10">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-2xl font-bold">Problème de connexion</h2>
          <p className="mt-2 text-muted-foreground">
            Impossible de se connecter à la base de données.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-6">
            Rafraîchir la page
          </Button>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur ou confiture non trouvée
  if (error || !jam) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/explore">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Retour aux confitures
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-10">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-2xl font-bold">Confiture introuvable</h2>
          <p className="mt-2 text-muted-foreground">
            Cette confiture n'existe pas ou a été retirée.
          </p>
          <div className="flex flex-col gap-4 items-center mt-6">
            <Button onClick={() => retryFetch()} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
            <Button asChild>
              <Link to="/explore">Découvrir d'autres confitures</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Succès : affichage normal de la page
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/explore">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <JamImageCarousel
            primaryImage={primaryImage}
            secondaryImages={secondaryImages}
            jamName={jam.name}
          />
        </div>

        <div>
          <div className="flex justify-between items-start">
            <JamHeader
              name={jam.name}
              profile={jam.profiles}
            />
            <JamFavoriteShare 
              favorited={favorited}
              toggleFavorite={toggleFavorite}
            />
          </div>

          <JamDetailsSection
            description={jam.description}
            ingredients={jam.ingredients}
            weight_grams={jam.weight_grams}
            sugar_content={jam.sugar_content}
            available_quantity={jam.available_quantity}
            created_at={jam.created_at}
            allergens={jam.allergens}
          />

          <JamActions
            price_credits={jam.price_credits}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="recipe">
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="recipe">Recette</TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-1">
              Avis
              {ratings.length > 0 && (
                <Badge variant="secondary" className="ml-1">{ratings.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recipe" className="pt-4">
            <JamRecipeTab
              recipe={jam.recipe}
              isAuthenticated={isAuthenticated}
            />
          </TabsContent>
          
          <TabsContent value="reviews" className="pt-4">
            <JamReviewsTab
              reviews={jam.reviews || []}
              avgRating={avgRating}
              isAuthenticated={isAuthenticated}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JamDetails;
