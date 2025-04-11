
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Video, MessageSquare, Tag, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AdviceArticle } from '@/types/advice';

interface AdviceCardProps {
  article: AdviceArticle;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ article }) => {
  const typeLabels: Record<string, string> = {
    'fruits': 'Fruits',
    'cuisson': 'Cuisson',
    'recette': 'Recette',
    'conditionnement': 'Conditionnement',
    'sterilisation': 'Stérilisation',
    'materiel': 'Matériel'
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (error) {
      return '';
    }
  };

  return (
    <Link to={`/conseils/${article.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {article.cover_image_url ? (
            <img 
              src={article.cover_image_url} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-300">
              <Tag className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="bg-white text-gray-800">
              {typeLabels[article.type]}
            </Badge>
          </div>
          {article.has_video && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-red-500 text-white">
                <Video className="w-3 h-3 mr-1" />
                Vidéo
              </Badge>
            </div>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
          <CardDescription className="flex items-center text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(article.published_at || article.created_at)}
          </CardDescription>
        </CardHeader>
        <CardFooter className="p-4 pt-2 flex justify-between">
          <div className="flex items-center">
            {article.author?.avatar_url ? (
              <img 
                src={article.author.avatar_url} 
                alt={article.author.full_name || 'Auteur'} 
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 mr-2" />
            )}
            <span className="text-xs text-muted-foreground">
              {article.author?.full_name || 'Auteur inconnu'}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <MessageSquare className="w-3 h-3 mr-1" />
            {article.comments_count || 0}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AdviceCard;
