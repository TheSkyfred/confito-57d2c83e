
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Edit, Trash } from "lucide-react";
import FruitForm from '@/components/fruit/FruitForm';
import FruitDetail from '@/components/fruit/FruitDetail';

const AdminFruitDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isModerator, isLoading: roleLoading } = useUserRole();
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch fruit data
  const { 
    data: fruit, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['fruitDetail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fruits')
        .select(`*`)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && (!roleLoading && (isAdmin || isModerator)),
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

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('fruits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Fruit supprimé",
        description: "Le fruit a été supprimé avec succès.",
      });
      
      navigate('/admin/fruits');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer ce fruit: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = () => {
    setIsEditing(false);
    refetch();
    toast({
      title: "Modifications enregistrées",
      description: "Les informations du fruit ont été mises à jour avec succès.",
    });
  };

  const handleFormCancel = () => {
    setIsEditing(false);
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

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !fruit) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>
              Impossible de charger les détails de ce fruit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin/fruits')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button 
        onClick={() => navigate('/admin/fruits')} 
        variant="outline" 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la liste
      </Button>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Modifier {fruit.name}</CardTitle>
            <CardDescription>Modifiez les informations de ce fruit saisonnier</CardDescription>
          </CardHeader>
          <CardContent>
            <FruitForm 
              fruit={fruit} 
              onSubmit={handleFormSubmit} 
              onCancel={handleFormCancel} 
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{fruit.name}</CardTitle>
              <CardDescription>
                {fruit.is_published ? 'Fruit publié' : 'Brouillon'} • {fruit.family || 'Famille non spécifiée'}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FruitDetail fruit={fruit} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminFruitDetails;
