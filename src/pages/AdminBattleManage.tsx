
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, Award, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BattleStatus } from '@/components/battle/BattleStatus';
import { fetchBattleById } from '@/utils/battleHelpers';
import { validateBattleJudge, validateBattleCandidate } from '@/utils/battleAdminHelpers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { BattleCandidateType, BattleJudgeType, BattleParticipantType, NewBattleType } from '@/types/supabase';

const AdminBattleManage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [battle, setBattle] = useState<NewBattleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadBattle = async () => {
      setLoading(true);
      if (id) {
        const battleData = await fetchBattleById(id);
        setBattle(battleData);
      }
      setLoading(false);
    };

    loadBattle();
  }, [id]);

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
            <BattleStatus status={battle.status} />
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
                            <Badge variant="success">Sélectionné</Badge> : 
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {battle.battle_judges.map((judge: BattleJudgeType) => (
                      <TableRow key={judge.id}>
                        <TableCell>{judge.profile?.username}</TableCell>
                        <TableCell>
                          {judge.is_validated ? 
                            <Badge variant="success">Validé</Badge> : 
                            <Badge variant="outline">En attente</Badge>
                          }
                        </TableCell>
                        <TableCell>
                          {judge.has_ordered ? 
                            <Check className="h-4 w-4 text-green-500" /> : 
                            <X className="h-4 w-4 text-red-500" />
                          }
                        </TableCell>
                        <TableCell>
                          {judge.has_received ? 
                            <Check className="h-4 w-4 text-green-500" /> : 
                            <X className="h-4 w-4 text-red-500" />
                          }
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
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">
                      Les résultats seront disponibles une fois que le battle sera terminé.
                    </p>
                    <Button className="mt-4" disabled={battle.status !== 'vote'}>
                      Clôturer le battle et procéder au comptage
                    </Button>
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
                    <p>Publiez une actualité pour annoncer les résultats du battle à la communauté.</p>
                    <Button className="w-full" variant="outline" disabled={battle.status !== 'termine'}>
                      <FileText className="mr-2 h-4 w-4" />
                      Créer une actualité
                    </Button>
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
