
import React from "react";
import { Star, BadgeEuro } from "lucide-react";
import { JamFormData } from "@/hooks/useJamForm";
import { Badge } from "@/components/ui/badge";
import { CreditBadge } from "@/components/ui/credit-badge";

interface JamPreviewProps {
  formData: JamFormData;
  fullPreview?: boolean;
}

const JamPreview: React.FC<JamPreviewProps> = ({ formData, fullPreview = false }) => {
  const previewImage = formData.cover_image_url || '/placeholder.svg';

  return (
    <div className={`group overflow-hidden rounded-lg border border-muted bg-background ${fullPreview ? "w-full max-w-md mx-auto" : ""}`}>
      <div className="aspect-square overflow-hidden relative">
        <img
          src={previewImage}
          alt={formData.name || "Preview de confiture"}
          className="h-full w-full object-cover"
        />
        {formData.is_pro && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-jam-honey text-white flex items-center gap-1">
              <BadgeEuro className="h-3 w-3" />
              PRO
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium line-clamp-2">
            {formData.name || "Nom de la confiture"}
          </h3>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">0.0</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {formData.description || "Description de la confiture"}
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {formData.ingredients.slice(0, 2).map((ingredient, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {ingredient.name || "Ingrédient"}
            </Badge>
          ))}
          {formData.ingredients.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{formData.ingredients.length - 2}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            {formData.is_pro && formData.price_euros ? (
              <span className="text-sm font-medium">
                {Number(formData.price_euros).toFixed(2)} €
              </span>
            ) : (
              <CreditBadge amount={formData.price_credits || 0} size="sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JamPreview;
