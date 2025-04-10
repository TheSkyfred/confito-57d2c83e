
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, BookOpen } from 'lucide-react';
import { RecipeType } from '@/types/recipes';

// Utility function for safe formatting
const safeToFixed = (value: number | undefined | null, digits: number = 1): string => {
  if (value === undefined || value === null) return '0.0';
  return value.toFixed(digits);
};

// Map difficulty to a human-readable format and color
const difficultyConfig = {
  'facile': { label: 'Facile', color: 'bg-green-100 text-green-800' },
  'moyen': { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
  'avancé': { label: 'Avancé', color: 'bg-red-100 text-red-800' },
};

interface RecipeCardProps {
  recipe: RecipeType;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const {
    id,
    title,
    image_url,
    average_rating,
    tags,
    prep_time_minutes,
    difficulty,
    badges,
    jam_id,
    jam,
  } = recipe;

  // Get up to 3 main ingredients or tags to display
  const mainIngredients = tags?.slice(0, 3) || [];
  
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image_url || '/placeholder.svg'} 
          alt={title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        {jam_id && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-jam-honey text-white">
              Issue de confiture
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg line-clamp-2">{title}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">
              {safeToFixed(average_rating)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3 gap-4">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{prep_time_minutes} min</span>
          </div>
          <Badge variant="outline" className={difficultyConfig[difficulty]?.color || 'bg-gray-100'}>
            {difficultyConfig[difficulty]?.label || difficulty}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {mainIngredients.map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.tag}
            </Badge>
          ))}
        </div>
        
        {badges && badges.length > 0 && (
          <div className="mt-3 flex gap-1">
            {badges.map(({ id, badge }) => (
              badge && (
                <span key={id} className="inline-flex items-center text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {badge.name}
                </span>
              )
            ))}
          </div>
        )}
        
        {jam_id && jam && (
          <div className="mt-3 text-xs text-muted-foreground">
            <Link to={`/jam/${jam_id}`} className="hover:underline">
              Issue de la confiture: {jam.name}
            </Link>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link 
          to={`/recipes/${id}`}
          className="text-sm text-primary hover:underline"
        >
          Voir la recette
        </Link>
      </CardFooter>
    </Card>
  );
}
