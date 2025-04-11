import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RecipeRatingProps {
  recipeId: string;
  onRatingSubmit?: () => void;
  existingRating?: number;
  existingComment?: string;
}

const RecipeRating: React.FC<RecipeRatingProps> = ({ 
  recipeId, 
  onRatingSubmit,
  existingRating,
  existingComment
}) => {
  const [rating, setRating] = useState<number>(existingRating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleRatingSubmit = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour noter cette recette",
        variant: "destructive",
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une note",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if the user has already rated this recipe
      const { data: existingRatings } = await supabase
        .from('recipe_ratings')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id);
        
      if (existingRatings && existingRatings.length > 0) {
        // Update the existing rating
        await supabase
          .from('recipe_ratings')
          .update({
            rating: rating,
          })
          .eq('id', existingRatings[0].id);
          
        toast({
          title: "Succès",
          description: "Votre note a été mise à jour",
        });
      } else {
        // Insert a new rating
        await supabase
          .from('recipe_ratings')
          .insert({
            recipe_id: recipeId,
            user_id: user.id,
            rating: rating
          });
          
        toast({
          title: "Succès",
          description: "Votre note a été enregistrée",
        });
      }
      
      // Handle comment if provided
      if (comment.trim()) {
        // Check if the user has already commented
        const { data: existingComments } = await supabase
          .from('recipe_comments')
          .select('id')
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id);
          
        if (existingComments && existingComments.length > 0) {
          // Update the existing comment
          await supabase
            .from('recipe_comments')
            .update({
              content: comment.trim()
            })
            .eq('id', existingComments[0].id);
        } else {
          // Insert a new comment
          await supabase
            .from('recipe_comments')
            .insert({
              recipe_id: recipeId,
              user_id: user.id,
              content: comment.trim()
            });
        }
      }
      
      if (onRatingSubmit) {
        onRatingSubmit();
      }
      
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de votre note",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-medium">Votre avis</h3>
      
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Note</label>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-6 w-6 cursor-pointer ${
                (hoveredRating || rating) >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
          <span className="ml-2 text-sm text-gray-700">
            {rating > 0 ? `${rating}/5` : 'Sélectionnez une note'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Commentaire (optionnel)</label>
        <Textarea 
          placeholder="Partagez votre expérience avec cette recette..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>
      
      <Button onClick={handleRatingSubmit} disabled={isSubmitting || !user}>
        {isSubmitting ? "Envoi en cours..." : "Envoyer mon avis"}
      </Button>
      
      {!user && (
        <p className="text-sm text-muted-foreground">
          Vous devez être connecté pour noter cette recette
        </p>
      )}
    </div>
  );
};

export default RecipeRating;
