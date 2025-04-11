
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { AdviceArticle } from '@/types/advice';
import { Video, MessageSquare, Tag } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdviceCardProps {
  article: AdviceArticle;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ article }) => {
  // Default image if none provided
  const coverImage = article.cover_image_url || '/placeholder-advice.jpg';
  
  // Format the date
  const formattedDate = article.published_at 
    ? formatDistance(new Date(article.published_at), new Date(), { 
        addSuffix: true,
        locale: fr 
      })
    : '';

  return (
    <Link to={`/conseil/${article.id}`} className="block h-full">
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow flex flex-col">
        <div className="aspect-video relative w-full overflow-hidden">
          <img 
            src={coverImage} 
            alt={article.title} 
            className="object-cover w-full h-full"
          />
          {article.has_video && (
            <div className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-md flex items-center text-xs">
              <Video className="w-3 h-3 mr-1" />
              Vidéo
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-xs text-white">
              {article.type.charAt(0).toUpperCase() + article.type.slice(1)}
            </p>
          </div>
        </div>
        <CardContent className="flex-1 py-4">
          <CardTitle className="text-lg mb-2 line-clamp-2">{article.title}</CardTitle>
          {article.content && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between items-center">
          <div className="flex items-center">
            {formattedDate}
          </div>
          <div className="flex items-center space-x-3">
            {article.products && article.products.length > 0 && (
              <div className="flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                {article.products.length}
              </div>
            )}
            {article.comments_count && article.comments_count > 0 && (
              <div className="flex items-center">
                <MessageSquare className="w-3 h-3 mr-1" />
                {article.comments_count}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AdviceCard;
