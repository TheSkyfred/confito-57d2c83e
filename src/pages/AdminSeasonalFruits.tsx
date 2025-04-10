
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash, Eye } from "lucide-react";

const AdminSeasonalFruits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isModerator, isLoading: roleLoading } = useUserRole();

  // Fetch fruits
  const { data: fruits, isLoading, refetch } = useQuery({
    queryKey: ['adminSeasonalFruits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasonal_fruits')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin && !isModerator) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        variant: "destructive",
      });
    }
  }, [isAdmin, isModerator, navigate, roleLoading, toast]);

  const handleEdit = (fruit: any) => {
    navigate(`/admin/seasonal-fruits/edit/${fruit.id}`);
  };

  const handleAddNew = () => {
    navigate('/admin/seasonal-fruits/create');
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      try {
        const { error } = await supabase
          .from('seasonal_fruits')
          .delete()
          .eq('id', id);

        if (error) {
          toast({
            title: "Erreur",
            description: "Impossible de supprimer ce fruit.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Fruit supprimé",
          description: "Le fruit a été supprimé avec succès.",
        });
        refetch();
      } catch (error) {
        console.error("Error deleting fruit:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression.",
          variant: "destructive",
        });
      }
    }
  };

  const countSeasonMonths = (fruit: any) => {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return months.filter(month => fruit[month]).length;
  };
  
  // Fix: Prevent rendering until role check is complete
  if (roleLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Fix: Return null early if not authorized
  if (!isAdmin && !isModerator) {
    return null;
  }

  return (
    <div className="container py-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-serif">Gestion des fruits saisonniers</CardTitle>
        <CardDescription>
          Administration du calendrier des fruits de saison
        </CardDescription>
      </CardHeader>

      <div className="flex justify-between items-center my-6">
        <h2 className="text-xl font-medium">Liste des fruits</h2>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un fruit
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : fruits && fruits.length > 0 ? (
            <Table>
              <TableCaption>Liste des fruits saisonniers</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Famille</TableHead>
                  <TableHead>Mois de saison</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fruits.map((fruit: any) => (
                  <TableRow key={fruit.id}>
                    <TableCell className="font-medium">{fruit.name}</TableCell>
                    <TableCell>{fruit.family || "-"}</TableCell>
                    <TableCell>{countSeasonMonths(fruit)} mois</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(fruit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => handleDelete(fruit.id, fruit.name)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <p>Aucun fruit trouvé. Commencez par en ajouter un.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSeasonalFruits;
