
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type NewsItemProps = {
  title: string;
  date: string;
  image?: string;
  content: string;
  type: 'article' | 'update' | 'event';
  url: string;
};

const NewsItem = ({ title, date, image, content, type, url }: NewsItemProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {image && (
          <div className="md:w-1/3">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-48 md:h-full object-cover" 
            />
          </div>
        )}
        <div className={image ? 'md:w-2/3' : 'w-full'}>
          <CardHeader>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(date), 'PPP', { locale: fr })}</span>
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 text-muted-foreground">
              {content}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link to={url}>
                En savoir plus
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default NewsItem;
