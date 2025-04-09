
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Leaf } from "lucide-react";
import FruitSeasonality from './FruitSeasonality';

interface FruitSidebarProps {
  fruit: any;
  tags: string[] | undefined;
  seasons: number[] | undefined;
  loadingTags: boolean;
  loadingSeasons: boolean;
}

export const FruitSidebar: React.FC<FruitSidebarProps> = ({
  fruit,
  tags,
  seasons,
  loadingTags,
  loadingSeasons
}) => {
  return (
    <div className="space-y-3">
      {fruit.image_url ? (
        <div className="relative h-64 rounded-md overflow-hidden">
          <img 
            src={fruit.image_url}
            alt={fruit.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-64 bg-muted flex items-center justify-center rounded-md">
          <Leaf className="h-16 w-16 text-muted-foreground" />
        </div>
      )}
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Famille</h4>
          <p>{fruit.family || "Non spécifiée"}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Statut</h4>
          <Badge variant={fruit.is_published ? "default" : "outline"}>
            {fruit.is_published ? "Publié" : "Non publié"}
          </Badge>
        </div>
        
        {!loadingTags && tags && tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <Badge key={`tag-${index}-${tag}`} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Saisonnalité</h4>
          <FruitSeasonality 
            seasons={seasons} 
            loadingSeasons={loadingSeasons} 
          />
        </div>
      </div>
    </div>
  );
};

export default FruitSidebar;
