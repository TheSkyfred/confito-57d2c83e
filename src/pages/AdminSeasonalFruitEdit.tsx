
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import SeasonalFruitForm from '@/components/fruit/SeasonalFruitForm';

const AdminSeasonalFruitEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isModerator, isLoading: roleLoading } = useUserRole();
  
  // Fetch fruit data
  const { 
    data: fruit, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['seasonalFruitEdit', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasonal_fruits')
        .select('*')
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

  const handleFormSubmit = () => {
    toast({
      title: id ? "Fruit mis à jour" : "Fruit créé",
      description: id ? "Le fruit a été mis à jour avec succès." : "Le nouveau fruit a été créé avec succès.",
    });
    
    // Rafraîchir les données après la soumission si on est en mode édition
    if (id) {
      refetch();
    }
    
    navigate(`/admin/seasonal-fruits`);
  };

  const handleFormCancel = () => {
    navigate(`/admin/seasonal-fruits`);
  };

  if (roleLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

  if (error || (!fruit && id)) {
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
            <Button onClick={() => navigate('/admin/seasonal-fruits')} variant="outline">
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
        onClick={() => navigate(`/admin/seasonal-fruits`)} 
        variant="outline" 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la liste
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{fruit ? `Modifier ${fruit.name}` : "Ajouter un nouveau fruit"}</CardTitle>
          <CardDescription>
            {fruit 
              ? "Modifiez les informations de ce fruit saisonnier" 
              : "Ajoutez un nouveau fruit au calendrier saisonnier"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeasonalFruitForm 
            fruit={fruit} 
            onSubmit={handleFormSubmit} 
            onCancel={handleFormCancel} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSeasonalFruitEdit;
