
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, Award, FileText, Eye, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import BattleStatus from '@/components/battle/BattleStatus';
import { fetchBattleById } from '@/utils/battleHelpers';
import { validateBattleJudge, validateBattleCandidate, declareBattleWinner, distributeBattleRewards } from '@/utils/battleAdminHelpers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  BattleCandidateType, 
  BattleJudgeType, 
  BattleParticipantType, 
  NewBattleType, 
  BattleVoteDetailedType, 
  BattleVoteCommentType 
} from '@/types/supabase';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AdminBattleManage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [battle, setBattle] = useState<NewBattleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [voteDetails, setVoteDetails] = useState<BattleVoteDetailedType[]>([]);
  const [voteComments, setVoteComments] = useState<BattleVoteCommentType[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<{
    winner: string;
    participantA: string;
    participantB: string;
    scoreA: number;
    scoreB: number;
  }>({
    winner: '',
    participantA: '',
    participantB: '',
    scoreA: 0,
    scoreB: 0
  });
  const [newsArticle, setNewsArticle] = useState({
    title: '',
    content: '',
    image: null as File | null,
    publishNow: true
  });
  
  // État pour savoir si on affiche le formulaire de publication d'actualité
  const [showNewsForm, setShowNewsForm] = useState(false);
  
  // État pour le dialogue de visualisation des notes des juges
  const [showJudgeVotes, setShowJudgeVotes] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState<string | null>(null);
  const [judgeVotes, setJudgeVotes] = useState<any[]>([]);
  const [judgeComments, setJudgeComments] = useState<string>('');

  useEffect(() => {
    const loadBattle = async () => {
      setLoading(true);
      if (id) {
        const battleData = await fetchBattleById(id);
        setBattle(battleData);
        
        // Si nous avons des participants et que le statut est "vote" ou "termine", chargez les votes
        if (battleData && 
          battleData.battle_participants && 
          battleData.battle_participants.length > 0 && 
          (battleData.status === 'vote' || battleData.status === 'termine')) {
          await loadVotesData();
        }
        
        // Si le battle a un résultat, préremplissons le formulaire de déclaration du gagnant
        if (battleData && battleData.battle_results) {
          setSelectedParticipants({
            winner: battleData.battle_results.winner_id,
            participantA: battleData.battle_results.participant_a_id,
            participantB: battleData.battle_results.participant_b_id,
            scoreA: battleData.battle_results.participant_a_score || 0,
            scoreB: battleData.battle_results.participant_b_score || 0
          });
        }
      }
      setLoading(false);
    };

    loadBattle();
  }, [id]);

  const loadVotesData = async () => {
    if (!id) return;
    
    setLoadingVotes(true);
    try {
      // Charger les votes détaillés
      const { data: votes, error: votesError } = await supabase
        .from('battle_votes_detailed')
        .select('*, judge:judge_id(username:profiles(username)), criteria:criteria_id(*)')
        .eq('battle_id', id);
      
      if (votesError) throw votesError;
      setVoteDetails(votes || []);
      
      // Charger les commentaires
      const { data: comments, error: commentsError } = await supabase
        .from('battle_vote_comments')
        .select('*, judge:judge_id(username:profiles(username))')
        .eq('battle_id', id);
      
      if (commentsError) throw commentsError;
      setVoteComments(comments || []);
      
    } catch (error) {
      console.error('Erreur lors du chargement des votes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des votes.",
        variant: "destructive"
      });
    } finally {
      setLoadingVotes(false);
    }
  };

  const handleValidateCandidate = async (candidateId: string) => {
    if (!id) return;
    
    const success = await validateBattleCandidate(candidateId, id);
    
    if (success) {
      toast({
        title: "Candidat validé",
        description: "Le candidat a été ajouté aux participants de ce battle.",
      });
      // Rafraîchir les données
      const battleData = await fetchBattleById(id);
      setBattle(battleData);
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la validation du candidat.",
        variant: "destructive"
      });
    }
  };

  const handleValidateJudge = async (judgeId: string) => {
    const success = await validateBattleJudge(judgeId);
    
    if (success) {
      toast({
        title: "Juge validé",
        description: "Le juge a été validé pour ce battle.",
      });
      // Rafraîchir les données
      if (id) {
        const battleData = await fetchBattleById(id);
        setBattle(battleData);
      }
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la validation du juge.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateJudgeStatus = async (judgeId: string, field: 'has_ordered' | 'has_received', value: boolean) => {
    try {
      const { error } = await supabase
        .from('battle_judges')
        .update({ [field]: value })
        .eq('id', judgeId);
        
      if (error) throw error;
      
      toast({
        title: "Statut mis à jour",
        description: `Le statut du juge a été mis à jour.`,
      });
      
      // Rafraîchir les données
      if (id) {
        const battleData = await fetchBattleById(id);
        setBattle(battleData);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive"
      });
    }
  };
  
  const viewJudgeVotes = async (judgeId: string) => {
    if (!id) return;
    
    setSelectedJudge(judgeId);
    
    try {
      // Récupérer les votes du juge
      const { data: votes, error: votesError } = await supabase
        .from('battle_votes_detailed')
        .select(`
          score,
          participant:participant_id(username:profiles(username)), 
          criteria:criteria_id(name, description)
        `)
        .eq('battle_id', id)
        .eq('judge_id', judgeId);
        
      if (votesError) throw votesError;
      
      // Récupérer les commentaires du juge
      const { data: comments, error: commentsError } = await supabase
        .from('battle_vote_comments')
        .select('comment, participant:participant_id(username:profiles(username))')
        .eq('battle_id', id)
        .eq('judge_id', judgeId);
        
      if (commentsError) throw commentsError;
      
      setJudgeVotes(votes || []);
      setJudgeComments(comments && comments.length > 0 ? comments[0].comment : '');
      setShowJudgeVotes(true);
      
    } catch (error) {
      console.error('Erreur lors du chargement des votes du juge:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les votes de ce juge.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeclareWinner = async () => {
    if (!id) return;
    
    const { winner, participantA, participantB, scoreA, scoreB } = selectedParticipants;
    
    if (!winner || !participantA || !participantB) {
      toast({
        title: "Données manquantes",
        description: "Veuillez sélectionner les deux participants et un gagnant.",
        variant: "destructive"
      });
      return;
    }
    
    // Vérifier que le gagnant est l'un des deux participants
    if (winner !== participantA && winner !== participantB) {
      toast({
        title: "Erreur de sélection",
        description: "Le gagnant doit être l'un des deux participants.",
        variant: "destructive"
      });
      return;
    }
    
    // Déclarer le gagnant
    const success = await declareBattleWinner(id, winner, participantA, scoreA, participantB, scoreB);
    
    if (success) {
      toast({
        title: "Gagnant déclaré",
        description: "Le gagnant du battle a été enregistré avec succès.",
      });
      
      // Distribuer les récompenses
      const rewardResult = await distributeBattleRewards(id);
      
      if (rewardResult.success) {
        toast({
          title: "Récompenses distribuées",
          description: rewardResult.message,
        });
      } else {
        toast({
          title: "Attention",
          description: rewardResult.message,
          variant: "destructive"
        });
      }
      
      // Rafraîchir les données
      const battleData = await fetchBattleById(id);
      setBattle(battleData);
      
      // Ouvrir automatiquement le formulaire de publication d'actualité
      setShowNewsForm(true);
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déclaration du gagnant.",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateNewsArticle = async () => {
    if (!id || !battle) return;
    
    // Ici, on simule la création d'un article d'actualités - à compléter avec la vraie API
    toast({
      title: "Article créé",
      description: "L'article sur les résultats du battle a été créé.",
    });
    
    // Rediriger vers la page des actualités (à créer)
    // navigate('/admin/news');
    setShowNewsForm(false);
  };

  if (loading) {
    return <div className="container py-8">Chargement...</div>;
  }

  if (!battle) {
    return <div className="container py-8">Battle non trouvé</div>;
  }

  return (
    <div className="container py-8 max-w-6xl">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        asChild
      >
        <Link to="/admin/battles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux battles
        </Link>
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              {battle.theme}
            </h1>
            <BattleStatus battle={battle} />
          </div>
          <p className="text-muted-foreground">
            Gestion et suivi du battle
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/admin/battles/edit/${battle.id}`}>
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="candidates">Candidats</TabsTrigger>
          <TabsTrigger value="judges">Juges</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Détails du battle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Thème</h3>
                  <p>{battle.theme}</p>
                </div>
                <div>
                  <h3 className="font-medium">Contraintes</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(battle.constraints).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Statut</h3>
                  <p>{battle.status}</p>
                </div>
                <div>
                  <h3 className="font-medium">Dates clés</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Inscription: jusqu'au {new Date(battle.registration_end_date).toLocaleDateString('fr-FR')}</li>
                    <li>Production: jusqu'au {new Date(battle.production_end_date).toLocaleDateString('fr-FR')}</li>
                    <li>Votes: jusqu'au {new Date(battle.voting_end_date).toLocaleDateString('fr-FR')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground">Candidats</p>
                    <p className="text-2xl font-bold">{battle.battle_candidates?.length || 0}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground">Participants</p>
                    <p className="text-2xl font-bold">{battle.battle_participants?.length || 0}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground">Juges</p>
                    <p className="text-2xl font-bold">{battle.battle_judges?.length || 0}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground">Récompenses</p>
                    <p className="text-2xl font-bold">{battle.reward_credits} crédits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Candidats</CardTitle>
              <CardDescription>Sélectionnez les candidats qui participeront à ce battle</CardDescription>
            </CardHeader>
            <CardContent>
              {battle.battle_candidates && battle.battle_candidates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Motivation</TableHead>
                      <TableHead>Confiture de référence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {battle.battle_candidates.map((candidate: BattleCandidateType) => (
                      <TableRow key={candidate.id}>
                        <TableCell>{candidate.profile?.username}</TableCell>
                        <TableCell className="max-w-xs truncate">{candidate.motivation}</TableCell>
                        <TableCell>{candidate.reference_jam?.name || 'Aucune'}</TableCell>
                        <TableCell>
                          {candidate.is_selected ? 
                            <Badge variant="secondary">Sélectionné</Badge> : 
                            <Badge variant="outline">En attente</Badge>
                          }
                        </TableCell>
                        <TableCell>
                          {!candidate.is_selected && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex items-center gap-1"
                              onClick={() => handleValidateCandidate(candidate.id)}
                            >
                              <Check className="h-4 w-4" /> Valider
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Aucun candidat pour ce battle.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="judges">
          <Card>
            <CardHeader>
              <CardTitle>Juges</CardTitle>
              <CardDescription>Validez les juges et suivez la progression de leurs évaluations</CardDescription>
            </CardHeader>
            <CardContent>
              {battle.battle_judges && battle.battle_judges.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Juge</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Commande</TableHead>
                      <TableHead>Réception</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {battle.battle_judges.map((judge: BattleJudgeType) => (
                      <TableRow key={judge.id}>
                        <TableCell>{judge.profile?.username}</TableCell>
                        <TableCell>
                          {judge.is_validated ? 
                            <Badge variant="secondary">Validé</Badge> : 
                            <Badge variant="outline">En attente</Badge>
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {judge.has_ordered ? 
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-green-500" 
                                onClick={() => handleUpdateJudgeStatus(judge.id, 'has_ordered', false)}
                              >
                                <Check className="h-4 w-4" />
                              </Button> : 
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-red-500" 
                                onClick={() => handleUpdateJudgeStatus(judge.id, 'has_ordered', true)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {judge.has_received ? 
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-green-500" 
                                onClick={() => handleUpdateJudgeStatus(judge.id, 'has_received', false)}
                              >
                                <Check className="h-4 w-4" />
                              </Button> : 
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-red-500" 
                                onClick={() => handleUpdateJudgeStatus(judge.id, 'has_received', true)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={() => viewJudgeVotes(judge.user_id)}
                          >
                            <Eye className="h-4 w-4" /> Voir
                          </Button>
                        </TableCell>
                        <TableCell>
                          {!judge.is_validated && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex items-center gap-1"
                              onClick={() => handleValidateJudge(judge.id)}
                            >
                              <Check className="h-4 w-4" /> Valider
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Aucun juge pour ce battle.
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Dialog pour afficher les votes d'un juge */}
          <Dialog open={showJudgeVotes} onOpenChange={setShowJudgeVotes}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Votes du juge</DialogTitle>
                <DialogDescription>
                  Détails des votes et commentaires du juge
                </DialogDescription>
              </DialogHeader>
              
              {judgeVotes.length > 0 ? (
                <div className="space-y-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead>Critère</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {judgeVotes.map((vote, index) => (
                        <TableRow key={index}>
                          <TableCell>{vote.participant?.username || 'Inconnu'}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{vote.criteria?.name || 'Inconnu'}</p>
                              <p className="text-xs text-muted-foreground">{vote.criteria?.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>{vote.score}/5</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div>
                    <h3 className="font-medium mb-2">Commentaires</h3>
                    <div className="bg-muted p-4 rounded-md">
                      {judgeComments || 'Aucun commentaire'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Ce juge n'a pas encore soumis de votes.
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="results">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Résultats du battle</CardTitle>
                <CardDescription>Proclamer le gagnant et attribuer les récompenses</CardDescription>
              </CardHeader>
              <CardContent>
                {battle.status === 'termine' && battle.battle_results ? (
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-6 text-center">
                      <Award className="h-12 w-12 text-jam-honey mx-auto mb-2" />
                      <h3 className="text-xl font-medium">Gagnant</h3>
                      <p className="text-lg">{battle.battle_results.winner?.username}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Participant A</p>
                        <p className="font-medium">{battle.battle_results.participant_a?.username}</p>
                        <p className="text-lg font-bold mt-1">{battle.battle_results.participant_a_score} pts</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Participant B</p>
                        <p className="font-medium">{battle.battle_results.participant_b?.username}</p>
                        <p className="text-lg font-bold mt-1">{battle.battle_results.participant_b_score} pts</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <p className="flex items-center">
                        <span className="flex-1">Récompenses distribuées:</span> 
                        {battle.battle_results.reward_distributed ? 
                          <Check className="text-green-500 h-5 w-5" /> : 
                          <X className="text-red-500 h-5 w-5" />
                        }
                      </p>
                    </div>
                  </div>
                ) : battle.status === 'vote' ? (
                  <div className="space-y-6">
                    <p className="text-muted-foreground">
                      Déterminez le gagnant du battle et les scores finaux.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="participantA">Participant A</Label>
                        <select 
                          id="participantA"
                          className="w-full p-2 border rounded-md"
                          value={selectedParticipants.participantA}
                          onChange={(e) => setSelectedParticipants({
                            ...selectedParticipants,
                            participantA: e.target.value
                          })}
                        >
                          <option value="">Sélectionner un participant</option>
                          {battle.battle_participants?.map((participant: BattleParticipantType) => (
                            <option key={participant.id} value={participant.id}>
                              {participant.profile?.username || 'Participant sans nom'}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="scoreA">Score du participant A</Label>
                        <Input 
                          id="scoreA" 
                          type="number" 
                          min="0"
                          value={selectedParticipants.scoreA}
                          onChange={(e) => setSelectedParticipants({
                            ...selectedParticipants,
                            scoreA: parseInt(e.target.value, 10) || 0
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="participantB">Participant B</Label>
                        <select 
                          id="participantB"
                          className="w-full p-2 border rounded-md"
                          value={selectedParticipants.participantB}
                          onChange={(e) => setSelectedParticipants({
                            ...selectedParticipants,
                            participantB: e.target.value
                          })}
                        >
                          <option value="">Sélectionner un participant</option>
                          {battle.battle_participants?.map((participant: BattleParticipantType) => (
                            <option key={participant.id} value={participant.id}>
                              {participant.profile?.username || 'Participant sans nom'}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="scoreB">Score du participant B</Label>
                        <Input 
                          id="scoreB" 
                          type="number"
                          min="0" 
                          value={selectedParticipants.scoreB}
                          onChange={(e) => setSelectedParticipants({
                            ...selectedParticipants,
                            scoreB: parseInt(e.target.value, 10) || 0
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="winner">Gagnant</Label>
                        <select 
                          id="winner"
                          className="w-full p-2 border rounded-md"
                          value={selectedParticipants.winner}
                          onChange={(e) => setSelectedParticipants({
                            ...selectedParticipants,
                            winner: e.target.value
                          })}
                        >
                          <option value="">Sélectionner le gagnant</option>
                          {selectedParticipants.participantA && (
                            <option value={selectedParticipants.participantA}>
                              Participant A
                            </option>
                          )}
                          {selectedParticipants.participantB && (
                            <option value={selectedParticipants.participantB}>
                              Participant B
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full">
                          Proclamer le gagnant
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer les résultats du battle</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir proclamer le gagnant ? Cette action est irréversible et attribuera automatiquement les récompenses.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeclareWinner}>Confirmer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">
                      Les résultats seront disponibles une fois que le battle sera en phase de vote.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Publication des résultats</CardTitle>
                <CardDescription>Publiez une actualité sur les résultats du battle</CardDescription>
              </CardHeader>
              <CardContent>
                {battle.status === 'termine' ? (
                  <div className="space-y-4">
                    {!showNewsForm ? (
                      <>
                        <p>Publiez une actualité pour annoncer les résultats du battle à la communauté.</p>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => setShowNewsForm(true)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Créer une actualité
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newsTitle">Titre de l'actualité</Label>
                          <Input 
                            id="newsTitle" 
                            placeholder="Résultats du Battle de confiture - [Thème]"
                            value={newsArticle.title}
                            onChange={(e) => setNewsArticle({
                              ...newsArticle,
                              title: e.target.value
                            })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newsContent">Contenu</Label>
                          <Textarea 
                            id="newsContent"
                            placeholder="Décrivez les résultats du battle et félicitez le gagnant..."
                            className="min-h-[150px]"
                            value={newsArticle.content}
                            onChange={(e) => setNewsArticle({
                              ...newsArticle,
                              content: e.target.value
                            })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newsImage">Image (optionnelle)</Label>
                          <Input 
                            id="newsImage" 
                            type="file" 
                            onChange={(e) => {
                              const file = e.target.files ? e.target.files[0] : null;
                              setNewsArticle({
                                ...newsArticle,
                                image: file
                              });
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="publishNow"
                            checked={newsArticle.publishNow}
                            onChange={(e) => setNewsArticle({
                              ...newsArticle,
                              publishNow: e.target.checked
                            })}
                          />
                          <Label htmlFor="publishNow">Publier immédiatement</Label>
                        </div>
                        
                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            className="sm:flex-1"
                            onClick={() => setShowNewsForm(false)}
                          >
                            Annuler
                          </Button>
                          <Button 
                            className="sm:flex-1"
                            onClick={handleCreateNewsArticle}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            {newsArticle.publishNow ? "Publier l'actualité" : "Enregistrer en brouillon"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    La publication des résultats sera disponible une fois le battle terminé.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBattleManage;
