
import React from 'react';
import { Award } from 'lucide-react';

const RankingsHeader = () => {
  return (
    <div className="flex flex-col mb-8">
      <div className="flex items-center gap-2">
        <Award className="h-8 w-8 text-jam-honey" />
        <h1 className="font-serif text-3xl font-bold">
          Classements
        </h1>
      </div>
      <p className="text-muted-foreground mt-2">
        Découvrez les meilleures confitures et les confituriers les plus populaires
      </p>
    </div>
  );
};

export default RankingsHeader;
