import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProfileType, OrderType } from '@/types/supabase';
import { formatProfileData } from '@/utils/profileHelpers';
import { CreditBadge } from '@/components/ui/credit-badge';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<ProfileType | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            setError(error.message);
          } else {
            // Format the profile data with our helper
            setUserProfile(formatProfileData(profile));
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          setLoading(true);
          const { data: ordersData, error } = await supabase
            .from('orders')
            .select('*')
            .eq('buyer_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            setError(error.message);
          } else {
            setOrders(ordersData || []);
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

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
          <ScrollArea>
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
                    <TableCell colSpan={4} className="text-center">
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
          <CardContent>
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
