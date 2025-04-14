
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { JamType, ProfileType } from '@/types/supabase';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  EyeIcon,
  FilterIcon,
  AlertCircle,
  Settings,
  ArrowLeft,
  PackageOpen
} from 'lucide-react';

// Updated interface to correctly handle the profiles property
interface JamWithProfile extends Omit<JamType, 'profiles'> {
  profiles?: {
    id: string;
    username: string;
  } | null;
  jam_stocks?: {
    quantity: number;
    is_available: boolean;
  } | null;
}

const AdminJams = () => {
  const { isAdmin, isModerator } = useUserRole();
  const { session } = useAuth();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: jams, isLoading, error, refetch } = useQuery({
    queryKey: ['adminJams', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('jams')
        .select(`
          *,
          profiles:creator_id(id, username),
          jam_stocks(quantity, is_available)
        `);
      
      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as JamWithProfile[];
    },
    enabled: Boolean(session && (isAdmin || isModerator))
  });
  
  // Filter jams based on search term
  const filteredJams = jams?.filter(jam => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = jam.name?.toLowerCase().includes(searchLower);
    const creatorMatch = jam.profiles?.username?.toLowerCase().includes(searchLower);
    
    return nameMatch || creatorMatch;
  });
  
  if (!isAdmin && !isModerator) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-serif font-bold mb-4">Administration des confitures</h1>
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approuvé</Badge>;
      case 'rejected': 
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeté</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Brouillon</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100">Inconnu</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-8">
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
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold">Administration des confitures</h1>
        <Button asChild className="bg-jam-raspberry hover:bg-jam-raspberry/90">
          <Link to="/jam/create">
            <PackageOpen className="h-4 w-4 mr-2" />
            Nouvelle confiture
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Publié</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative flex-1">
          <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par nom ou créateur..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          Chargement des confitures...
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p>Erreur lors du chargement des confitures</p>
          <p className="text-sm">{(error as Error).message}</p>
        </div>
      ) : filteredJams && filteredJams.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Créateur</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Pro</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJams.map((jam) => (
                <TableRow key={jam.id}>
                  <TableCell className="font-medium">{jam.name}</TableCell>
                  <TableCell>{jam.profiles?.username || "Utilisateur supprimé"}</TableCell>
                  <TableCell>
                    {jam.is_pro ? (
                      <span>{jam.price_euros} €</span>
                    ) : (
                      <span>{jam.price_credits} crédits</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(jam.status as string)}
                  </TableCell>
                  <TableCell>
                    {jam.jam_stocks && jam.jam_stocks.length > 0 ? (
                      <span className={jam.jam_stocks[0].is_available ? 'text-green-600' : 'text-red-600'}>
                        {jam.jam_stocks[0].quantity}
                      </span>
                    ) : (
                      <span className="text-amber-600">Non défini</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {jam.is_pro ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Pro
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/jam/${jam.id}`}>
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-slate-800">
                      <Link to={`/admin/jams/edit/${jam.id}`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucune confiture trouvée</h3>
          <p className="text-muted-foreground">
            {statusFilter !== 'all' ? 
              `Aucune confiture avec le statut "${statusFilter === 'active' ? 'publié' : 'brouillon'}" trouvée.` : 
              'Aucune confiture trouvée.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminJams;
