import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { toast } from '@/hooks/use-toast';
import { Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DetailedReviewType } from '@/types/supabase';

interface JamReviewFormProps {
  jamId: string;
  onReviewSubmitted: () => void;
  reviewToEdit?: DetailedReviewType;
  onCancelEdit?: () => void;
}

// Critères d'évaluation
const reviewCriteria = [
  {
    id: 'taste',
    label: 'Goût général',
    description: 'Évalue la qualité globale de la confiture au niveau du goût. Est-ce savoureux ? Bien équilibré ? Agréable ?',
  },
  {
    id: 'texture',
    label: 'Texture et consistance',
    description: 'Sensation en bouche : la confiture est-elle bien prise, trop liquide, trop épaisse, granuleuse ?',
  },
  {
    id: 'originality',
    label: 'Originalité de la recette',
    description: 'Est-ce une recette classique ou une association originale ? Utilise-t-elle des ingrédients peu courants ou audacieux ?',
  },
  {
    id: 'balance',
    label: 'Équilibre sucre / fruit',
    description: 'Le dosage est-il juste entre la douceur du sucre et la puissance du fruit ?',
  }
];

const JamReviewForm: React.FC<JamReviewFormProps> = ({ 
  jamId, 
  onReviewSubmitted, 
  reviewToEdit,
  onCancelEdit
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [tasteRating, setTasteRating] = useState(0);
  const [textureRating, setTextureRating] = useState(0);
  const [originalityRating, setOriginalityRating] = useState(0);
  const [balanceRating, setBalanceRating] = useState(0);
  
  const isEditing = !!reviewToEdit;
  
  // Charger les données de l'avis à modifier
  useEffect(() => {
    if (reviewToEdit) {
      setComment(reviewToEdit.comment || '');
      setTasteRating(reviewToEdit.taste_rating || 0);
      setTextureRating(reviewToEdit.texture_rating || 0);
      setOriginalityRating(reviewToEdit.originality_rating || 0);
      setBalanceRating(reviewToEdit.balance_rating || 0);
    }
  }, [reviewToEdit]);
  
  const handleRatingChange = (criteriaId: string, value: number) => {
    if (criteriaId === 'taste') {
      setTasteRating(value);
    } else if (criteriaId === 'texture') {
      setTextureRating(value);
    } else if (criteriaId === 'originality') {
      setOriginalityRating(value);
    } else if (criteriaId === 'balance') {
      setBalanceRating(value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Vous devez être connecté",
        description: "Veuillez vous connecter pour laisser un avis",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return;
    
    setSubmitting(true);

    try {
      // Check if user already reviewed this jam
      const { data: existingReviews } = await supabase
        .from('jam_reviews')
        .select('id')
        .eq('jam_id', jamId)
        .eq('reviewer_id', user.id);

      const reviewData = {
        jam_id: jamId,
        reviewer_id: user.id,
        taste_rating: tasteRating,
        texture_rating: textureRating,
        originality_rating: originalityRating,
        balance_rating: balanceRating,
        comment: comment.trim() || null,
      };

      let result;

      if (existingReviews && existingReviews.length > 0) {
        // Update existing review
        result = await supabase
          .from('jam_reviews')
          .update(reviewData)
          .eq('id', existingReviews[0].id);
      } else {
        // Create new review
        result = await supabase
          .from('jam_reviews')
          .insert([reviewData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Avis envoyé",
        description: "Merci pour votre avis !",
      });

      // Reset form
      setTasteRating(0);
      setTextureRating(0);
      setOriginalityRating(0);
      setBalanceRating(0);
      setComment('');

      // Trigger refresh of jam data
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const isSaveDisabled = isSubmitting || !isAuthenticated || Object.values({ tasteRating, textureRating, originalityRating, balanceRating }).some(r => r === 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Modifier votre avis' : 'Laisser un avis'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Modifiez votre évaluation de cette confiture'
            : 'Partagez votre expérience avec cette confiture en évaluant ces 4 critères'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviewCriteria.map((criteria) => (
          <div key={criteria.id} className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h4 className="font-medium">{criteria.label}</h4>
                <p className="text-sm text-muted-foreground">{criteria.description}</p>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`p-1`}
                    onClick={() => handleRatingChange(criteria.id, value)}
                  >
                    <Star
                      className="h-5 w-5 transition-colors"
                      fill={value <= { tasteRating, textureRating, originalityRating, balanceRating }[criteria.id as keyof typeof { tasteRating, textureRating, originalityRating, balanceRating }] ? "#FFA000" : "transparent"}
                      stroke={value <= { tasteRating, textureRating, originalityRating, balanceRating }[criteria.id as keyof typeof { tasteRating, textureRating, originalityRating, balanceRating }] ? "#FFA000" : "currentColor"}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Separator />
          </div>
        ))}
        
        <div className="pt-2">
          <label htmlFor="comment" className="block font-medium mb-2">
            Commentaire (facultatif)
          </label>
          <Textarea
            id="comment"
            placeholder="Partagez votre expérience en détail..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isEditing && onCancelEdit && (
          <Button 
            variant="outline" 
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
        )}
        
        <Button 
          onClick={handleSubmit}
          disabled={isSaveDisabled}
          className={`bg-jam-raspberry hover:bg-jam-raspberry/90 ${isEditing ? '' : 'w-full'}`}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Enregistrer les modifications' : 'Soumettre mon avis'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JamReviewForm;
