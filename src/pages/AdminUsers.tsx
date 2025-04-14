import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useUsers, UserWithProfileType } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Shield, 
  User as UserIcon, 
  UserCog,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminUsers: React.FC = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get users from Supabase
  const { data: users, isLoading: usersLoading, refetch } = useUsers();
  
  // Redirect if the user isn't admin
  React.useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        variant: "destructive",
      });
    }
  }, [isAdmin, navigate, roleLoading, toast]);
  
  const isLoading = roleLoading || usersLoading;
  
  if (isLoading) {
    return (
      <div className="container p-6">
        <div className="text-center py-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <div>Chargement des utilisateurs...</div>
        </div>
      </div>
    );
  }

  // Filter users by search term
  const filteredUsers = users?.filter(user => 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Get badge for user status
  const getStatusBadge = (isActive: boolean | null | undefined) => {
    if (isActive === undefined || isActive === null) return <Badge variant="outline">Inconnu</Badge>;
    return isActive ? 
      <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Actif</Badge> :
      <Badge variant="outline" className="text-gray-500"><UserIcon className="h-3 w-3 mr-1" /> Inactif</Badge>;
  };

  // Get badge for user role
  const getRoleBadge = (role: string | null | undefined) => {
    if (!role) return <Badge variant="outline"><UserIcon className="h-3 w-3 mr-1" /> Utilisateur</Badge>;
    
    switch (role) {
      case 'admin':
        return <Badge className="bg-jam-raspberry"><Shield className="h-3 w-3 mr-1" /> Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-600"><UserCog className="h-3 w-3 mr-1" /> Modérateur</Badge>;
      case 'pro':
        return <Badge className="bg-amber-600"><UserIcon className="h-3 w-3 mr-1" /> Pro</Badge>;
      default:
        return <Badge variant="outline"><UserIcon className="h-3 w-3 mr-1" /> Utilisateur</Badge>;
    }
  };

  // Handle user actions
  const handleUserAction = async (action: string, userId: string, isActive?: boolean) => {
    try {
      if (action === 'modifier') {
        // Navigate to user edit page (to be implemented)
        navigate(`/profile/${userId}`);
        return;
      }

      if (action === 'suspendre' || action === 'réactiver') {
        // Toggle active status
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: !isActive })
          .eq('id', userId);
        
        if (error) throw error;
        
        toast({
          title: action === 'suspendre' ? "Utilisateur suspendu" : "Utilisateur réactivé",
          description: `L'utilisateur a été ${action === 'suspendre' ? 'suspendu' : 'réactivé'} avec succès.`,
        });
        
        // Refresh user list
        refetch();
      }
    } catch (error: any) {
      console.error(`Error with user action:`, error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'action.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container py-8">
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

      <h1 className="text-3xl font-serif font-bold mb-2">Gestion des utilisateurs</h1>
      <p className="text-muted-foreground mb-6">
        Administration des comptes utilisateurs de la plateforme
      </p>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filtrer les utilisateurs</CardTitle>
          <CardDescription>
            Recherchez par nom, email ou rôle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des utilisateurs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableCaption>Liste des utilisateurs ({filteredUsers.length} sur {users?.length || 0})</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div>{user.username || 'Sans nom'}</div>
                    <div className="text-xs text-muted-foreground">{user.id}</div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                  <TableCell>{user.lastLogin || 'Inconnu'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserAction('modifier', user.id)}
                      >
                        Modifier
                      </Button>
                      {user.is_active ? (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleUserAction('suspendre', user.id, true)}
                        >
                          Suspendre
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUserAction('réactiver', user.id, false)}
                          className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                        >
                          Réactiver
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
