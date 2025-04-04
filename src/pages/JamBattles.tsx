import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getTypedSupabaseQuery } from '@/utils/supabaseHelpers';
import { JamBattleType, BattleVoteType } from '@/types/supabase';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

type Battle = {
  id: string;
  jam_a_id: string;
  jam_b_id: string;
  votes_for_a: number;
  votes_for_b: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  jam_a: {
    id: string;
    name: string;
    jam_images: Array<{
      url: string;
    }>;
    creator_id: string;
    profiles: {
      username: string;
    };
  };
  jam_b: {
    id: string;
    name: string;
    jam_images: Array<{
      url: string;
    }>;
    creator_id: string;
    profiles: {
      username: string;
    };
  };
  already_voted?: boolean;
  voted_for?: string;
};

const JamBattles = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  
  const { data: battles, isLoading, error, refetch } = useQuery({
    queryKey: ['battles', activeTab],
    queryFn: async () => {
      const isActive = activeTab === 'active';
      
      const { data, error } = await getTypedSupabaseQuery('jam_battles')
        .select(`
          *,
          jam_a:jam_a_id (
            id,
            name,
            creator_id,
            jam_images (url),
            profiles:creator_id (username)
          ),
          jam_b:jam_b_id (
            id,
            name,
            creator_id,
            jam_images (url),
            profiles:creator_id (username)
          )
        `)
        .eq('is_active', isActive)
        .order(isActive ? 'start_date' : 'end_date', { ascending: false });

      if (error) throw error;
      
      if (user) {
        const { data: votes } = await supabase
          .from('battle_votes')
          .select('battle_id, voted_for_jam_id')
          .eq('user_id', user.id);
          
        if (votes) {
          return data.map((battle: Battle) => {
            const vote = votes.find(v => v.battle_id === battle.id);
            if (vote) {
              return {
                ...battle,
                already_voted: true,
                voted_for: vote.voted_for_jam_id
              };
            }
            return battle;
          });
        }
      }
      
      return data;
    },
  });

  const castVote = async (battleId: string, jamId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour voter",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: existingVote } = await supabase
        .from('battle_votes')
        .select('id')
        .eq('battle_id', battleId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingVote) {
        toast({
          title: "Vote déjà effectué",
          description: "Vous avez déjà voté pour cette battle",
          variant: "destructive",
        });
        return;
      }
      
      await supabase
        .from('battle_votes')
        .insert([{ 
          battle_id: battleId, 
          user_id: user.id,
          voted_for_jam_id: jamId
        }]);
        
      const isVoteForA = jamId === battles?.find(b => b.id === battleId)?.jam_a_id;
      await supabase
        .from('jam_battles')
        .update({
          votes_for_a: isVoteForA 
            ? supabase.rpc('increment', { x: 1 }) 
            : supabase.rpc('increment', { x: 0 }),
          votes_for_b: isVoteForA 
            ? supabase.rpc('increment', { x: 0 }) 
            : supabase.rpc('increment', { x: 1 })
        })
        .eq('id', battleId);
      
      toast({
        title: "Vote enregistré !",
        description: "Votre vote a bien été comptabilisé",
      });
      
      refetch();
      
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du vote",
        variant: "destructive",
      });
    }
  };

  const getBattleStatus = (battle: Battle) => {
    if (!battle.is_active) {
      return "Terminé";
    }
    
    const now = new Date();
    const endDate = new Date(battle.end_date);
    
    if (isBefore(now, endDate)) {
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`;
    } else {
      return "Terminé";
    }
  };

  const getTotalVotes = (battle: Battle) => {
    return battle.votes_for_a + battle.votes_for_b;
  };

  const getVotePercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return 50; // Equal if no votes
    return Math.round((votes / totalVotes) * 100);
  };

  const getWinner = (battle: Battle) => {
    if (battle.is_active) return null;
    
    if (battle.votes_for_a > battle.votes_for_b) {
      return battle.jam_a;
    } else if (battle.votes_for_b > battle.votes_for_a) {
      return battle.jam_b;
    } else {
      return null; // It's a tie
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-2">
          <Swords className="h-8 w-8 text-jam-raspberry" />
          <h1 className="font-serif text-3xl font-bold">
            Battles de confitures
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Votez pour votre confiture favorite et départagez les battles !
        </p>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="active" className="flex-1">
            <Timer className="mr-2 h-4 w-4" />
            Battles en cours
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            <BarChart3 className="mr-2 h-4 w-4" />
            Battles terminées
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShieldQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Une erreur est survenue lors du chargement des battles.</p>
              </CardContent>
            </Card>
          ) : battles && battles.length > 0 ? (
            <div className="space-y-8">
              {battles.map((battle: Battle) => (
                <Card key={battle.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Battle: {battle.jam_a.name} vs {battle.jam_b.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {getBattleStatus(battle)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Débutée le {format(new Date(battle.start_date), 'dd MMMM yyyy', { locale: fr })}
                      • {getTotalVotes(battle)} vote{getTotalVotes(battle) > 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div 
                        className={`relative border rounded-lg p-4 ${
                          battle.already_voted && battle.voted_for === battle.jam_a.id 
                            ? 'border-jam-honey bg-jam-honey/5' 
                            : ''
                        }`}
                      >
                        {battle.already_voted && battle.voted_for === battle.jam_a.id && (
                          <div className="absolute -top-3 -right-3">
                            <Badge className="bg-jam-honey">Votre vote</Badge>
                          </div>
                        )}
                        
                        <div className="flex flex-col items-center">
                          <img 
                            src={battle.jam_a.jam_images[0]?.url || '/placeholder.svg'} 
                            alt={battle.jam_a.name} 
                            className="w-48 h-48 object-cover rounded-md mb-4"
                          />
                          <h3 className="text-lg font-medium text-center">{battle.jam_a.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Par {battle.jam_a.profiles.username}
                          </p>
                          
                          <Button 
                            variant="default"
                            className="w-full bg-jam-raspberry hover:bg-jam-raspberry/90"
                            disabled={battle.already_voted}
                            onClick={() => castVote(battle.id, battle.jam_a.id)}
                          >
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Voter
                          </Button>
                        </div>
                      </div>
                      
                      <div 
                        className={`relative border rounded-lg p-4 ${
                          battle.already_voted && battle.voted_for === battle.jam_b.id 
                            ? 'border-jam-honey bg-jam-honey/5' 
                            : ''
                        }`}
                      >
                        {battle.already_voted && battle.voted_for === battle.jam_b.id && (
                          <div className="absolute -top-3 -right-3">
                            <Badge className="bg-jam-honey">Votre vote</Badge>
                          </div>
                        )}
                        
                        <div className="flex flex-col items-center">
                          <img 
                            src={battle.jam_b.jam_images[0]?.url || '/placeholder.svg'} 
                            alt={battle.jam_b.name} 
                            className="w-48 h-48 object-cover rounded-md mb-4"
                          />
                          <h3 className="text-lg font-medium text-center">{battle.jam_b.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Par {battle.jam_b.profiles.username}
                          </p>
                          
                          <Button 
                            variant="default"
                            className="w-full bg-jam-raspberry hover:bg-jam-raspberry/90"
                            disabled={battle.already_voted}
                            onClick={() => castVote(battle.id, battle.jam_b.id)}
                          >
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Voter
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <div className="flex justify-between text-sm mb-2">
                        <div>
                          {battle.votes_for_a} vote{battle.votes_for_a !== 1 ? 's' : ''}
                          {' '}
                          ({getVotePercentage(battle.votes_for_a, getTotalVotes(battle))}%)
                        </div>
                        <div>
                          {battle.votes_for_b} vote{battle.votes_for_b !== 1 ? 's' : ''}
                          {' '}
                          ({getVotePercentage(battle.votes_for_b, getTotalVotes(battle))}%)
                        </div>
                      </div>
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full bg-jam-raspberry" 
                          style={{ width: `${getVotePercentage(battle.votes_for_a, getTotalVotes(battle))}%` }}
                        />
                        <div 
                          className="h-full bg-jam-honey" 
                          style={{ width: `${getVotePercentage(battle.votes_for_b, getTotalVotes(battle))}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-center">
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link to={`/jam/${battle.jam_a.id}`}>Voir confiture 1</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to={`/jam/${battle.jam_b.id}`}>Voir confiture 2</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShieldQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune battle en cours pour le moment.</p>
                <Button className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Proposer une battle
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShieldQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Une erreur est survenue lors du chargement des battles.</p>
              </CardContent>
            </Card>
          ) : battles && battles.length > 0 ? (
            <div className="space-y-8">
              {battles.map((battle: Battle) => {
                const winner = getWinner(battle);
                const isTie = !winner && !battle.is_active;
                
                return (
                  <Card key={battle.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Battle: {battle.jam_a.name} vs {battle.jam_b.name}</span>
                        <Badge variant="outline" className="ml-2">Terminé</Badge>
                      </CardTitle>
                      <CardDescription>
                        Terminée le {format(new Date(battle.end_date), 'd MMMM yyyy', { locale: fr })}
                        • {getTotalVotes(battle)} vote{getTotalVotes(battle) > 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {winner && (
                        <div className="mb-6 flex flex-col items-center bg-jam-honey/5 rounded-lg p-4">
                          <Award className="h-8 w-8 text-jam-honey mb-2" />
                          <h3 className="text-lg font-medium">
                            "{winner.name}" a remporté cette battle !
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Par {winner.profiles.username}
                          </p>
                        </div>
                      )}
                      
                      {isTie && (
                        <div className="mb-6 flex flex-col items-center bg-muted/20 rounded-lg p-4">
                          <Swords className="h-8 w-8 text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">Match nul !</h3>
                          <p className="text-sm text-muted-foreground">
                            Les deux confitures ont obtenu le même nombre de votes
                          </p>
                        </div>
                      )}
                    
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={`border rounded-lg p-4 ${
                          winner?.id === battle.jam_a.id ? 'border-jam-honey' : ''
                        }`}>
                          <div className="flex flex-col items-center">
                            <img 
                              src={battle.jam_a.jam_images[0]?.url || '/placeholder.svg'} 
                              alt={battle.jam_a.name} 
                              className="w-48 h-48 object-cover rounded-md mb-4"
                            />
                            <h3 className="text-lg font-medium text-center">{battle.jam_a.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Par {battle.jam_a.profiles.username}
                            </p>
                            
                            <Button variant="outline" asChild>
                              <Link to={`/jam/${battle.jam_a.id}`}>
                                Voir détails
                              </Link>
                            </Button>
                          </div>
                        </div>
                        
                        <div className={`border rounded-lg p-4 ${
                          winner?.id === battle.jam_b.id ? 'border-jam-honey' : ''
                        }`}>
                          <div className="flex flex-col items-center">
                            <img 
                              src={battle.jam_b.jam_images[0]?.url || '/placeholder.svg'} 
                              alt={battle.jam_b.name} 
                              className="w-48 h-48 object-cover rounded-md mb-4"
                            />
                            <h3 className="text-lg font-medium text-center">{battle.jam_b.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Par {battle.jam_b.profiles.username}
                            </p>
                            
                            <Button variant="outline" asChild>
                              <Link to={`/jam/${battle.jam_b.id}`}>
                                Voir détails
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <div className="flex justify-between text-sm mb-2">
                          <div>
                            {battle.votes_for_a} vote{battle.votes_for_a !== 1 ? 's' : ''}
                            {' '}
                            ({getVotePercentage(battle.votes_for_a, getTotalVotes(battle))}%)
                          </div>
                          <div>
                            {battle.votes_for_b} vote{battle.votes_for_b !== 1 ? 's' : ''}
                            {' '}
                            ({getVotePercentage(battle.votes_for_b, getTotalVotes(battle))}%)
                          </div>
                        </div>
                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div 
                            className="h-full bg-jam-raspberry" 
                            style={{ width: `${getVotePercentage(battle.votes_for_a, getTotalVotes(battle))}%` }}
                          />
                          <div 
                            className="h-full bg-jam-honey" 
                            style={{ width: `${getVotePercentage(battle.votes_for_b, getTotalVotes(battle))}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ShieldQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune battle terminée pour le moment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JamBattles;
