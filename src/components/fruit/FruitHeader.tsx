
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface FruitHeaderProps {
  name: string;
  tags: { tag: string }[] | undefined;
  loadingTags: boolean;
  fruitId?: string;
}

export const FruitHeader: React.FC<FruitHeaderProps> = ({ 
  name, 
  tags,
  loadingTags,
  fruitId 
}) => {
  const { isAdmin, isModerator } = useUserRole();
  const showAdminActions = isAdmin || isModerator;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button asChild variant="outline">
          <Link to="/seasonal">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Calendrier des fruits
          </Link>
        </Button>

        {showAdminActions && fruitId && (
          <Button asChild variant="outline">
            <Link to={`/admin/fruits/${fruitId}`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier ce fruit
            </Link>
          </Button>
        )}
      </div>
      
      <h1 className="text-3xl font-serif font-bold">{name}</h1>
      {!loadingTags && tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge key={tag.tag} variant="secondary">{tag.tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default FruitHeader;
