
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, ArrowRight } from "lucide-react";

interface FruitRecipesShortcutProps {
  fruitName: string;
  hasRecipes: boolean;
}

export const FruitRecipesShortcut: React.FC<FruitRecipesShortcutProps> = ({ 
  fruitName, 
  hasRecipes 
}) => {
  if (!hasRecipes) return null;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Book className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>Recettes avec ce fruit</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <Button variant="ghost" className="w-full justify-between" asChild>
          <Link to={`/recipes?fruit=${fruitName}`}>
            Voir toutes les recettes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default FruitRecipesShortcut;
