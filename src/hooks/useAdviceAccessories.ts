
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ProAccessory } from '@/types/supabase';

interface AdviceAccessoryLink {
  id: string;
  advice_id: string;
  accessory_id: string;
  created_at: string;
  created_by?: string;
  accessory?: ProAccessory;
}

export const useAdviceAccessories = (adviceId?: string) => {
  const queryClient = useQueryClient();
  
  // Récupérer les accessoires liés à un conseil
  const { data: linkedAccessories, isLoading, error } = useQuery({
    queryKey: ['advice-accessories', adviceId],
    queryFn: async () => {
      if (!adviceId) return [];
      
      const { data, error } = await supabase
        .from('advice_accessory_links')
        .select(`
          *,
          accessory:accessory_id(*)
        `)
        .eq('advice_id', adviceId);
      
      if (error) {
        console.error('Erreur lors du chargement des accessoires liés:', error);
        throw error;
      }
      
      return data as AdviceAccessoryLink[];
    },
    enabled: !!adviceId
  });
  
  // Lier un accessoire à un conseil
  const linkAccessory = useMutation({
    mutationFn: async ({ adviceId, accessoryId, userId }: { adviceId: string, accessoryId: string, userId?: string }) => {
      const { data, error } = await supabase
        .from('advice_accessory_links')
        .insert({
          advice_id: adviceId,
          accessory_id: accessoryId,
          created_by: userId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advice-accessories', adviceId] });
      toast({
        title: "Accessoire ajouté",
        description: "L'accessoire a été associé au conseil avec succès"
      });
    },
    onError: (error: any) => {
      // Vérifier si c'est une erreur de contrainte unique (duplication)
      if (error.code === '23505') {
        toast({
          title: "Accessoire déjà associé",
          description: "Cet accessoire est déjà associé à ce conseil",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: `Impossible d'associer l'accessoire: ${error.message}`,
          variant: "destructive"
        });
      }
    }
  });
  
  // Délier un accessoire d'un conseil
  const unlinkAccessory = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('advice_accessory_links')
        .delete()
        .eq('id', linkId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advice-accessories', adviceId] });
      toast({
        title: "Accessoire retiré",
        description: "L'accessoire a été retiré du conseil avec succès"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de retirer l'accessoire: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    linkedAccessories,
    isLoading,
    error,
    linkAccessory,
    unlinkAccessory
  };
};
