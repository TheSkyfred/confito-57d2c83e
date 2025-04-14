
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEligibilityCheck } from '@/utils/battleHelpers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, Calendar, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { NewBattleType } from '@/types/supabase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

const BattleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isJudgeRegistering, setIsJudgeRegistering] = useState(false);
  const [formData, setFormData] = useState({
    motivation: "",
    referenceJamId: ""
  });
  
  // Check user eligibility
  const { isEligible, loading: eligibilityLoading, error: eligibilityError } = useEligibilityCheck(user?.id, id);

  const { data: battle, isLoading, error } = useQuery({
    queryKey: ['battle', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      
      const { data, error } = await supabase
        .from('jam_battles_new')
        .select(`
          *,
          battle_participants (*, profile:user_id (*)),
          battle_judges (*, profile:user_id (*)),
          battle_candidates (*, profile:user_id (*)),
          battle_results (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('No battle found');
      
      return data as unknown as NewBattleType;
    }
  });
  
  const handleRegisterAsCandidate = async () => {
    setIsRegistering(true);
    try {
      if (!user || !id) throw new Error("Missing user or battle ID");
      
      const { error } = await supabase
        .from('battle_candidates')
        .insert([{
          battle_id: id,
          user_id: user.id,
          motivation: formData.motivation,
          reference_jam_id: formData.referenceJamId || null
        }]);
        
      if (error) throw error;
      
      toast({
        title: "Inscription réussie",
        description: "Votre candidature a été soumise avec succès."
      });
      
      queryClient.invalidateQueries({queryKey: ['battle', id]});
      
    } catch (err) {
      console.error("Error registering as candidate:", err);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de votre inscription.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleRegisterAsJudge = async () => {
    setIsJudgeRegistering(true);
    try {
      if (!user || !id) throw new Error("Missing user or battle ID");
      
      const { error } = await supabase
        .from('battle_judges')
        .insert([{
          battle_id: id,
          user_id: user.id
        }]);
        
      if (error) throw error;
      
      toast({
        title: "Inscription réussie",
        description: "Votre inscription en tant que juge a été soumise avec succès."
      });
      
      queryClient.invalidateQueries({queryKey: ['battle', id]});
      
    } catch (err) {
      console.error("Error registering as judge:", err);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de votre inscription en tant que juge.",
        variant: "destructive"
      });
    } finally {
      setIsJudgeRegistering(false);
    }
  };
  
  const isRegistrationOpen = () => {
    if (!battle) return false;
    const now = new Date();
    const registrationEndDate = parseISO(battle.registration_end_date);
    return isBefore(now, registrationEndDate);
  };
  
  const isVotingOpen = () => {
    if (!battle) return false;
    const now = new Date();
    const votingEndDate = parseISO(battle.voting_end_date);
    return isBefore(now, votingEndDate) && isAfter(now, parseISO(battle.production_end_date));
  };
  
  const hasUserRegisteredAsCandidate = () => {
    if (!battle || !user) return false;
    return battle.battle_candidates?.some(candidate => candidate.user_id === user.id) || false;
  };
  
  const hasUserRegisteredAsJudge = () => {
    if (!battle || !user) return false;
    return battle.battle_judges?.some(judge => judge.user_id === user.id) || false;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
        </div>
      </div>
    );
  }

  if (error || !battle) {
    return <div className="container py-8">Battle non trouvé</div>;
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button asChild variant="outline">
            <Link to="/battles">
              Retour aux battles
            </Link>
          </Button>
          {battle.is_featured && (
            <Badge variant="secondary">En vedette</Badge>
          )}
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">
          {battle.theme}
        </h1>
        <p className="text-muted-foreground">
          Découvrez les détails de ce battle passionnant
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails du Battle</CardTitle>
          <CardDescription>
            Informations clés et dates importantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Inscriptions jusqu'au{' '}
              {format(parseISO(battle.registration_end_date), 'PPP', {
                locale: fr,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{battle.max_judges} juges maximum</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Vote final le{' '}
              {format(parseISO(battle.voting_end_date), 'PPP', { locale: fr })}
            </span>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Récompenses</h4>
            <p className="text-muted-foreground">
              {battle.reward_credits} crédits et {battle.reward_description || 'un badge exclusif'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comment Participer</CardTitle>
          <CardDescription>
            Rejoignez le battle et montrez votre talent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {eligibilityLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : eligibilityError ? (
            <div className="text-red-500">Erreur lors de la vérification de l'éligibilité.</div>
          ) : isEligible ? (
            <div className="space-y-2">
              <p>Vous êtes éligible pour participer à ce battle !</p>
              {isRegistrationOpen() ? (
                hasUserRegisteredAsCandidate() ? (
                  <Badge variant="outline">Déjà inscrit</Badge>
                ) : (
                  <div className="space-y-2">
                    <form onSubmit={(e) => {
                          e.preventDefault();
                          handleRegisterAsCandidate();
                        }} className="space-y-4">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <label htmlFor="motivation" className="text-sm font-medium leading-none">Motivation</label>
                            <Textarea
                              id="motivation"
                              placeholder="Expliquez pourquoi vous souhaitez participer à ce battle"
                              value={formData.motivation}
                              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="referenceJamId" className="text-sm font-medium leading-none">Confiture de référence (optionnel)</label>
                            <Input
                              id="referenceJamId"
                              placeholder="ID de votre confiture la plus réussie"
                              value={formData.referenceJamId}
                              onChange={(e) => setFormData({ ...formData, referenceJamId: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <Button type="submit" disabled={isRegistering}>
                          {isRegistering ? (
                            <>
                              Inscription en cours...
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            </>
                          ) : "S'inscrire"}
                        </Button>
                      </form>
                  </div>
                )
              ) : (
                <Badge variant="outline">Inscriptions fermées</Badge>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                Malheureusement, vous ne remplissez pas les critères pour
                participer à ce battle.
              </p>
              <Button variant="secondary" disabled>
                Non éligible
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Devenir Juge</CardTitle>
          <CardDescription>
            Participez à l'évaluation des confitures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRegistrationOpen() ? (
            hasUserRegisteredAsJudge() ? (
              <Badge variant="outline">Déjà inscrit comme juge</Badge>
            ) : (
              <Button onClick={handleRegisterAsJudge} disabled={isJudgeRegistering}>
                {isJudgeRegistering ? (
                  <>
                    Inscription en cours...
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : "S'inscrire comme juge"}
              </Button>
            )
          ) : (
            <Badge variant="outline">Inscriptions fermées</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BattleDetails;
