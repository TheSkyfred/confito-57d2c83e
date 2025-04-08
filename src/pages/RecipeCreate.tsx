
import React from 'react';
import RecipeForm from '@/components/recipe/RecipeForm';

const RecipeCreate = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif font-bold mb-8">Créer une nouvelle recette</h1>
      <RecipeForm />
    </div>
  );
};

export default RecipeCreate;
