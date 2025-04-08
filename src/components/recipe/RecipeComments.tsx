
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RecipeComment } from '@/types/recipes';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getProfileInitials } from '@/utils/supabaseHelpers';

interface RecipeCommentsProps {
  recipeId: string;
}

const RecipeComments: React.FC<RecipeCommentsProps> = ({ recipeId }) => {
  const { data: comments, isLoading, error } = useQuery({
    queryKey: ['recipeComments', recipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_comments')
        .select(`
          id,
          content,
          created_at,
          is_helpful,
          user_id,
          profiles:user_id (username, avatar_url, full_name)
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  if (isLoading) {
    return <div className="py-4 text-center">Chargement des commentaires...</div>;
  }
  
  if (error) {
    return <div className="py-4 text-center text-red-500">Erreur lors du chargement des commentaires</div>;
  }
  
  if (!comments?.length) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center">
        <p className="text-muted-foreground">Aucun commentaire pour cette recette</p>
        <p className="text-sm mt-1">Soyez le premier à donner votre avis!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {comments.map((comment: any) => {
        const profile = comment.profiles;
        const timeAgo = formatDistanceToNow(new Date(comment.created_at), { 
          addSuffix: true,
          locale: fr
        });
        
        return (
          <div key={comment.id} className="border rounded-lg p-4">
            <div className="flex items-start">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={profile?.avatar_url} alt={profile?.username || "Utilisateur"} />
                <AvatarFallback>{getProfileInitials(profile?.username)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-medium">
                    {profile?.full_name || profile?.username || "Utilisateur anonyme"}
                  </h4>
                  <span className="text-xs text-muted-foreground">{timeAgo}</span>
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecipeComments;
