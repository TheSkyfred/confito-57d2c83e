
import React from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type JamFavoriteShareProps = {
  favorited: boolean;
  toggleFavorite: () => void;
};

export const JamFavoriteShare = ({ favorited, toggleFavorite }: JamFavoriteShareProps) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      })
      .catch(() => {
        // Fallback if share API fails or is cancelled
        copyToClipboard();
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: "Lien copié",
          description: "Le lien a été copié dans le presse-papier",
        });
      })
      .catch(() => {
        toast({
          title: "Erreur",
          description: "Impossible de copier le lien",
          variant: "destructive"
        });
      });
  };

  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="icon"
        onClick={toggleFavorite}
        className={favorited ? "text-jam-raspberry" : ""}
        aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <Heart className="h-5 w-5" fill={favorited ? "currentColor" : "none"} />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={handleShare}
        aria-label="Partager cette confiture"
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
};
