import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { RecipeType, RecipeDifficulty, RecipeStatus, RecipeStyle, RecipeSeason } from '@/types/supabase';
import { ProfileDisplay } from '@/components/ProfileDisplay';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, Filter, Star } from 'lucide-react';

import {
  FileText,
  Eye,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Send,
  RotateCcw,
  FileEdit,
  FileX
} from 'lucide-react';

const AdminRecipes = () => {
  const { isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recipesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [recipeToReject, setRecipeToReject] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['admin-recipes', currentPage, searchTerm, selectedStatus],
    queryFn: async () => {
      const { data, error } = await supabase.select<any>(
        'recipes', 
        `*, 
        author:author_id(id, username, full_name)
        `
      );
      
      if (error) throw error;
      
      let filteredData = [...data];
      
      if (selectedStatus !== 'all') {
        filteredData = filteredData.filter(recipe => recipe.status === selectedStatus);
      }
      
      if (searchTerm) {
        filteredData = filteredData.filter(recipe => 
          recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.author?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setTotalPages(Math.ceil(filteredData.length / recipesPerPage));
      
      return filteredData.slice((currentPage - 1) * recipesPerPage, currentPage * recipesPerPage);
    },
    enabled: isAdmin
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (recipeId: string, newStatus: string) => {
    try {
      await supabase.update('recipes', { status: newStatus }, { id: recipeId });
    } catch (error) {
      console.error('Error updating recipe status:', error);
    }
  };

  const handleDeleteRecipe = async () => {
    if (recipeToDelete) {
      try {
        await supabase.delete('recipes', { id: recipeToDelete });
        setRecipeToDelete(null);
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const handleRejectRecipe = async (rejectionReason: string) => {
    if (recipeToReject) {
      try {
        await supabase.update(
          'recipes',
          { status: 'rejected', rejection_reason: rejectionReason },
          { id: recipeToReject.id }
        );
        setRecipeToReject(null);
      } catch (error) {
        console.error('Error rejecting recipe:', error);
      }
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des recettes</h1>
      
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par titre ou auteur..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded px-4 py-2"
            >
              <option value="all">Tous les status</option>
              <option value="brouillon">Brouillon</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
        </div>
        
        <Button asChild>
          <Link to="/recipe/new">Ajouter une recette</Link>
        </Button>
      </div>
      
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="space-y-4">
            {recipes.map((recipe: any) => (
              <Card key={recipe.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/4 md:w-1/6 h-32 sm:h-auto">
                    <div className="h-full bg-muted relative">
                      {recipe.image_url ? (
                        <img 
                          src={recipe.image_url} 
                          alt={recipe.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FileText className="h-12 w-12 text-muted-foreground/40" />
                        </div>
                      )}
                      {recipe.status === 'brouillon' && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary">Brouillon</Badge>
                        </div>
                      )}
                      {recipe.status === 'pending' && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">En attente</Badge>
                        </div>
                      )}
                      {recipe.status === 'rejected' && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive">Rejeté</Badge>
                        </div>
                      )}
                      {recipe.status === 'approved' && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="default" className="bg-green-600">Approuvé</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 w-full sm:w-3/4 md:w-5/6">
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div>
                        <Link to={`/recipe/${recipe.id}`} className="text-lg font-medium hover:text-jam-raspberry">
                          {recipe.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Par {recipe.author?.username || 'Utilisateur inconnu'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(recipe.created_at), 'PPP', { locale: fr })}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
                        {recipe.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => handleStatusChange(recipe.id, 'approved')}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approuver
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => setRecipeToReject(recipe)}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Rejeter
                            </Button>
                          </>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                              <Link to={`/recipe/${recipe.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setRecipeToDelete(recipe.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            {recipe.status === 'brouillon' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(recipe.id, 'pending')}>
                                <Send className="mr-2 h-4 w-4" />
                                Soumettre
                              </DropdownMenuItem>
                            )}
                            
                            {recipe.status === 'rejected' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(recipe.id, 'pending')}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Re-soumettre
                              </DropdownMenuItem>
                            )}
                            
                            {recipe.status === 'approved' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(recipe.id, 'pending')}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Mettre en révision
                              </DropdownMenuItem>
                            )}
                            
                            {recipe.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(recipe.id, 'brouillon')}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Mettre en brouillon
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {recipe.status === 'approved' && (
                        <Badge variant="default" className="bg-green-600">Approuvé</Badge>
                      )}
                      {recipe.status === 'pending' && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">En attente</Badge>
                      )}
                      {recipe.status === 'rejected' && (
                        <Badge variant="destructive">Rejeté</Badge>
                      )}
                      {recipe.status === 'brouillon' && (
                        <Badge variant="secondary">Brouillon</Badge>
                      )}
                      
                      <Badge variant="outline" className="capitalize">{recipe.difficulty}</Badge>
                      <Badge variant="outline" className="capitalize">{recipe.season}</Badge>
                      <Badge variant="outline" className="capitalize">{recipe.style}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucune recette trouvée</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Il n'y a pas encore de recettes."}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
        >
          Précédent
        </Button>
        
        <span>Page {currentPage} sur {totalPages}</span>
        
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Suivant
        </Button>
      </div>

      <Dialog open={recipeToDelete !== null} onOpenChange={() => setRecipeToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer la recette</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette recette ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setRecipeToDelete(null)}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteRecipe}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={recipeToReject !== null} onOpenChange={() => setRecipeToReject(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rejeter la recette</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet de cette recette.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Expliquez pourquoi cette recette est refusée..."
            rows={4}
            className="mt-2"
          />
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setRecipeToReject(null)}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={() => handleRejectRecipe(recipeToReject?.rejectionReason || '')}>
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRecipes;
