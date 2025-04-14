
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { format, parseISO, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Trophy,
  Users,
  CheckCircle,
  XCircle,
  ArrowRight,
  Fire,
  ThumbsUp,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { JamBattleType } from "@/types/supabase";
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const JamBattles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('current');
  
  // Fetch active battles
  const { data: activeBattles, isLoading: isLoadingActive } = useQuery({
    queryKey: ['battles', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jam_battles')
        .select(`
          *,
          jam_a:jam_a_id(*),
          jam_b:jam_b_id(*)
        `)
        .eq('is_active', true)
        .order('end_date', { ascending: false });
        
      if (error) throw error;
      
      // Add a field indicating if the user has already voted
      if (user) {
        for (const battle of data) {
          const { data: voteData } = await supabase
            .from('battle_votes')
            .select('voted_for_jam_id')
            .eq('battle_id', battle.id)
            .eq('user_id', user.id)
            .single();
            
          if (voteData) {
            battle.already_voted = true;
            battle.voted_for = voteData.voted_for_jam_id;
          }
        }
      }
      
      return data;
    },
    enabled: activeTab === 'current'
  });
  
  // Fetch past battles
  const { data: pastBattles, isLoading: isLoadingPast } = useQuery({
    queryKey: ['battles', 'past'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jam_battles')
        .select(`
          *,
          jam_a:jam_a_id(*),
          jam_b:jam_b_id(*)
        `)
        .eq('is_active', false)
        .order('end_date', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 'past'
  });
  
  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ battleId, jamId }: { battleId: string, jamId: string }) => {
      if (!user) throw new Error("You must be logged in to vote");
      
      // First, check if the user has already voted
      const { data: existingVote } = await supabase
        .from('battle_votes')
        .select('*')
        .eq('battle_id', battleId)
        .eq('user_id', user.id)
        .single();
        
      if (existingVote) {
        throw new Error("Vous avez déjà voté pour ce battle");
      }
      
      // Insert the vote
      const { error } = await supabase
        .from('battle_votes')
        .insert({
          battle_id: battleId,
          user_id: user.id,
          voted_for_jam_id: jamId
        });
        
      if (error) throw error;
      
      // Update the vote count
      const fieldToUpdate = jamId === activeBattles?.find(b => b.id === battleId)?.jam_a_id 
        ? 'votes_for_a' 
        : 'votes_for_b';
        
      const { error: updateError } = await supabase
        .from('jam_battles')
        .update({ 
          [fieldToUpdate]: activeBattles?.find(b => b.id === battleId)?.[fieldToUpdate] + 1 
        })
        .eq('id', battleId);
        
      if (updateError) throw updateError;
      
      const { error: endBattleError } = await supabase
        .from('jam_battles')
        .update({ 
          is_active: false
        })
        .eq('id', battleId)
        .gt('end_date', new Date().toISOString());
        
      if (endBattleError) throw endBattleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['battles', 'active']});
      toast({
        title: "Vote enregistré",
        description: "Votre vote a été pris en compte. Merci de votre participation !",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'enregistrement de votre vote.",
        variant: "destructive",
      });
    }
  });
  
  const handleVote = (battleId: string, jamId: string) => {
    voteMutation.mutate({ battleId, jamId });
  };
  
  const isExpired = (endDate: string) => {
    return isPast(parseISO(endDate));
  };
  
  const calculateProgress = (battle: JamBattleType) => {
    const totalVotes = battle.votes_for_a + battle.votes_for_b;
    if (totalVotes === 0) return 50;
    return (battle.votes_for_a / totalVotes) * 100;
  };
  
  const renderBattleCard = (battle: JamBattleType, showResult = false) => {
    const expired = isExpired(battle.end_date);
    const winner = expired ? (battle.votes_for_a > battle.votes_for_b ? battle.jam_a : 
                             battle.votes_for_b > battle.votes_for_a ? battle.jam_b : null) : null;
    const userVoted = battle.already_voted;
    const userVotedFor = battle.voted_for;
    const progressValue = calculateProgress(battle);
    
    return (
      <Card key={battle.id} className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-serif">
                {battle.jam_a.name} vs {battle.jam_b.name}
              </CardTitle>
              <CardDescription>
                Départagez ces délicieuses confitures !
              </CardDescription>
            </div>
            {expired ? (
              <Badge variant="secondary">Terminé</Badge>
            ) : (
              <Badge>En cours</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jam A */}
            <div className="relative">
              <div 
                className={`border rounded-md p-4 h-full ${userVotedFor === battle.jam_a_id ? 'border-primary border-2' : ''}`}
              >
                {userVotedFor === battle.jam_a_id && (
                  <Badge className="absolute top-2 right-2">Votre vote</Badge>
                )}
                {winner === battle.jam_a && (
                  <Badge className="absolute top-2 right-2 bg-amber-500">Vainqueur</Badge>
                )}
                <div className="flex flex-col h-full">
                  <h3 className="font-medium text-lg mb-2">{battle.jam_a.name}</h3>
                  <img 
                    src={battle.jam_a.jam_images?.[0]?.url || "/placeholder.svg"} 
                    alt={battle.jam_a.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {battle.jam_a.description}
                  </p>
                  <div className="mt-auto">
                    {!expired && !userVoted && (
                      <Button 
                        className="w-full"
                        onClick={() => handleVote(battle.id, battle.jam_a_id)}
                        disabled={voteMutation.isPending}
                      >
                        {voteMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Vote en cours...
                          </>
                        ) : "Voter"}
                      </Button>
                    )}
                    {(expired || userVoted) && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{battle.votes_for_a} votes</span>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/jam/${battle.jam_a_id}`}>
                            Voir détails
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Jam B */}
            <div className="relative">
              <div 
                className={`border rounded-md p-4 h-full ${userVotedFor === battle.jam_b_id ? 'border-primary border-2' : ''}`}
              >
                {userVotedFor === battle.jam_b_id && (
                  <Badge className="absolute top-2 right-2">Votre vote</Badge>
                )}
                {winner === battle.jam_b && (
                  <Badge className="absolute top-2 right-2 bg-amber-500">Vainqueur</Badge>
                )}
                <div className="flex flex-col h-full">
                  <h3 className="font-medium text-lg mb-2">{battle.jam_b.name}</h3>
                  <img 
                    src={battle.jam_b.jam_images?.[0]?.url || "/placeholder.svg"} 
                    alt={battle.jam_b.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {battle.jam_b.description}
                  </p>
                  <div className="mt-auto">
                    {!expired && !userVoted && (
                      <Button 
                        className="w-full"
                        onClick={() => handleVote(battle.id, battle.jam_b_id)}
                        disabled={voteMutation.isPending}
                      >
                        {voteMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Vote en cours...
                          </>
                        ) : "Voter"}
                      </Button>
                    )}
                    {(expired || userVoted) && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{battle.votes_for_b} votes</span>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/jam/${battle.jam_b_id}`}>
                            Voir détails
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {showResult && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{battle.votes_for_a} votes</span>
                <span>{battle.votes_for_b} votes</span>
              </div>
              <Progress value={progressValue} className="h-2" />
              <div className="flex items-center justify-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {battle.votes_for_a + battle.votes_for_b} votes au total
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              {expired
                ? `Terminé le ${format(parseISO(battle.end_date), 'PPP', { locale: fr })}`
                : `Se termine le ${format(parseISO(battle.end_date), 'PPP', { locale: fr })}`
              }
            </span>
          </div>
          
          {(expired && battle.votes_for_a === battle.votes_for_b) && (
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              <span>Égalité !</span>
            </div>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  const renderSkeletonCard = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-5 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-5 w-[60px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-[200px] w-full mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-[80%] mb-4" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div>
            <Skeleton className="h-[200px] w-full mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-[80%] mb-4" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-[180px]" />
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Battles de Confitures</h1>
        <p className="text-muted-foreground mb-6">
          Votez pour votre confiture préférée et découvrez qui sera couronné champion !
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-auto">
            <TabsTrigger value="current">
              <Fire className="mr-2 h-4 w-4" />
              Battles en cours
            </TabsTrigger>
            <TabsTrigger value="past">
              <Trophy className="mr-2 h-4 w-4" />
              Résultats passés
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="mt-6">
            <div className="max-w-3xl mx-auto">
              {isLoadingActive ? (
                <>
                  {[1, 2].map((_, i) => renderSkeletonCard())}
                </>
              ) : activeBattles && activeBattles.length > 0 ? (
                activeBattles.map(battle => renderBattleCard(battle))
              ) : (
                <div className="text-center py-10">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-medium mb-2">Aucun battle en cours</h2>
                  <p className="text-muted-foreground">
                    Revenez bientôt pour de nouveaux affrontements de confitures !
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="past" className="mt-6">
            <div className="max-w-3xl mx-auto">
              {isLoadingPast ? (
                <>
                  {[1, 2].map((_, i) => renderSkeletonCard())}
                </>
              ) : pastBattles && pastBattles.length > 0 ? (
                pastBattles.map(battle => renderBattleCard(battle, true))
              ) : (
                <div className="text-center py-10">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-medium mb-2">Aucun battle terminé</h2>
                  <p className="text-muted-foreground">
                    Les résultats des battles passés apparaîtront ici.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JamBattles;
