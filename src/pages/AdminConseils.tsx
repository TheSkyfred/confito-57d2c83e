
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { AdviceArticle } from '@/types/advice';
import { ProfileType } from '@/types/supabase';

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
  Pencil,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion
} from 'lucide-react';

// Define a more specific interface for what Supabase actually returns
interface ConseilWithAuthor extends Omit<AdviceArticle, 'author'> {
  author?: ProfileType | null;
  profiles?: ProfileType | null;
}

const AdminConseils = () => {
  const { isAdmin, isModerator } = useUserRole();
  const { session } = useAuth();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: conseils, isLoading, error, refetch } = useQuery({
    queryKey: ['adminConseils', statusFilter, approvalFilter],
    queryFn: async () => {
      let query = supabase.from('advice_articles').select('*');
      
      if (statusFilter !== 'all') {
        query = query.eq('visible', statusFilter === 'visible');
      }
      
      if (approvalFilter !== 'all') {
        query = query.eq('status', approvalFilter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch author profiles separately
      if (data && data.length > 0) {
        const authorIds = data.map(item => item.author_id);
        const uniqueAuthorIds = [...new Set(authorIds)];
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', uniqueAuthorIds);
          
        const profileMap = (profiles || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, ProfileType>);
        
        // Merge profiles into conseils data
        return data.map((conseil: any) => ({
          ...conseil,
          profiles: profileMap[conseil.author_id] || null
        }));
      }
      
      // Handle the case where there's no data
      return (data || []) as ConseilWithAuthor[];
    },
    enabled: Boolean(session && (isAdmin || isModerator))
  });
  
  // Filter conseils based on search term
  const filteredConseils = conseils?.filter(conseil => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = conseil.title?.toLowerCase().includes(searchLower);
    
    // Use profiles property since we've added it to the data
    const authorMatch = conseil.profiles?.username?.toLowerCase().includes(searchLower);
    
    return titleMatch || authorMatch;
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
        
        <div className="w-full sm:w-48">
          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les niveaux d'approbation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
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
      ) : filteredConseils && filteredConseils.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Approbation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConseils.map((conseil) => (
                <TableRow key={conseil.id}>
                  <TableCell className="font-medium">{conseil.title}</TableCell>
                  <TableCell>{conseil.profiles?.username || "Utilisateur anonyme"}</TableCell>
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
                  <TableCell>
                    {conseil.status === 'approved' ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Approuvé
                      </Badge>
                    ) : conseil.status === 'rejected' ? (
                      <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
                        <ShieldOff className="h-3 w-3" />
                        Rejeté
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <ShieldQuestion className="h-3 w-3" />
                        En attente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/conseils/${conseil.id}`}>
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/admin/conseils/edit/${conseil.id}`}>
                        <Pencil className="h-4 w-4" />
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
            {statusFilter !== 'all' || approvalFilter !== 'all' ? 
              `Aucun conseil correspondant aux filtres sélectionnés.` : 
              'Aucun conseil trouvé.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminConseils;
