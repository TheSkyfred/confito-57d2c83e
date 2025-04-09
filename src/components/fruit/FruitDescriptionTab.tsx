
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface FruitDescriptionTabProps {
  name: string;
  description: string | undefined;
  family: string | undefined;
}

export const FruitDescriptionTab: React.FC<FruitDescriptionTabProps> = ({ 
  name,
  description, 
  family 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>À propos du {name.toLowerCase()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description ? (
          <div>
            <p>{description}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">Pas de description disponible pour ce fruit.</p>
        )}
        
        {family && (
          <div>
            <h3 className="font-medium mb-1">Famille</h3>
            <p className="text-muted-foreground">{family}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FruitDescriptionTab;
