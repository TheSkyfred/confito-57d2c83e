
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface JamReviewFormProps {
  jamId: string;
  onReviewSubmitted: () => void;
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

const JamReviewForm: React.FC<JamReviewFormProps> = ({ jamId, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [ratings, setRatings] = useState({
    taste: 0,
    texture: 0,
    originality: 0,
    balance: 0
  });
  
  const handleRatingChange = (criteriaId: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour laisser un avis.",
        variant: "destructive"
      });
      return;
    }
    
    // Vérifier que tous les critères ont été notés
    const hasZeroRating = Object.values(ratings).some(rating => rating === 0);
    if (hasZeroRating) {
      toast({
        title: "Notation incomplète",
        description: "Veuillez noter tous les critères avant de soumettre votre avis.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.from('jam_reviews').insert({
        jam_id: jamId,
        reviewer_id: user.id,
        taste_rating: ratings.taste,
        texture_rating: ratings.texture,
        originality_rating: ratings.originality,
        balance_rating: ratings.balance,
        comment: comment.trim() || null
      });
      
      if (error) throw error;
      
      toast({
        title: "Avis ajouté",
        description: "Merci d'avoir partagé votre avis sur cette confiture !",
      });
      
      setComment('');
      setRatings({ taste: 0, texture: 0, originality: 0, balance: 0 });
      
      // Rafraîchir les avis
      onReviewSubmitted();
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter votre avis. Vous avez peut-être déjà noté cette confiture.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isSaveDisabled = isSubmitting || !user || Object.values(ratings).some(r => r === 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Laisser un avis</CardTitle>
        <CardDescription>
          Partagez votre expérience avec cette confiture en évaluant ces 4 critères
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
                      fill={value <= ratings[criteria.id as keyof typeof ratings] ? "#FFA000" : "transparent"}
                      stroke={value <= ratings[criteria.id as keyof typeof ratings] ? "#FFA000" : "currentColor"}
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
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isSaveDisabled}
          className="bg-jam-raspberry hover:bg-jam-raspberry/90"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Soumettre mon avis
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JamReviewForm;
