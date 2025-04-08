
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import TopJamsSection from "@/components/TopJamsSection";
import SeasonalSection from "@/components/SeasonalSection";
import { AlertCircle, PlusCircle, Swords, Trophy } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NewBattleType } from '@/types/supabase';

const Index = () => {
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
  
  // Helper function to format constraint values
  const formatConstraints = (constraints: Record<string, any>) => {
    return Object.entries(constraints).map(([key, value]) => {
      // Check if value contains allergenic ingredients
      const allergenKeywords = ['fruits à coque', 'gluten', 'lait', 'œufs', 'soja'];
      
      const containsAllergen = typeof value === 'string' && 
        allergenKeywords.some(allergen => 
          value.toLowerCase().includes(allergen.toLowerCase())
        );
      
      return (
        <Badge 
          key={key} 
          variant="outline" 
          className={`mr-2 mb-2 ${containsAllergen ? 'bg-red-100 border-red-300 text-red-800' : ''}`}
        >
          {containsAllergen ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1 text-red-600" /> 
                  {key}: {value}
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs text-center">Contient des allergènes potentiels</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span>{key}: {value}</span>
          )}
        </Badge>
      );
    });
  };
  
  return (
    <div>
      <HeroSection />
      
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
      
      <FeatureSection />
      <TopJamsSection />
      <SeasonalSection />
    </div>
  );
};

export default Index;
