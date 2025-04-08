
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  CalendarDays, 
  ChevronLeft, 
  Users, 
  Medal, 
  Clock, 
  Trophy, 
  User, 
  ShieldCheck,
  Info,
  Check,
  UserCheck,
  X,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NewBattleType, BattleCandidateType, BattleParticipantType, BattleJudgeType } from '@/types/supabase';
import BattleStatus from '@/components/battle/BattleStatus';
import BattleCandidateForm from '@/components/battle/BattleCandidateForm';
import { useEligibilityCheck } from '@/utils/battleHelpers';
import { validateBattleCandidate, validateBattleJudge } from '@/utils/battleAdminHelpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileInitials } from '@/utils/supabaseHelpers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUserRole } from '@/hooks/useUserRole';

const BattleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkEligibility } = useEligibilityCheck();
  const { isAdmin } = useUserRole();
  
  const [battle, setBattle] = useState<NewBattleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isJudge, setIsJudge] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  
  // Charger les données du battle
  useEffect(() => {
    const fetchBattleData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data: battleData, error: battleError } = await supabase
          .from('jam_battles_new')
          .select(`
            *,
            battle_participants (
              *,
              profile: profiles (*),
              jam: jams (*, jam_images (*))
            ),
            battle_judges (
              *,
              profile: profiles (*)
            ),
            battle_candidates (
              *,
              profile: profiles (*),
              reference_jam: jams (*)
            ),
            battle_results (*)
          `)
          .eq('id', id)
          .single();
          
        if (battleError) throw battleError;
        
        // Convertir explicitement les données en NewBattleType
        const typedBattleData = battleData as unknown as NewBattleType;
        setBattle(typedBattleData);
        
        // Vérifier l'utilisateur actuel
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Vérifier si l'utilisateur est un juge
          const isUserJudge = typedBattleData.battle_judges?.some(
            judge => judge.user_id === currentUser.id
          );
          setIsJudge(!!isUserJudge);
          
          // Vérifier si l'utilisateur est un participant
          const isUserParticipant = typedBattleData.battle_participants?.some(
            participant => participant.user_id === currentUser.id
          );
          setIsParticipant(!!isUserParticipant);
          
          // Vérifier si l'utilisateur a déjà postulé
          const hasUserApplied = typedBattleData.battle_candidates?.some(
            candidate => candidate.user_id === currentUser.id
          );
          setHasApplied(!!hasUserApplied);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement du battle:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du battle.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBattleData();
  }, [id, toast]);
  
  const handleApplyAsCandidateClick = async () => {
    if (!user) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour postuler à un battle.",
        variant: "destructive"
      });
      return;
    }
    
    if (!id) return;
    
    const isEligible = await checkEligibility(id);
    
    if (isEligible) {
      setShowCandidateForm(true);
    }
  };
  
  const handleApplyAsJudgeClick = async () => {
    if (!user) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour devenir juge.",
        variant: "destructive"
      });
      return;
    }
    
    if (!id || !battle) return;
    
    try {
      // Vérifier si le nombre maximum de juges est atteint
      if (battle.battle_judges && battle.battle_judges.length >= (battle.max_judges || 10)) {
        toast({
          title: "Impossible de s'inscrire",
          description: "Le nombre maximum de juges est déjà atteint pour ce battle.",
          variant: "destructive"
        });
        return;
      }
      
      // Vérifier si l'utilisateur est déjà juge
      if (isJudge) {
        toast({
          title: "Déjà inscrit",
          description: "Vous êtes déjà inscrit comme juge pour ce battle.",
          variant: "destructive"
        });
        return;
      }
      
      // S'inscrire comme juge avec l'ID utilisateur explicitement défini
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        toast({
          title: "Erreur d'authentification",
          description: "Impossible de vous identifier. Veuillez vous reconnecter.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('battle_judges')
        .insert({
          battle_id: id,
          user_id: session.user.id
        });
        
      if (error) throw error;
      
      toast({
        title: "Inscription réussie",
        description: "Vous êtes maintenant inscrit comme juge pour ce battle!",
      });
      
      // Rafraîchir les données
      window.location.reload();
      
    } catch (error: any) {
      console.error("Erreur lors de l'inscription comme juge:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription comme juge.",
        variant: "destructive"
      });
    }
  };
  
  const handleCandidateSuccess = () => {
    setShowCandidateForm(false);
    setHasApplied(true);
    
    // Rafraîchir les données
    window.location.reload();
  };
  
  // Fonctions pour l'administrateur
  const handleValidateCandidate = async (candidateId: string) => {
    if (!id || !isAdmin) return;
    
    setProcessingAction(candidateId);
    
    try {
      const success = await validateBattleCandidate(candidateId, id);
      
      if (success) {
        toast({
          title: "Candidat validé",
          description: "Le candidat a été ajouté aux participants du battle.",
        });
        
        // Rafraîchir les données
        window.location.reload();
      } else {
        throw new Error("Erreur lors de la validation du candidat");
      }
    } catch (error: any) {
      console.error("Erreur lors de la validation du candidat:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la validation du candidat.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };
  
  const handleValidateJudge = async (judgeId: string) => {
    if (!isAdmin) return;
    
    setProcessingAction(judgeId);
    
    try {
      const success = await validateBattleJudge(judgeId);
      
      if (success) {
        toast({
          title: "Juge validé",
          description: "Le juge a été validé pour ce battle.",
        });
        
        // Rafraîchir les données
        window.location.reload();
      } else {
        throw new Error("Erreur lors de la validation du juge");
      }
    } catch (error: any) {
      console.error("Erreur lors de la validation du juge:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la validation du juge.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };
  
  if (loading) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Chargement du battle...</p>
      </div>
    );
  }
  
  if (!battle) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Battle non trouvé</h1>
        <p className="text-muted-foreground mb-8">Le battle que vous recherchez n'existe pas ou a été supprimé.</p>
        <Button asChild>
          <Link to="/battles">Retourner aux battles</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <Button variant="outline" size="sm" className="w-fit" asChild>
          <Link to="/battles">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Tous les battles
          </Link>
        </Button>
        
        {isAdmin && (
          <Button size="sm" variant="outline" asChild>
            <Link to={`/battles/admin`}>
              <ShieldCheck className="h-4 w-4 mr-1" />
              Admin
            </Link>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">{battle.theme}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {Object.entries(battle.constraints).map(([key, value]) => (
                <Badge variant="outline" key={key} className="text-xs">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          </div>
          
          <BattleStatus battle={battle} />
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 md:w-fit">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="judges">Juges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-sm text-muted-foreground flex items-start gap-2">
                        <CalendarDays className="h-4 w-4 mt-0.5" />
                        <div>
                          <span className="block">Inscriptions: <strong>{format(new Date(battle.registration_start_date), 'd MMM', { locale: fr })} - {format(new Date(battle.registration_end_date), 'd MMM yyyy', { locale: fr })}</strong></span>
                          <span className="block">Production: <strong>{format(new Date(battle.registration_end_date), 'd MMM')} - {format(new Date(battle.production_end_date), 'd MMM yyyy', { locale: fr })}</strong></span>
                          <span className="block">Votes: <strong>{format(new Date(battle.production_end_date), 'd MMM')} - {format(new Date(battle.voting_end_date), 'd MMM yyyy', { locale: fr })}</strong></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div className="space-y-1">
                          <div>Juges: <strong>{battle.battle_judges?.length || 0} / {battle.max_judges}</strong></div>
                          <div>Remise: <strong>{battle.judge_discount_percent}%</strong></div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <div>
                          <span>Récompense: <strong>{battle.reward_credits} crédits</strong></span>
                          {battle.reward_description && <span className="block">{battle.reward_description}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {(battle.status === 'inscription' || battle.status === 'selection') && (
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Inscriptions en cours</AlertTitle>
                      <AlertDescription>
                        {battle.status === 'inscription' ? (
                          `Les inscriptions pour ce battle sont ouvertes jusqu'au ${format(new Date(battle.registration_end_date), 'd MMMM yyyy', { locale: fr })}.`
                        ) : (
                          `La sélection des participants est en cours. Les résultats seront annoncés prochainement.`
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
              
              {showCandidateForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Postuler au battle</CardTitle>
                    <CardDescription>
                      Dites-nous pourquoi vous souhaitez participer à ce battle et quelle confiture vous comptez préparer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BattleCandidateForm battle={battle} onSuccess={handleCandidateSuccess} />
                  </CardContent>
                </Card>
              )}
              
              {battle.battle_results && battle.status === 'termine' && (
                <Card className="border-2 border-amber-300 bg-amber-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Résultats du battle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <p className="text-lg font-medium mb-4">
                        Félicitations au gagnant !
                      </p>
                      <div className="mb-6">
                        {/* Afficher le gagnant ici */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="participants" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participants</CardTitle>
                  <CardDescription>
                    {battle.status === 'inscription' || battle.status === 'selection' ? (
                      `Candidatures pour le battle (${battle.battle_candidates?.length || 0})`
                    ) : (
                      `Les confituriers qui s'affrontent dans ce battle (${battle.battle_participants?.length || 0}/2)`
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(battle.status === 'inscription' || battle.status === 'selection') && (
                    <div className="space-y-4">
                      {battle.battle_candidates && battle.battle_candidates.length > 0 ? (
                        battle.battle_candidates.map((candidate: BattleCandidateType) => (
                          <div key={candidate.id} className="p-4 border rounded-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 mb-2">
                                <Avatar>
                                  <AvatarImage src={candidate.profile?.avatar_url || undefined} />
                                  <AvatarFallback>{getProfileInitials(candidate.profile?.username)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{candidate.profile?.username}</p>
                                  {candidate.is_selected && (
                                    <Badge className="mt-1">Sélectionné</Badge>
                                  )}
                                </div>
                              </div>
                              
                              {isAdmin && battle.status === 'selection' && !candidate.is_selected && (
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1"
                                  onClick={() => handleValidateCandidate(candidate.id)}
                                  disabled={processingAction === candidate.id}
                                >
                                  {processingAction === candidate.id ? (
                                    <span className="inline-block animate-spin">⏳</span>
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                  <span>Valider</span>
                                </Button>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-2">{candidate.motivation}</p>
                            
                            {candidate.reference_jam && (
                              <div className="mt-3 flex items-start gap-2">
                                <span className="text-xs bg-muted px-2 py-1 rounded">Référence:</span>
                                <span className="text-sm">{candidate.reference_jam.name}</span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Aucune candidature pour le moment.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {battle.status !== 'inscription' && battle.status !== 'selection' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {battle.battle_participants && battle.battle_participants.map((participant: BattleParticipantType) => (
                        <Card key={participant.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={participant.profile?.avatar_url || undefined} />
                                <AvatarFallback>{getProfileInitials(participant.profile?.username)}</AvatarFallback>
                              </Avatar>
                              <CardTitle className="text-base">{participant.profile?.username}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {participant.jam ? (
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium">{participant.jam.name}</h4>
                                  <p className="text-sm text-muted-foreground">{participant.jam.description}</p>
                                </div>
                                
                                {participant.jam.jam_images && participant.jam.jam_images.length > 0 && (
                                  <div className="aspect-[4/3] overflow-hidden rounded-md">
                                    <img 
                                      src={participant.jam.jam_images[0].url} 
                                      alt={participant.jam.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                
                                <div className="flex flex-wrap gap-1">
                                  {participant.jam.ingredients.map((ingredient, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{ingredient}</Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="py-6 text-center text-muted-foreground">
                                Ce participant n'a pas encore créé sa confiture.
                              </div>
                            )}
                          </CardContent>
                          {participant.jam && (
                            <CardFooter className="pt-0">
                              <Button variant="outline" className="w-full text-xs" asChild>
                                <Link to={`/jam/${participant.jam.id}`}>
                                  Voir la confiture
                                </Link>
                              </Button>
                            </CardFooter>
                          )}
                        </Card>
                      ))}
                      
                      {(!battle.battle_participants || battle.battle_participants.length === 0) && (
                        <div className="md:col-span-2 text-center py-8 text-muted-foreground">
                          Aucun participant sélectionné pour le moment.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="judges" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Juges</CardTitle>
                  <CardDescription>
                    Les membres de la communauté qui vont juger ce battle ({battle.battle_judges?.length || 0}/{battle.max_judges})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {battle.battle_judges && battle.battle_judges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {battle.battle_judges.map((judge: BattleJudgeType) => (
                        <div key={judge.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={judge.profile?.avatar_url || undefined} />
                              <AvatarFallback>{getProfileInitials(judge.profile?.username)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{judge.profile?.username}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {judge.has_ordered && (
                                  <Badge variant="outline" className="text-xs">A commandé</Badge>
                                )}
                                {judge.has_received && (
                                  <Badge variant="outline" className="text-xs">A reçu</Badge>
                                )}
                                {judge.is_validated && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-800 border-green-200">Validé</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isAdmin && !judge.is_validated && (
                            <Button 
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => handleValidateJudge(judge.id)}
                              disabled={processingAction === judge.id}
                            >
                              {processingAction === judge.id ? (
                                <span className="inline-block animate-spin">⏳</span>
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              <span>Valider</span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun juge inscrit pour le moment.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {battle.status === 'inscription' && (
                <>
                  {(!hasApplied && !isParticipant && !showCandidateForm) && (
                    <Button 
                      onClick={handleApplyAsCandidateClick}
                      className="w-full"
                    >
                      Postuler comme participant
                    </Button>
                  )}
                  
                  {(hasApplied && !isParticipant) && (
                    <Button disabled className="w-full">
                      Candidature envoyée
                    </Button>
                  )}
                  
                  {isParticipant && (
                    <Button disabled className="w-full">
                      Vous êtes participant
                    </Button>
                  )}
                  
                  <Separator />
                  
                  {!isJudge && battle.battle_judges && battle.battle_judges.length < battle.max_judges && (
                    <Button 
                      onClick={handleApplyAsJudgeClick}
                      variant="outline" 
                      className="w-full"
                    >
                      Devenir juge
                    </Button>
                  )}
                  
                  {isJudge && (
                    <Button disabled variant="outline" className="w-full">
                      Vous êtes juge
                    </Button>
                  )}
                  
                  {battle.battle_judges && battle.battle_judges.length >= battle.max_judges && !isJudge && (
                    <Button disabled variant="outline" className="w-full">
                      Nombre maximum de juges atteint
                    </Button>
                  )}
                </>
              )}
              
              {battle.status === 'selection' && (
                <>
                  {hasApplied && !isParticipant && (
                    <div className="text-center p-4 bg-muted/30 rounded-md">
                      <p className="text-sm">Votre candidature est en cours d'examen. Les résultats seront annoncés prochainement.</p>
                    </div>
                  )}
                  
                  {isParticipant && (
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800 font-medium">Félicitations ! Vous avez été sélectionné comme participant.</p>
                    </div>
                  )}
                </>
              )}
              
              {/* Autres actions en fonction du statut du battle */}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Règles du battle</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                <strong>1. Inscription et sélection</strong><br />
                Les utilisateurs peuvent postuler pour participer au battle. L'administrateur sélectionnera deux participants.
              </p>
              <p>
                <strong>2. Production et envoi</strong><br />
                Chaque participant doit produire 20 pots identiques et envoyer un pot à son concurrent et aux juges.
              </p>
              <p>
                <strong>3. Évaluation</strong><br />
                Les juges commandent les deux pots à prix remisé, et évaluent les confitures selon 6 critères.
              </p>
              <p>
                <strong>4. Récompense</strong><br />
                Le vainqueur reçoit {battle.reward_credits} crédits et gagne des points dans le classement Battle Stars.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BattleDetails;
