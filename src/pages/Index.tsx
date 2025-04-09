
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import TopJamsSection from "@/components/TopJamsSection";
import SeasonalSection from "@/components/SeasonalSection";
import RandomJamsSection from "@/components/RandomJamsSection";
import AvailableJamsSection from "@/components/AvailableJamsSection";
import { PlusCircle, Swords, Trophy } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewBattleType, AllergenType } from '@/types/supabase';
import AllergensBadges from '@/components/AllergensBadges';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  // Récupérer les battles à venir
  const { data: upcomingBattles, isLoading: loadingBattles } = useQuery({
    queryKey: ['upcomingBattles'],
    queryFn: async () => {
      const { data, error } = await supabaseDirect.select(
        'jam_battles_new',
        '*'
      );
      
      if (error) throw error;
      return data as unknown as NewBattleType[];
    },
  });
  
  // Récupérer la liste des allergènes pour la détection
  const { data: allergensData } = useQuery({
    queryKey: ['allergens'],
    queryFn: async () => {
      const { data, error } = await supabaseDirect.select(
        'allergens',
        'name, category, severity'
      );
      
      if (error) throw error;
      return data as AllergenType[];
    },
  });
  
  // Helper function pour détecter les allergènes dans une valeur de contrainte
  const detectAllergens = (value: string): string[] => {
    if (!allergensData || !value) return [];
    
    // Convertir la valeur en minuscules pour la comparaison
    const lowerValue = value.toLowerCase();
    
    // Rechercher les allergènes qui pourraient être mentionnés dans la valeur
    const detectedAllergens = allergensData.filter(allergen => 
      lowerValue.includes(allergen.name.toLowerCase())
    ).map(allergen => allergen.name);
    
    return detectedAllergens;
  };
  
  // Helper function pour formater les contraintes
  const formatConstraints = (constraints: Record<string, any>) => {
    if (!constraints) return null;

    return Object.entries(constraints).map(([key, value]) => {
      // Vérifier si la valeur est une chaîne
      if (typeof value !== 'string') {
        return (
          <Badge key={key} variant="outline" className="mr-2 mb-2">
            {key}: {String(value)}
          </Badge>
        );
      }
      
      // Détecter les allergènes dans la valeur
      const allergens = detectAllergens(value);
      
      // Si des allergènes sont détectés, les afficher avec le composant spécifique
      if (allergens.length > 0) {
        return (
          <div key={key} className="mb-2">
            <Badge variant="outline" className="mr-2 mb-1">
              {key}:
            </Badge>
            <span className="text-sm">{value}</span>
            <div className="mt-1">
              <AllergensBadges allergens={allergens} size="sm" />
            </div>
          </div>
        );
      }
      
      // Sinon, afficher la contrainte normalement
      return (
        <Badge key={key} variant="outline" className="mr-2 mb-2">
          {key}: {value}
        </Badge>
      );
    });
  };
  
  return (
    <div>
      {/* 1. Échangez vos confitures artisanales */}
      <HeroSection showRegistration={!user} />
      
      {/* 2. Pourquoi rejoindre notre communauté ? */}
      {!user && <FeatureSection />}
      
      {/* 3. Découvrir des confitures */}
      <RandomJamsSection />
      
      {/* 4. Confitures disponibles les mieux notées */}
      <AvailableJamsSection />
      
      {/* 5. Confitures les mieux notées */}
      <TopJamsSection />
      
      {/* 6. Battles en cours */}
      <div className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-tight">Battles en cours</h2>
            <p className="text-muted-foreground">
              Participez aux battles de confitures et montrez vos talents!
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/battles">
              <Swords className="mr-2 h-4 w-4" />
              Tous les battles
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingBattles ? (
            <p>Chargement des battles...</p>
          ) : upcomingBattles && upcomingBattles.length > 0 ? (
            upcomingBattles.slice(0, 3).map((battle) => (
              <Card key={battle.id}>
                <CardHeader>
                  <CardTitle>{battle.theme}</CardTitle>
                  <CardDescription>
                    <div className="flex flex-wrap mt-2">
                      {battle.constraints && formatConstraints(battle.constraints)}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <span>{battle.reward_credits} crédits à gagner!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {battle.status === 'inscription' ? 'Inscriptions ouvertes' : 
                     battle.status === 'selection' ? 'Sélection en cours' : 
                     battle.status === 'production' ? 'Production en cours' : 
                     battle.status === 'envoi' ? 'Envoi des pots' : 
                     battle.status === 'vote' ? 'Vote en cours' : 'Battle terminé'}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to={`/battles/${battle.id}`}>
                      Voir les détails
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-muted-foreground mb-4">Aucun battle en cours pour le moment.</p>
              <Button asChild>
                <Link to="/battles/admin">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer un battle
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* 7. Fruits de saison */}
      <SeasonalSection />
    </div>
  );
};

export default Index;
