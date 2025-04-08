
import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecipesHeaderProps {
  user: any;
}

const RecipesHeader: React.FC<RecipesHeaderProps> = ({ user }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-serif font-bold">Recettes de confitures</h1>
        <p className="text-muted-foreground">
          Découvrez des recettes délicieuses pour réaliser vos confitures maison
        </p>
      </div>
      
      {user && (
        <Button asChild>
          <Link to="/recipes/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer une recette
          </Link>
        </Button>
      )}
    </div>
  );
};

export default RecipesHeader;
