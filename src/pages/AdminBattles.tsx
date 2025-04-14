
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Award, 
  Calendar, 
  Clock, 
  Flame, 
  FlagTriangleRight,
  Star,
  Loader2
} from 'lucide-react';
import { NewBattleType } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BattleStatus from '@/components/battle/BattleStatus';

const AdminBattles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('manage');
  const [battles, setBattles] = useState<NewBattleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [battleToDelete, setBattleToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  
  // Fetch battles on initial load
  useEffect(() => {
    if (activeTab === 'manage') {
      fetchBattles();
    }
  }, [activeTab]);

  const fetchBattles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jam_battles_new')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Parse JSON constraints to object for each battle
      const parsedBattles = data?.map(battle => ({
        ...battle,
        constraints: typeof battle.constraints === 'string' 
          ? JSON.parse(battle.constraints) 
          : battle.constraints
      })) as NewBattleType[];
      
      setBattles(parsedBattles || []);
    } catch (error) {
      console.error('Error fetching battles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les battles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (battleId: string) => {
    setBattleToDelete(battleId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteBattle = async () => {
    if (!battleToDelete) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('jam_battles_new')
        .delete()
        .eq('id', battleToDelete);
        
      if (error) throw error;
      
      // Remove from local state
      setBattles(battles.filter(battle => battle.id !== battleToDelete));
      
      toast({
        title: "Suppression réussie",
        description: "Le battle a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Error deleting battle:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le battle. Vérifiez qu'il n'y a pas de données liées.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setBattleToDelete(null);
    }
  };
  
  const handleToggleFeatured = async (battleId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('jam_battles_new')
        .update({ is_featured: !currentFeatured })
        .eq('id', battleId);
        
      if (error) throw error;
      
      // Update local state
      setBattles(battles.map(battle => 
        battle.id === battleId 
          ? { ...battle, is_featured: !currentFeatured } 
          : battle
      ));
      
      toast({
        title: currentFeatured ? "Battle non mis en avant" : "Battle mis en avant",
        description: currentFeatured 
          ? "Le battle n'est plus mis en avant sur la page d'accueil." 
          : "Le battle est maintenant mis en avant sur la page d'accueil.",
      });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de mise en avant.",
        variant: "destructive",
      });
    }
  };
  
  const handleBattleCreated = (battleId: string) => {
    navigate(`/battles/${battleId}`);
  };

  // Guard for non-admin users
  if (!roleLoading && !isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="container py-8 max-w-5xl">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        asChild
      >
        <Link to="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'administration
        </Link>
      </Button>

      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Administration des Battles</h1>
        <p className="text-muted-foreground">Créez et gérez les battles de confitures pour la communauté Confito.</p>
      </div>
      
      <Tabs defaultValue="manage" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="manage">Gérer les Battles</TabsTrigger>
            <TabsTrigger value="create">Créer un Battle</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gérer les Battles existants</CardTitle>
                <CardDescription>
                  Consultez et gérez les battles en cours et passés.
                </CardDescription>
              </div>
              <Button asChild>
                <Link to="/admin/battles/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un battle
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between">
                          <Skeleton className="h-10 w-24" />
                          <Skeleton className="h-10 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : battles.length === 0 ? (
                <div className="text-center py-10">
                  <FlagTriangleRight className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Aucun battle</h3>
                  <p className="mt-2 text-muted-foreground">
                    Vous n'avez pas encore créé de battle. Commencez par en créer un !
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {battles.map((battle) => (
                    <Card key={battle.id}>
                      <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {battle.theme}
                            {battle.is_featured && (
                              <Badge variant="secondary" className="ml-2">
                                <Star className="h-3 w-3 mr-1" /> 
                                Mis en avant
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-4 mt-1">
                              <BattleStatus status={battle.status} />
                              
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {battle.registration_start_date ? (
                                  <span>
                                    {format(parseISO(battle.registration_start_date), "dd MMM yyyy", { locale: fr })}
                                  </span>
                                ) : "Date non définie"}
                              </span>
                              
                              <span className="flex items-center">
                                <Users className="h-3.5 w-3.5 mr-1" />
                                {battle.min_jams_required} confiture(s) min.
                              </span>
                              
                              <span className="flex items-center">
                                <Award className="h-3.5 w-3.5 mr-1" />
                                {battle.reward_credits} crédits
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button 
                            variant="outline"
                            size="sm" 
                            asChild
                          >
                            <Link to={`/admin/battles/edit/${battle.id}`}>
                              <Edit className="mr-1 h-3.5 w-3.5" />
                              Modifier
                            </Link>
                          </Button>
                          
                          <Button 
                            variant="outline"
                            size="sm" 
                            asChild
                          >
                            <Link to={`/admin/battles/manage/${battle.id}`}>
                              <Users className="mr-1 h-3.5 w-3.5" />
                              Gérer participants
                            </Link>
                          </Button>
                          
                          <Button 
                            variant={battle.is_featured ? "secondary" : "outline"}
                            size="sm" 
                            onClick={() => handleToggleFeatured(battle.id, !!battle.is_featured)}
                          >
                            <Flame className="mr-1 h-3.5 w-3.5" />
                            {battle.is_featured ? "Ne plus mettre en avant" : "Mettre en avant"}
                          </Button>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteClick(battle.id)}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Supprimer
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/battles/${battle.id}`}>
                              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                              Voir
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créer un nouveau Battle</CardTitle>
              <CardDescription>
                Définissez les paramètres du nouveau battle de confitures qui sera proposé à la communauté.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Current BattleForm component */}
              {/* Will link to AdminBattleCreate.tsx */}
              <div className="text-center p-6">
                <Button asChild>
                  <Link to="/admin/battles/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un nouveau battle
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et supprimera définitivement ce battle et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBattle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBattles;
