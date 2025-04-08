
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Swords, Utensils } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const [activeTab, setActiveTab] = useState('jams');
  
  // Always call hooks at the top level, regardless of user role
  const { data: pendingJams, isLoading: isLoadingPendingJams } = useQuery({
    queryKey: ['admin', 'pendingJams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jams')
        .select(`
          id,
          name,
          created_at,
          status,
          profiles (username)
        `)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isModerator // Only fetch data if user is moderator
  });

  const { data: activeBattles, isLoading: isLoadingBattles } = useQuery({
    queryKey: ['admin', 'battles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jam_battles_new')
        .select(`
          id,
          theme,
          status,
          registration_start_date,
          voting_end_date
        `)
        .order('registration_start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isModerator // Only fetch data if user is moderator
  });

  // Rediriger l'utilisateur s'il n'est pas administrateur ou modérateur
  if (!user || !isModerator) {
    return (
      <div className="container py-10 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Accès non autorisé</CardTitle>
            <CardDescription>
              Vous n'avez pas les droits nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Retourner à l'accueil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">Gérez les confitures, les battles et les utilisateurs de la plateforme.</p>
      </div>
      
      <Tabs defaultValue="jams" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="jams">Confitures</TabsTrigger>
          <TabsTrigger value="battles">Battles</TabsTrigger>
          {isAdmin && <TabsTrigger value="users">Utilisateurs</TabsTrigger>}
        </TabsList>
        
        {/* Contenu de l'onglet Confitures */}
        <TabsContent value="jams" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Gestion des confitures</h2>
            <Button asChild>
              <Link to="/jam/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer une confiture
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Confitures en attente d'approbation</CardTitle>
              <CardDescription>
                Confitures qui nécessitent une validation avant publication
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPendingJams ? (
                <div className="text-center py-6">Chargement...</div>
              ) : pendingJams && pendingJams.length > 0 ? (
                <div className="space-y-2">
                  {pendingJams.map((jam: any) => (
                    <div key={jam.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{jam.name}</p>
                        <p className="text-sm text-muted-foreground">
                          par {jam.profiles?.username || 'Utilisateur inconnu'} • {new Date(jam.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/jam/${jam.id}`}>
                            Détails
                          </Link>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                          <Link to={`/jam/edit/${jam.id}`}>
                            Réviser
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Aucune confiture en attente d'approbation
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rechercher des confitures</CardTitle>
              <CardDescription>
                Recherchez des confitures à modifier ou supprimer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/explore">
                <Button variant="outline" className="w-full">Accéder à la page d'exploration</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenu de l'onglet Battles */}
        <TabsContent value="battles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Gestion des battles</h2>
            <Button asChild>
              <Link to="/battles/admin">
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer un battle
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Battles actifs</CardTitle>
              <CardDescription>
                Liste des battles en cours ou à venir
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBattles ? (
                <div className="text-center py-6">Chargement...</div>
              ) : activeBattles && activeBattles.length > 0 ? (
                <div className="space-y-2">
                  {activeBattles.map((battle: any) => (
                    <div key={battle.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{battle.theme}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                            {battle.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(battle.registration_start_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/battles/${battle.id}`}>
                            Détails
                          </Link>
                        </Button>
                        <Button variant="default" size="sm">
                          Gérer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Aucun battle actif
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenu de l'onglet Utilisateurs (admins uniquement) */}
        {isAdmin && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>
                  Cette fonctionnalité sera disponible prochainement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-muted-foreground">
                  La gestion des utilisateurs sera implémentée dans une prochaine mise à jour
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
