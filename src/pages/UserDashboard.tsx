import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FavoritesSection from '@/components/FavoritesSection';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    // TODO: Implement logout functionality
    toast({
      title: "Déconnexion réussie.",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Tableau de bord</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenue, {profile?.username}!</CardTitle>
              <CardDescription>
                Consultez rapidement vos informations et activités récentes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <h2 className="lg:text-xl font-medium">Informations du profil</h2>
                <p className="text-sm text-muted-foreground">
                  Nom d'utilisateur: {profile?.username}
                </p>
                <p className="text-sm text-muted-foreground">
                  Adresse e-mail: {user?.email}
                </p>
              </div>
              <Button onClick={handleLogout}>Se déconnecter</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorites">
          <FavoritesSection />
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Vos commandes</CardTitle>
              <CardDescription>Suivez vos commandes et consultez l'historique.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Aucune commande pour le moment.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du compte</CardTitle>
              <CardDescription>Gérez vos informations personnelles et préférences.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Fonctionnalité à venir.
              </p>
              <Button asChild>
                <Link to="/settings">
                  Modifier les paramètres
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
