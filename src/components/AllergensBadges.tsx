
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from '@tanstack/react-query';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { AllergenType } from '@/types/supabase';

interface AllergensBadgesProps {
  allergens: string[];
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const AllergensBadges: React.FC<AllergensBadgesProps> = ({ 
  allergens, 
  size = 'md',
  showTooltip = true 
}) => {
  // Fetch all allergens from database for severity info
  const { data: allergensData, isLoading } = useQuery({
    queryKey: ['allergens'],
    queryFn: async () => {
      const { data, error } = await supabaseDirect.select(
        'allergens',
        '*'
      );
      
      if (error) throw error;
      return data as AllergenType[];
    },
  });

  if (!allergens || allergens.length === 0) {
    return null;
  }

  // Define size classes
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  };

  const badgeClass = `font-medium bg-red-100 text-red-800 border-red-300 ${sizeClasses[size]}`;
  
  return (
    <div className="flex flex-wrap gap-2">
      {allergens.map((allergen) => {
        // Find allergen data to get severity
        const allergenInfo = allergensData?.find(a => 
          a.name.toLowerCase() === allergen.toLowerCase()
        );
        
        const severity = allergenInfo?.severity || 3;
        const severityLabel = severity >= 5 ? 'Très fort' : 
                               severity >= 4 ? 'Fort' :
                               severity >= 3 ? 'Modéré' : 'Faible';
        
        const badge = (
          <Badge 
            key={allergen} 
            variant="outline"
            className={badgeClass}
          >
            <AlertCircle className="h-3 w-3 mr-1.5" />
            {allergen}
          </Badge>
        );

        return showTooltip ? (
          <TooltipProvider key={allergen}>
            <Tooltip>
              <TooltipTrigger asChild>
                {badge}
              </TooltipTrigger>
              <TooltipContent>
                <p>Allergène: {severityLabel}</p>
                {allergenInfo?.description && (
                  <p className="text-xs max-w-xs mt-1">{allergenInfo.description}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : badge;
      })}
    </div>
  );
};

export default AllergensBadges;
