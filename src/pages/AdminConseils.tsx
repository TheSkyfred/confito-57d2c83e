
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

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
  AlertCircle
} from 'lucide-react';

const AdminConseils = () => {
  const { isAdmin, isModerator } = useUserRole();
  const { session } = useAuth();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: conseils, isLoading, error, refetch } = useQuery({
    queryKey: ['adminConseils', statusFilter],
    queryFn: async () => {
      let filter: Record<string, any> = {};
      if (statusFilter !== 'all') {
        filter = { visible: statusFilter === 'visible' };
      }
      
      const { data, error } = await supabaseDirect.select(
        'advice_articles',
        '*, author:profiles!advice_articles_author_id_fkey (username, avatar_url)',
        filter
      );
      
      if (error) throw error;
      return data || [];
    },
    enabled: session && (isAdmin || isModerator)
  });
  
  if (!isAdmin && !isModerator) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-serif font-bold mb-4">Administration des conseils</h1>
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif font-bold mb-4">Administration des conseils</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="hidden">Caché</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative flex-1">
          <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par titre ou auteur..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          Chargement des conseils...
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p>Erreur lors du chargement des conseils</p>
          <p className="text-sm">{(error as Error).message}</p>
        </div>
      ) : conseils && conseils.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conseils.map((conseil) => (
                <TableRow key={conseil.id}>
                  <TableCell className="font-medium">{conseil.title}</TableCell>
                  <TableCell>{conseil.author?.username || "Utilisateur anonyme"}</TableCell>
                  <TableCell>
                    {new Date(conseil.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {conseil.visible ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Visible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Caché
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/conseils/${conseil.id}`}>
                        <EyeIcon className="h-4 w-4" />
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
          <h3 className="text-xl font-medium mb-2">Aucun conseil trouvé</h3>
          <p className="text-muted-foreground">
            {statusFilter !== 'all' ? 
              `Aucun conseil avec le statut "${statusFilter}" trouvé.` : 
              'Aucun conseil trouvé.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminConseils;
