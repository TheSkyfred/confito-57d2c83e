
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NewsCardProps {
  id: string;
  title: string;
  summary?: string;
  coverImageUrl?: string;
  publishedAt: string;
  isFeatured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  summary,
  coverImageUrl,
  publishedAt,
  isFeatured = false,
}) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Pas d'image</span>
          </div>
        )}
        
        {isFeatured && (
          <Badge className="absolute top-2 right-2 bg-jam-raspberry">
            À la une
          </Badge>
        )}
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{format(new Date(publishedAt), 'PPP', { locale: fr })}</span>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        
        {summary && (
          <p className="text-muted-foreground line-clamp-3 text-sm">{summary}</p>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to={`/news/${id}`}>
            Lire la suite
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
