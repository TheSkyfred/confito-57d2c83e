
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProAccessory } from '@/types/supabase';
import { toast } from '@/components/ui/use-toast';
import { supabaseDirect } from '@/utils/supabaseAdapter';

// Hook pour gérer les accessoires sponsorisés
export const useProAccessories = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');

  // Récupérer tous les accessoires
  const { data: accessories, isLoading, error } = useQuery({
    queryKey: ['pro-accessories', filter],
    queryFn: async () => {
      let query = supabase
        .from('pro_accessories')
        .select('*, creator:created_by(id, username, full_name, avatar_url)');

      if (filter) {
        query = query.ilike('name', `%${filter}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as ProAccessory[];
    }
  });

  // Récupérer un accessoire par son ID
  const getAccessoryById = async (id: string) => {
    const { data, error } = await supabase
      .from('pro_accessories')
      .select('*, creator:created_by(id, username, full_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ProAccessory;
  };

  // Créer un nouvel accessoire
  const createAccessory = useMutation({
    mutationFn: async (newAccessory: Omit<ProAccessory, 'id' | 'created_at' | 'updated_at' | 'click_count'>) => {
      const { data, error } = await supabase
        .from('pro_accessories')
        .insert(newAccessory)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-accessories'] });
      toast({
        title: "Accessoire créé",
        description: "L'accessoire a été créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création de l'accessoire: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mettre à jour un accessoire
  const updateAccessory = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<ProAccessory> }) => {
      const { data, error } = await supabase
        .from('pro_accessories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-accessories'] });
      toast({
        title: "Accessoire mis à jour",
        description: "L'accessoire a été mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour de l'accessoire: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Supprimer un accessoire
  const deleteAccessory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pro_accessories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-accessories'] });
      toast({
        title: "Accessoire supprimé",
        description: "L'accessoire a été supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression de l'accessoire: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Upload d'une image
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('accessories')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('accessories')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Incrémenter le compteur de clics
  const incrementClickCount = useMutation({
    mutationFn: async (id: string) => {
      const response = await supabaseDirect.incrementProductClick(id);
      if (response.error) throw response.error;
    },
    onSuccess: () => {
      // Rafraîchir les données après incrémentation
      queryClient.invalidateQueries({ queryKey: ['pro-accessories'] });
    }
  });

  return {
    accessories,
    isLoading,
    error,
    filter,
    setFilter,
    getAccessoryById,
    createAccessory,
    updateAccessory,
    deleteAccessory,
    uploadImage,
    incrementClickCount,
  };
};
