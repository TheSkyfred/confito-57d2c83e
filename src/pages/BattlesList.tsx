
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShieldCheck, 
  PlusCircle, 
  Trophy,
  Clock,
  History
} from 'lucide-react';
import { NewBattleType, BattleStarsType } from '@/types/supabase';
import BattleCard from '@/components/battle/BattleCard';
import BattleStar from '@/components/battle/BattleStar';
import { fetchUpcomingBattles, fetchActiveBattles, fetchCompletedBattles, fetchBattleStars } from '@/utils/battleHelpers';

const BattlesList = () => {
  const { toast } = useToast();
  const [upcomingBattles, setUpcomingBattles] = useState<NewBattleType[]>([]);
  const [activeBattles, setActiveBattles] = useState<NewBattleType[]>([]);
  const [completedBattles, setCompletedBattles] = useState<NewBattleType[]>([]);
  const [battleStars, setBattleStars] = useState<BattleStarsType[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les données de l'utilisateur
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Récupérer le rôle de l'utilisateur
          const { data: userData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (userData) {
            setUserRole(userData.role);
          }
        }
        
        // Récupérer les battles à venir
        const upcomingData = await fetchUpcomingBattles();
        setUpcomingBattles(upcomingData);
        
        // Récupérer les battles en cours
        const activeData = await fetchActiveBattles();
        setActiveBattles(activeData);
        
        // Récupérer les battles terminés
        const completedData = await fetchCompletedBattles();
        setCompletedBattles(completedData);
        
        // Récupérer le classement Battle Stars
        const starsData = await fetchBattleStars(10);
        setBattleStars(starsData);
        
      } catch (error) {
        console.error("Erreur lors du chargement des battles:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les battles.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Battles de confitures</h1>
          <p className="text-muted-foreground mt-2">
            Affrontez d'autres confituriers sur des thèmes imposés et soyez jugés par la communauté.
          </p>
        </div>
        
        <div className="flex gap-2">
          {userRole === 'admin' && (
            <Button asChild>
              <Link to="/battles/admin">
                <PlusCircle className="h-4 w-4 mr-2" />
                Créer un battle
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="upcoming" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">À venir</span>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">En cours</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Terminés</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Chargement des battles à venir...</p>
                </div>
              ) : upcomingBattles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingBattles.map(battle => (
                    <BattleCard key={battle.id} battle={battle} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun battle à venir pour le moment.</p>
                  {userRole === 'admin' && (
                    <Button asChild className="mt-4">
                      <Link to="/battles/admin">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Créer un nouveau battle
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Chargement des battles en cours...</p>
                </div>
              ) : activeBattles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeBattles.map(battle => (
                    <BattleCard key={battle.id} battle={battle} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun battle en cours pour le moment.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Chargement des battles terminés...</p>
                </div>
              ) : completedBattles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedBattles.map(battle => (
                    <BattleCard key={battle.id} battle={battle} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun battle terminé pour le moment.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-serif font-medium mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-jam-honey" />
              Battle Stars
            </h2>
            
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Chargement du classement...</p>
                </div>
              ) : battleStars.length > 0 ? (
                <>
                  {battleStars.map((star, index) => (
                    <BattleStar key={star.id} battleStar={star} rank={index + 1} />
                  ))}
                  
                  <div className="pt-2">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/rankings">
                        Voir le classement complet
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Aucun classement disponible pour le moment.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-jam-raspberry/10 to-jam-honey/10 rounded-lg p-6 text-center">
            <h2 className="text-xl font-serif font-bold mb-3">Comment fonctionnent les Battles ?</h2>
            <p className="text-sm mb-4">
              Les Battles de confitures sont des compétitions où deux confituriers s'affrontent
              sur un thème imposé, jugés par la communauté.
            </p>
            <div className="space-y-3 text-left text-sm mb-4">
              <div className="flex gap-2">
                <span className="w-6 h-6 rounded-full bg-jam-honey/20 flex items-center justify-center text-xs font-bold">1</span>
                <p>Inscrivez-vous à un battle et soyez sélectionné</p>
              </div>
              <div className="flex gap-2">
                <span className="w-6 h-6 rounded-full bg-jam-honey/20 flex items-center justify-center text-xs font-bold">2</span>
                <p>Créez votre confiture selon le thème imposé</p>
              </div>
              <div className="flex gap-2">
                <span className="w-6 h-6 rounded-full bg-jam-honey/20 flex items-center justify-center text-xs font-bold">3</span>
                <p>Envoyez vos pots aux juges et à votre adversaire</p>
              </div>
              <div className="flex gap-2">
                <span className="w-6 h-6 rounded-full bg-jam-honey/20 flex items-center justify-center text-xs font-bold">4</span>
                <p>Soyez noté et gagnez des crédits et points au classement</p>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              <Link to="/battles/how-it-works">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlesList;
