
import React from 'react';
import { useParams } from 'react-router-dom';
import RecipeForm from '@/components/recipe/RecipeForm';

const RecipeEdit = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif font-bold mb-8">Modifier la recette</h1>
      <RecipeForm recipeId={id} />
    </div>
  );
};

export default RecipeEdit;
