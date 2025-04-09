
import React from 'react';
import { Separator } from "@/components/ui/separator";

interface FruitInfoTabProps {
  description?: string;
  conservationTips?: string;
  cookingTips?: string;
}

export const FruitInfoTab: React.FC<FruitInfoTabProps> = ({
  description,
  conservationTips,
  cookingTips
}) => {
  const hasContent = description || conservationTips || cookingTips;
  
  if (!hasContent) {
    return <p className="text-muted-foreground">Aucune information supplémentaire disponible.</p>;
  }

  return (
    <div className="space-y-4">
      {description && (
        <div>
          <h3 className="font-medium mb-1">Description</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}
      
      {conservationTips && (
        <>
          <Separator />
          <div>
            <h3 className="font-medium mb-1">Conseils de conservation</h3>
            <p className="text-sm text-muted-foreground">{conservationTips}</p>
          </div>
        </>
      )}
      
      {cookingTips && (
        <>
          <Separator />
          <div>
            <h3 className="font-medium mb-1">Conseils de préparation</h3>
            <p className="text-sm text-muted-foreground">{cookingTips}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default FruitInfoTab;
