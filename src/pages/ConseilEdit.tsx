
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAdviceArticle } from '@/hooks/useAdvice';

const ConseilEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: advice, isLoading, error } = useAdviceArticle(id || '');

  // Page d'édition de conseil à implémenter
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-serif font-bold mb-6">Édition du conseil</h1>
      
      {isLoading ? (
        <p>Chargement du conseil...</p>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p>Erreur lors du chargement du conseil</p>
          <p className="text-sm">{(error as Error).message}</p>
        </div>
      ) : advice ? (
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <p className="mb-4 text-gray-500">Formulaire d'édition à implémenter</p>
          <pre className="bg-muted p-4 rounded-md overflow-auto">
            {JSON.stringify(advice, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
          <p>Conseil non trouvé</p>
        </div>
      )}
    </div>
  );
};

export default ConseilEdit;
