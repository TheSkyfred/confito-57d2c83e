
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/home/HeroSection";
import FeatureSection from "@/components/home/FeatureSection";
import TopJamsSection from "@/components/home/TopJamsSection";
import SeasonalSection from "@/components/home/SeasonalSection";
import { PlusCircle, Swords, Trophy } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
                    {Object.entries(battle.constraints).map(([key, value]) => (
                      <span key={key} className="mr-2">
                        {key}: {value}
                      </span>
                    ))}
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
