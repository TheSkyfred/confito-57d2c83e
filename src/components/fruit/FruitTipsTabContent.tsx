
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Advice {
  id: string;
  title: string;
  cover_image_url?: string;
  type: string;
  is_suggested?: boolean;
}

interface FruitTipsTabContentProps {
  conservationTips: string | undefined;
  cookingTips: string | undefined;
  advices: Advice[] | undefined;
}

export const FruitTipsTabContent: React.FC<FruitTipsTabContentProps> = ({ 
  conservationTips, 
  cookingTips,
  advices
}) => {
  // Fonction pour capitaliser la première lettre
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const hasContent = conservationTips || cookingTips || (advices && advices.length > 0);
  
  if (!hasContent) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Pas de conseils disponibles pour ce fruit.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {conservationTips && (
        <Card>
          <CardHeader>
            <CardTitle>Conservation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{conservationTips}</p>
          </CardContent>
        </Card>
      )}

      {cookingTips && (
        <Card>
          <CardHeader>
            <CardTitle>Conseils de préparation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{cookingTips}</p>
          </CardContent>
        </Card>
      )}

      {advices && advices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Articles liés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advices.map((advice, index) => (
                <Link to={`/conseils/${advice.id}`} key={`advice-${advice.id}-${index}`}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{advice.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {advice.cover_image_url && (
                        <div className="h-28 rounded-md overflow-hidden">
                          <img 
                            src={advice.cover_image_url} 
                            alt={advice.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Badge className="mt-2">{capitalize(advice.type)}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FruitTipsTabContent;
