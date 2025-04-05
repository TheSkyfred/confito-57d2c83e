
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type FavoriteHandlerProps = {
  jamId: string;
  userId: string | undefined;
  favorited: boolean;
  setFavorited: (value: boolean) => void;
};

export const useFavoriteHandler = ({ jamId, userId, favorited, setFavorited }: FavoriteHandlerProps) => {
  const toggleFavorite = async () => {
    if (!userId) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter aux favoris",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (favorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('jam_id', jamId)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('favorites')
          .insert([{ jam_id: jamId, user_id: userId }]);
      }
      
      setFavorited(!favorited);
      toast({
        title: favorited ? "Retiré des favoris" : "Ajouté aux favoris",
        description: favorited ? "Cette confiture a été retirée de vos favoris" : "Cette confiture a été ajoutée à vos favoris",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  return { toggleFavorite };
};
