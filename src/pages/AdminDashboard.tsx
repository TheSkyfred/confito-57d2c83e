import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  MessageSquare,
  FileText,
  ShieldAlert,
  Award,
  BarChart3,
  ChevronDown,
  Search,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Lock,
  PlusCircle,
  Settings,
  Flag,
  Activity,
  Check,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { getTypedSupabaseQuery } from '@/utils/supabaseHelpers';
import { JamType, ProfileType } from '@/types/supabase';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const [jamIdToReject, setJamIdToReject] = useState<string | null>(null);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  
  const navigate = useNavigate();

  // Check if user is admin
  const { data: userProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['adminProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await getTypedSupabaseQuery('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as ProfileType;
    },
    enabled: !!user,
  });
  
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'moderator';

  // Fetch stats with pending jams count
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      // For demo purposes, we fetch the counts separately
      const [usersResponse, jamsResponse, ordersResponse, pendingJamsResponse] = await Promise.all([
        getTypedSupabaseQuery('profiles').select('count'),
        getTypedSupabaseQuery('jams').select('count'),
        getTypedSupabaseQuery('orders').select('count'),
        getTypedSupabaseQuery('jams').select('count').eq('status', 'pending')
      ]);
      
      return {
        userCount: usersResponse.count || 0,
        jamCount: jamsResponse.count || 0,
        orderCount: ordersResponse.count || 0,
        pendingJamCount: pendingJamsResponse.count || 0
      };
    },
    enabled: !!isAdmin,
  });
  
  // Fetch users for the Users tab
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers', searchTerm, userRoleFilter],
    queryFn: async () => {
      let query = getTypedSupabaseQuery('profiles').select('*');
      
      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }
      
      if (userRoleFilter !== 'all') {
        query = query.eq('role', userRoleFilter as 'user' | 'moderator' | 'admin');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProfileType[];
    },
    enabled: !!isAdmin,
  });
  
  // Fetch pending jams
  const { data: pendingJams, isLoading: loadingPendingJams, refetch: refetchPendingJams } = useQuery({
    queryKey: ['pendingJams'],
    queryFn: async () => {
      const { data, error } = await getTypedSupabaseQuery('jams')
        .select(`
          *,
          profiles:creator_id (id, username, full_name, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as JamType[];
    },
    enabled: !!isAdmin,
  });
  
  // Fonction pour approuver une confiture
  const approveJam = async (jamId: string) => {
    try {
      const { error } = await supabase
        .from('jams')
        .update({ status: 'approved' })
        .eq('id', jamId);
        
      if (error) throw error;
      
      toast({
        title: "Confiture approuvée",
        description: "La confiture est maintenant visible pour tous les utilisateurs",
      });
      
      refetchPendingJams();
    } catch (error: any) {
      console.error('Error approving jam:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'approbation",
        variant: "destructive"
      });
    }
  };
  
  // Fonction pour ouvrir la boîte de dialogue de rejet
  const openRejectDialog = (jamId: string) => {
    setJamIdToReject(jamId);
    setIsRejectionDialogOpen(true);
  };
  
  // Fonction pour rejeter une confiture
  const rejectJam = async () => {
    if (!jamIdToReject) return;
    
    try {
      const rejectionReason = selectedRejectionReason === 'other' 
        ? "Cette confiture ne répond pas à nos critères de qualité." 
        : selectedRejectionReason;
        
      const { error } = await supabase
        .from('jams')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', jamIdToReject);
        
      if (error) throw error;
      
      toast({
        title: "Confiture rejetée",
        description: "La confiture a été rejetée et le créateur a été informé",
      });
      
      setIsRejectionDialogOpen(false);
      setSelectedRejectionReason('');
      setJamIdToReject(null);
      refetchPendingJams();
    } catch (error: any) {
      console.error('Error rejecting jam:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du rejet",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    try {
      const { error } = await getTypedSupabaseQuery('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été modifié avec succès.",
      });
      
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du rôle.",
        variant: "destructive"
      });
    }
  };

  if (!user || loadingProfile) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              Accès restreint
            </CardTitle>
            <CardDescription>
              Cette page est réservée aux administrateurs et modérateurs.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Lock className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground max-w-md">
              Vous n'avez pas les permissions nécessaires pour accéder à cette section. 
              Si vous pensez qu'il s'agit d'une erreur, veuillez contacter un administrateur.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <ShieldAlert className="h-8 w-8 text-jam-raspberry" />
        <h1 className="font-serif text-3xl font-bold">Administration</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-jam-raspberry/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-jam-raspberry" />
            </div>
            <div>
              {loadingStats ? (
                <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold">{stats?.userCount}</p>
              )}
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-jam-honey/10 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-jam-honey" />
            </div>
            <div>
              {loadingStats ? (
                <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold">{stats?.jamCount}</p>
              )}
              <p className="text-sm text-muted-foreground">Confitures</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-jam-leaf/10 p-3 rounded-full">
              <Activity className="h-6 w-6 text-jam-leaf" />
            </div>
            <div>
              {loadingStats ? (
                <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold">{stats?.orderCount}</p>
              )}
              <p className="text-sm text-muted-foreground">Échanges</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className={stats?.pendingJamCount ? "border-amber-300 bg-amber-50" : ""}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`${stats?.pendingJamCount ? "bg-amber-400/20" : "bg-muted"} p-3 rounded-full`}>
              <AlertTriangle className={`h-6 w-6 ${stats?.pendingJamCount ? "text-amber-600" : "text-muted-foreground"}`} />
            </div>
            <div>
              {loadingStats ? (
                <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold">{stats?.pendingJamCount}</p>
              )}
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="pending-jams">
        <TabsList className="grid w-full md:w-fit grid-cols-4 mb-6">
          <TabsTrigger value="pending-jams" className="relative">
            <AlertTriangle className="mr-2 h-4 w-4" />
            En attente
            {stats?.pendingJamCount ? (
              <Badge variant="destructive" className="ml-2 absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-5 min-w-[1.25rem] flex items-center justify-center">
                {stats.pendingJamCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Flag className="mr-2 h-4 w-4" />
            Signalements
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="mr-2 h-4 w-4" />
            Badges
          </TabsTrigger>
        </TabsList>
        
        {/* Pending Jams Tab */}
        <TabsContent value="pending-jams">
          <Card>
            <CardHeader>
              <CardTitle>Confitures en attente d'approbation</CardTitle>
              <CardDescription>
                Vérifiez et approuvez les confitures soumises par les utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPendingJams ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
                </div>
              ) : pendingJams?.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="font-medium text-lg">Aucune confiture en attente</p>
                  <p className="text-muted-foreground">Toutes les soumissions ont été traitées.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingJams?.map((jam) => (
                    <Card key={jam.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 rounded-md overflow-hidden bg-muted">
                              {jam.jam_images && jam.jam_images[0] ? (
                                <img 
                                  src={jam.jam_images[0].url} 
                                  alt={jam.name} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                                  No image
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{jam.name}</h3>
                              <div className="flex items-center mt-1">
                                <Avatar className="h-4 w-4 mr-1">
                                  <AvatarImage src={(jam.profiles as any)?.avatar_url || undefined} />
                                  <AvatarFallback>{((jam.profiles as any)?.username || '?')[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {(jam.profiles as any)?.username || 'Utilisateur inconnu'}
                                </span>
                                <Badge variant="outline" size="sm" className="ml-2 text-xs">
                                  {format(new Date(jam.created_at), 'dd/MM/yyyy')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/jam/${jam.id}`} target="_blank">
                                Voir
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => openRejectDialog(jam.id)}
                            >
                              <X className="mr-1 h-4 w-4" />
                              Rejeter
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveJam(jam.id)}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Approuver
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => refetchPendingJams()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Recherchez et gérez les comptes utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un utilisateur..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="user">Utilisateurs</SelectItem>
                    <SelectItem value="moderator">Modérateurs</SelectItem>
                    <SelectItem value="admin">Administrateurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
                </div>
              ) : users?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun utilisateur trouvé.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users?.map((user: ProfileType) => (
                    <Card key={user.id}>
                      <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{user.username?.[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || user.username}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-auto">
                          <Badge 
                            variant={
                              user.role === 'admin' 
                                ? 'default' 
                                : user.role === 'moderator'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className={
                              user.role === 'admin' 
                                ? 'bg-jam-raspberry' 
                                : user.role === 'moderator'
                                  ? 'bg-jam-honey'
                                  : ''
                            }
                          >
                            {user.role === 'admin' && 'Administrateur'}
                            {user.role === 'moderator' && 'Modérateur'}
                            {user.role === 'user' && 'Utilisateur'}
                          </Badge>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" />
                                Gérer
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Gestion de l'utilisateur</DialogTitle>
                                <DialogDescription>
                                  Modifier les paramètres de @{user.username}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4 space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium mb-2">Modifier le rôle</h3>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant={user.role === 'user' ? 'default' : 'outline'} 
                                      size="sm"
                                      onClick={() => updateUserRole(user.id, 'user')}
                                    >
                                      Utilisateur
                                    </Button>
                                    <Button 
                                      variant={user.role === 'moderator' ? 'default' : 'outline'} 
                                      size="sm"
                                      onClick={() => updateUserRole(user.id, 'moderator')}
                                    >
                                      Modérateur
                                    </Button>
                                    <Button 
                                      variant={user.role === 'admin' ? 'default' : 'outline'} 
                                      size="sm"
                                      onClick={() => updateUserRole(user.id, 'admin')}
                                    >
                                      Administrateur
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link to={`/profile/${user.id}`}>
                                      Voir le profil
                                    </Link>
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => {
                                      toast({
                                        title: "Fonctionnalité limitée",
                                        description: "La suspension de compte n'est pas disponible dans cette démo."
                                      });
                                    }}
                                  >
                                    Suspendre le compte
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Modération des signalements</CardTitle>
              <CardDescription>
                Gérer les contenus signalés par la communauté
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReports.map((report) => (
                  <Card key={report.id} className={report.status === 'resolved' ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Flag className={`h-4 w-4 ${
                            report.status === 'pending' ? 'text-red-500' : 'text-green-500'
                          }`} />
                          <span className="font-medium">
                            Signalement de {report.type === 'comment' ? 'commentaire' : 
                                            report.type === 'jam' ? 'confiture' : 'profil'}
                          </span>
                        </div>
                        <Badge variant={report.status === 'pending' ? 'outline' : 'secondary'}>
                          {report.status === 'pending' ? 'En attente' : 'Résolu'}
                        </Badge>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">
                          Signalé par:
                        </p>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={report.reporter.avatar_url || undefined} />
                            <AvatarFallback>{report.reporter.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">@{report.reporter.username}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-1">
                          Raison du signalement: <span className="text-foreground">{report.reason}</span>
                        </p>
                        <p className="text-sm mt-1">{report.content}</p>
                      </div>
                      
                      <div className="flex justify-end mt-4 gap-2">
                        <Button variant="outline" size="sm">
                          Voir le contenu
                        </Button>
                        {report.status === 'pending' && (
                          <>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Fonctionnalité limitée",
                                  description: "La modération n'est pas disponible dans cette démo."
                                });
                              }}
                            >
                              Ignorer
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Fonctionnalité limitée",
                                  description: "La suppression n'est pas disponible dans cette démo."
                                });
                              }}
                            >
                              Supprimer
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Badges Tab */}
        <TabsContent value="badges">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestion des badges</CardTitle>
                <CardDescription>
                  Créer et attribuer des badges aux utilisateurs
                </CardDescription>
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer un badge
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Some example badges */}
                {[
                  { name: "Chef étoilé", description: "Pour les confituriers d'exception", category: "achievement", image: "⭐" },
                  { name: "Aventurier des saveurs", description: "Utilise des ingrédients rares ou exotiques", category: "creativity", image: "🌶️" },
                  { name: "Confiturier du mois", description: "Meilleur vendeur du mois", category: "sales", image: "🏆" },
                  { name: "Éco-responsable", description: "Utilise des méthodes et ingrédients durables", category: "sustainability", image: "🌱" },
                  { name: "Super goûteur", description: "A reçu plus de 50 avis 5 étoiles", category: "reviews", image: "👅" },
                  { name: "Jam-bassadeur", description: "A invité plus de 10 nouveaux membres", category: "community", image: "🤝" },
                ].map((badge, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl">
                        {badge.image}
                      </div>
                      <div>
                        <h3 className="font-medium">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {badge.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-2 border-t">
                      <div className="flex justify-between items-center w-full">
                        <Button variant="ghost" size="sm">
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          Attribuer
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog de rejet */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la confiture</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet qui sera communiquée au créateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Select value={selectedRejectionReason} onValueChange={setSelectedRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une raison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingredients_inappropriés">Ingrédients inappropriés ou dangereux</SelectItem>
                  <SelectItem value="description_insuffisante">Description insuffisante</SelectItem>
                  <SelectItem value="images_inadéquates">Images inadéquates ou manquantes</SelectItem>
                  <SelectItem value="allergenes_non_indiqués">Allergènes non indiqués</SelectItem>
                  <SelectItem value="other">Autre raison</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="default" 
              className="bg-red-600 hover:bg-red-700"
              onClick={rejectJam}
              disabled={!selectedRejectionReason}
            >
              Rejeter la confiture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
