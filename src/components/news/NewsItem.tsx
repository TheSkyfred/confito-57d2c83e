
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronRight, FileText, Award, Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NewsItemProps {
  title: string;
  date: string;
  image?: string | null;
  content: string;
  type: 'article' | 'event' | 'announcement';
  url: string;
}

const NewsItem: React.FC<NewsItemProps> = ({ title, date, image, content, type, url }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'event':
        return <CalendarDays className="h-5 w-5" />;
      case 'announcement':
        return <Star className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeName = () => {
    switch (type) {
      case 'article':
        return 'Article';
      case 'event':
        return 'Événement';
      case 'announcement':
        return 'Annonce';
      default:
        return 'Article';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {image && (
          <div className="md:col-span-1">
            <div className="aspect-[16/9] overflow-hidden h-full">
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        <div className={`${image ? 'md:col-span-2' : 'md:col-span-3'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription className="flex items-center gap-1">
                {getIcon()}
                <span>{getTypeName()}</span>
              </CardDescription>
              <CardDescription className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDate(date)}</span>
              </CardDescription>
            </div>
            <CardTitle className="line-clamp-2">{title}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <p className="text-muted-foreground line-clamp-2">
              {content}
            </p>
          </CardContent>
          
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="ml-auto" asChild>
              <Link to={url}>
                Lire la suite
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default NewsItem;
