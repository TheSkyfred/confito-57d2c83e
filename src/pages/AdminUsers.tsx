
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
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
  UserCog 
} from 'lucide-react';

// Types d'utilisateur fictifs pour la démonstration
interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
}

const mockUsers: User[] = [
  { 
    id: '1', 
    email: 'admin@confito.fr', 
    username: 'Admin', 
    role: 'admin', 
    status: 'active',
    lastLogin: '2025-04-07 14:23' 
  },
  { 
    id: '2', 
    email: 'moderateur@confito.fr', 
    username: 'Modérateur', 
    role: 'moderator', 
    status: 'active',
    lastLogin: '2025-04-06 09:45' 
  },
  { 
    id: '3', 
    email: 'confiturier@confito.fr', 
    username: 'Confiturier Pro', 
    role: 'pro', 
    status: 'active',
    lastLogin: '2025-04-05 16:12' 
  },
  { 
    id: '4', 
    email: 'client1@exemple.com', 
    username: 'Client Fidèle', 
    role: 'user', 
    status: 'active',
    lastLogin: '2025-04-04 11:37' 
  },
  { 
    id: '5', 
    email: 'client2@exemple.com', 
    username: 'Amateur de Confitures', 
    role: 'user', 
    status: 'inactive',
    lastLogin: '2025-03-20 08:51' 
  },
  { 
    id: '6', 
    email: 'spam@exemple.com', 
    username: 'CompteSuspect', 
    role: 'user', 
    status: 'suspended',
    lastLogin: '2025-03-15 22:14' 
  },
];

const AdminUsers: React.FC = () => {
  const { isAdmin, isLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users] = useState<User[]>(mockUsers);
  
  // Rediriger si l'utilisateur n'est pas admin
  React.useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        variant: "destructive",
      });
    }
  }, [isAdmin, navigate, isLoading, toast]);
  
  if (isLoading) {
    return (
      <div className="container p-6">
        <div className="text-center py-8">Vérification des permissions...</div>
      </div>
    );
  }

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Déterminer l'icône et la couleur de badge pour le statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Actif</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-500"><UserIcon className="h-3 w-3 mr-1" /> Inactif</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Déterminer l'icône et la couleur de badge pour le rôle
  const getRoleBadge = (role: string) => {
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

  // Fonction de gestion fictive pour les actions sur les utilisateurs
  const handleUserAction = (action: string, userId: string) => {
    toast({
      title: `Action ${action}`,
      description: `Action ${action} sur l'utilisateur #${userId}. Cette fonctionnalité est simulée.`,
    });
  };
  
  return (
    <div className="container py-8">
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
            <TableCaption>Liste des utilisateurs ({filteredUsers.length} sur {users.length})</TableCaption>
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
                    <div>{user.username}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserAction('modifier', user.id)}
                      >
                        Modifier
                      </Button>
                      {user.status !== 'suspended' ? (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleUserAction('suspendre', user.id)}
                        >
                          Suspendre
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUserAction('réactiver', user.id)}
                          className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                        >
                          Réactiver
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
