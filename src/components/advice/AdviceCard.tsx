
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, Video } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AdviceArticle } from '@/types/advice';

interface AdviceCardProps {
  advice: AdviceArticle;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ advice }) => {
  const typeLabels: Record<string, string> = {
    'fruits': 'Fruits',
    'cuisson': 'Cuisson',
    'recette': 'Recette',
    'conditionnement': 'Conditionnement',
    'sterilisation': 'Stérilisation',
    'materiel': 'Matériel'
  };

  const formattedDate = format(new Date(advice.published_at), 'dd MMMM yyyy', { locale: fr });
  const truncatedContent = advice.content && advice.content.length > 120
    ? `${advice.content.substring(0, 120)}...`
    : advice.content;

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <Link to={`/conseils/${advice.id}`} className="flex-1 flex flex-col">
        <div className="relative h-48 overflow-hidden">
          {advice.cover_image_url ? (
            <img 
              src={advice.cover_image_url} 
              alt={advice.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              Pas d'image
            </div>
          )}
          {advice.has_video && (
            <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-1">
              <Video className="h-3 w-3" />
              Vidéo
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge>{typeLabels[advice.type] || advice.type}</Badge>
          </div>
          <CardTitle className="line-clamp-2 text-xl">{advice.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {truncatedContent || "Cliquez pour découvrir ce conseil"}
          </p>
        </CardContent>
      </Link>
      
      <CardFooter className="pt-2 flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="mr-1 h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center">
          <MessageSquare className="mr-1 h-3 w-3" />
          <span>{advice.comments_count || 0} commentaires</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdviceCard;
