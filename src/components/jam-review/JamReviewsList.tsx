
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Star, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { DetailedReviewType } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface JamReviewsListProps {
  reviews: DetailedReviewType[];
  onEditReview?: (review: DetailedReviewType) => void;
}

// Critères d'évaluation pour l'affichage
const criteria = [
  { id: 'taste_rating', label: 'Goût' },
  { id: 'texture_rating', label: 'Texture' },
  { id: 'originality_rating', label: 'Originalité' },
  { id: 'balance_rating', label: 'Équilibre sucre/fruit' }
];

const JamReviewsList: React.FC<JamReviewsListProps> = ({ reviews, onEditReview }) => {
  const { user } = useAuth();
  
  // Calculer la note moyenne globale en excluant les zéros
  const calculateAverageRating = (review: DetailedReviewType) => {
    const ratings = [
      review.taste_rating || 0,
      review.texture_rating || 0,
      review.originality_rating || 0,
      review.balance_rating || 0
    ];
    // Filtre pour exclure les zéros
    const validRatings = ratings.filter(r => r > 0);
    return validRatings.length > 0
      ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
      : 0;
  };
  
  if (!reviews || reviews.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {reviews.map(review => {
        const avgRating = calculateAverageRating(review);
        const isUserReview = user && review.reviewer_id === user.id;
        // Fix: Handle reviewer properly to ensure type safety
        const reviewer = review.reviewer || {};
        const reviewerName = review.reviewer 
          ? (typeof review.reviewer === 'object' && 'full_name' in review.reviewer 
             ? review.reviewer.full_name || review.reviewer.username 
             : 'Utilisateur')
          : 'Utilisateur';
        
        return (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center">
                  {review.reviewer && (
                    <ProfileDisplay profile={review.reviewer} />
                  )}
                  <div className="ml-3">
                    <p className="font-medium">
                      {reviewerName}
                    </p>
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className="h-4 w-4"
                          fill={value <= Math.round(avgRating) ? "#FFA000" : "transparent"}
                          stroke={value <= Math.round(avgRating) ? "#FFA000" : "currentColor"}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {avgRating.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                  
                  {isUserReview && onEditReview && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => onEditReview(review)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {criteria.map(criterion => {
                  const ratingKey = criterion.id as keyof DetailedReviewType;
                  const ratingValue = review[ratingKey] as number || 0;
                  return (
                    <div key={criterion.id} className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">{criterion.label}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className="h-3 w-3"
                            fill={value <= ratingValue ? "#FFA000" : "transparent"}
                            stroke={value <= ratingValue ? "#FFA000" : "currentColor"}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {review.comment && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default JamReviewsList;
