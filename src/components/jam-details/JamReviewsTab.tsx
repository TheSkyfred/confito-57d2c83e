
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReviewType } from '@/types/supabase';
import { formatProfileData } from '@/utils/profileHelpers';

type JamReviewsTabProps = {
  reviews: ReviewType[];
  avgRating: number;
  isAuthenticated: boolean;
};

export const JamReviewsTab = ({ reviews, avgRating, isAuthenticated }: JamReviewsTabProps) => {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-serif font-medium mb-4">
        Avis et commentaires
        {reviews.length > 0 && (
          <span className="ml-2 text-muted-foreground">
            (Note moyenne : {avgRating.toFixed(1)}/5)
          </span>
        )}
      </h3>
      
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">Aucun avis pour l'instant</h3>
          <p className="text-muted-foreground mt-2">
            Soyez le premier à donner votre avis sur cette confiture.
          </p>
          {isAuthenticated && (
            <Button className="mt-4 bg-jam-raspberry hover:bg-jam-raspberry/90">
              Laisser un avis
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            // Safely access reviewer properties with optional chaining
            const reviewer = review.reviewer ? formatProfileData(review.reviewer) : null;
            const reviewerInitial = reviewer?.username?.[0]?.toUpperCase() || '?';
            
            return (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={reviewer?.avatar_url || ''} />
                      <AvatarFallback>{reviewerInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{reviewer?.username || 'Utilisateur'}</p>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4"
                            fill={i < review.rating ? "#FFA000" : "none"}
                            stroke={i < review.rating ? "#FFA000" : "currentColor"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), 'dd MMM yyyy', { locale: fr })}
                  </div>
                </div>
                {review.comment && (
                  <div className="mt-3">
                    <p>{review.comment}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
