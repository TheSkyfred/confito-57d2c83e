
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

interface FruitHeaderProps {
  name: string;
  tags: { tag: string }[] | undefined;
  loadingTags: boolean;
}

export const FruitHeader: React.FC<FruitHeaderProps> = ({ 
  name, 
  tags,
  loadingTags 
}) => {
  return (
    <div className="mb-6">
      <Button asChild variant="outline" className="mb-4">
        <Link to="/seasonal">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Calendrier des fruits
        </Link>
      </Button>
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
