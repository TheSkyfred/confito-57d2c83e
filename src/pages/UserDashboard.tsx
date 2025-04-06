
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProfileType, OrderType } from '@/types/supabase';
import { formatProfileData } from '@/utils/profileHelpers';
import { CreditBadge } from '@/components/ui/credit-badge';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ShieldCheck, UserCog, User as UserIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const UserDashboard = () => {
  const { user, profile: authProfile, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<ProfileType | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // On utilise le profil du contexte d'authentification s'il existe
  useEffect(() => {
    if (authProfile) {
      setUserProfile(authProfile);
      setLoading(false);
    } else if (user) {
      fetchUserProfile();
    }
  }, [user, authProfile]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        setError(error.message);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
      } else {
        setUserProfile(formatProfileData(profile));
      }
    } catch (err: any) {
      console.error("Erreur inattendue:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const { data: ordersData, error } = await supabase
            .from('orders')
            .select('*')
            .eq('buyer_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error("Erreur lors de la récupération des commandes:", error);
            setError(error.message);
          } else {
            setOrders(ordersData || []);
          }
        } catch (err: any) {
          console.error("Erreur inattendue:", err);
          setError(err.message);
        }
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Vous n'êtes pas connecté</h2>
              <p className="mt-2 text-muted-foreground max-w-xs">
                Connectez-vous pour accéder à votre tableau de bord.
              </p>
              <Button className="mt-6" onClick={() => window.location.href = "/auth"}>
                Connexion / Inscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord utilisateur</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Card className="border-destructive">
          <CardHeader className="text-destructive">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erreur
            </CardTitle>
            <CardDescription>Un problème est survenu lors du chargement de votre tableau de bord</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()} variant="outline">
              Réessayer
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Composant pour afficher le rôle de l'utilisateur avec une icône
  const UserRoleBadge = ({ role }: { role: 'user' | 'moderator' | 'admin' }) => {
    let badgeClass = "";
    let icon = <UserIcon className="h-3 w-3 mr-1" />;
    let label = "Utilisateur";
    
    switch (role) {
      case 'admin':
        badgeClass = "bg-jam-raspberry text-white";
        icon = <ShieldCheck className="h-3 w-3 mr-1" />;
        label = "Administrateur";
        break;
      case 'moderator':
        badgeClass = "bg-jam-honey text-white";
        icon = <UserCog className="h-3 w-3 mr-1" />;
        label = "Modérateur";
        break;
      default:
        badgeClass = "bg-gray-200 text-gray-700";
        break;
    }
    
    return (
      <Badge className={`${badgeClass} flex items-center mb-2`}>
        {icon}
        {label}
      </Badge>
    );
  };

  // User profile section
  const UserProfileSection = () => {
    const profile = userProfile as ProfileType;
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="h-24 w-24">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.username || "User"} />
          ) : (
            <AvatarFallback className="text-2xl">{profile?.username?.[0] || "U"}</AvatarFallback>
          )}
        </Avatar>
        <h2 className="text-xl font-semibold">{profile?.username || "Utilisateur"}</h2>
        <UserRoleBadge role={profile?.role || 'user'} />
        <CreditBadge amount={profile?.credits || 0} />
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = `/user/${user?.id}`}
          >
            Voir mon profil
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/credits"}>
            Gérer mes crédits
          </Button>
        </div>
      </div>
    );
  };

  // Order history section
  const OrderHistorySection = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique de commandes</CardTitle>
          <CardDescription>Vos dernières commandes</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID de commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{order.total_credits} crédits</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucune commande passée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord utilisateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <UserProfileSection />
          </CardContent>
        </Card>

        <OrderHistorySection />
      </div>

      <Button onClick={signOut} className="mt-8 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Se déconnecter
      </Button>
    </div>
  );
};

export default UserDashboard;
