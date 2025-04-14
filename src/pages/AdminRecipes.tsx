import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  CheckIcon,
  XIcon,
  EyeIcon,
  FilterIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const AdminRecipes = () => {
  const { isAdmin, isModerator } = useUserRole();
  const { session } = useAuth();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  
  const { data: recipes, isLoading, error, refetch } = useQuery({
    queryKey: ['adminRecipes', statusFilter],
    queryFn: async () => {
      let query = supabase.from('recipes') as any;
      
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data: recipesData, error: recipesError } = await query.select();
      
      if (recipesError) throw recipesError;
      
      const enhancedRecipes = await Promise.all((recipesData || []).map(async (recipe) => {
        if (!recipe.author_id) {
          return { ...recipe, author: null };
        }
        
        const { data: authorData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', recipe.author_id)
          .single();
        
        return { ...recipe, author: authorData || null };
      }));
      
      return enhancedRecipes || [];
    },
    enabled: Boolean(session && (isAdmin || isModerator))
  });
  
  const handleApprove = async (recipeId: string) => {
    if (!session) return;
    
    try {
      await supabase
        .from('recipes')
        .update({ 
          status: 'approved',
          rejection_reason: null
        })
        .eq('id', recipeId);
        
      toast({
        title: "Succès",
        description: "La recette a été approuvée",
      });
      
      refetch();
    } catch (error) {
      console.error('Error approving recipe:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };
  
  const handleReject = async (recipeId: string) => {
    if (!session) return;
    
    const reason = rejectionReason[recipeId];
    if (!reason || reason.trim() === '') {
      toast({
        title: "Erreur",
        description: "Veuillez fournir une raison pour le rejet",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await supabase
        .from('recipes')
        .update({ 
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', recipeId);
        
      toast({
        title: "Succès",
        description: "La recette a été rejetée",
      });
      
      setRejectionReason(prev => {
        const newState = { ...prev };
        delete newState[recipeId];
        return newState;
      });
      
      refetch();
    } catch (error) {
      console.error('Error rejecting recipe:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };
  
  const filteredRecipes = searchTerm && recipes ? 
    recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.author?.username && recipe.author.username.toLowerCase().includes(searchTerm.toLowerCase()))
    ) :
    recipes;
  
  if (!isAdmin && !isModerator) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-serif font-bold mb-4">Administration des recettes</h1>
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }
  
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
    
      <h1 className="text-3xl font-serif font-bold mb-4">Administration des recettes</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvée</SelectItem>
              <SelectItem value="rejected">Rejetée</SelectItem>
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
          Chargement des recettes...
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p>Erreur lors du chargement des recettes</p>
          <p className="text-sm">{(error as Error).message}</p>
        </div>
      ) : filteredRecipes && filteredRecipes.length > 0 ? (
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
              {filteredRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.title}</TableCell>
                  <TableCell>{recipe.author?.username || "Utilisateur anonyme"}</TableCell>
                  <TableCell>
                    {new Date(recipe.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {recipe.status === 'pending' && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        En attente
                      </Badge>
                    )}
                    {recipe.status === 'approved' && (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Approuvée
                      </Badge>
                    )}
                    {recipe.status === 'rejected' && (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Rejetée
                      </Badge>
                    )}
                    {recipe.status === 'brouillon' && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Brouillon
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/recipes/${recipe.id}`}>
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    {recipe.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleApprove(recipe.id)}
                          className="text-green-600 hover:text-green-800 hover:bg-green-50"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        
                        <div className="group relative inline-block">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                            <div className="p-2">
                              <Input 
                                placeholder="Raison du rejet" 
                                value={rejectionReason[recipe.id] || ''}
                                onChange={(e) => setRejectionReason(prev => ({
                                  ...prev,
                                  [recipe.id]: e.target.value
                                }))}
                                className="mb-2"
                              />
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleReject(recipe.id)}
                              >
                                Rejeter
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucune recette trouvée</h3>
          <p className="text-muted-foreground">
            {statusFilter ? 
              `Aucune recette avec le statut "${statusFilter}" trouvée.` : 
              'Aucune recette trouvée.'}
          </p>
        </div>
      )}
      
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-medium mb-4">Statistiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Approuvées</p>
                <p className="text-2xl font-bold">
                  {recipes?.filter(r => r.status === 'approved').length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">
                  {recipes?.filter(r => r.status === 'pending').length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Rejetées</p>
                <p className="text-2xl font-bold">
                  {recipes?.filter(r => r.status === 'rejected').length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 mr-3">
                B
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brouillons</p>
                <p className="text-2xl font-bold">
                  {recipes?.filter(r => r.status === 'brouillon').length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRecipes;
