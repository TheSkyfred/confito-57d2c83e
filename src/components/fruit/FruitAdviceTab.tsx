
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Advice {
  id: string;
  title: string;
  cover_image_url?: string;
  type: string;
  is_suggested?: boolean;
}

interface FruitAdviceTabProps {
  advices: Advice[] | undefined;
  loadingAdvices: boolean;
}

export const FruitAdviceTab: React.FC<FruitAdviceTabProps> = ({ 
  advices, 
  loadingAdvices 
}) => {
  if (loadingAdvices) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={`skeleton-advice-${i}`}>
            <CardHeader className="p-4">
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!advices || advices.length === 0) {
    return <p className="text-muted-foreground">Aucun conseil lié à ce fruit pour le moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {advices.map((advice, index) => (
        <Card key={`advice-${advice.id}-${index}`}>
          <CardHeader className="p-4">
            <CardTitle className="text-base">{advice.title}</CardTitle>
            <CardDescription>
              {advice.is_suggested ? "Suggestion" : "Associé"}
            </CardDescription>
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
            <Badge className="mt-2">{advice.type}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FruitAdviceTab;
