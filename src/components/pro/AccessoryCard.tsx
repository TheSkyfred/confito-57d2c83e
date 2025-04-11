
import React from 'react';
import { ProAccessory } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { useProAccessories } from '@/hooks/useProAccessories';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface AccessoryCardProps {
  accessory: ProAccessory;
  onEdit?: (accessory: ProAccessory) => void;
  onDelete?: (id: string) => void;
}

const AccessoryCard: React.FC<AccessoryCardProps> = ({ accessory, onEdit, onDelete }) => {
  const { incrementClickCount } = useProAccessories();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  
  const handleExternalClick = () => {
    if (accessory.external_url) {
      // Incrémenter le compteur de clics
      incrementClickCount.mutate(accessory.id);
      // Ouvrir l'URL dans un nouvel onglet
      window.open(accessory.external_url, '_blank', 'noopener,noreferrer');
    }
  };
  
  const canEdit = isAdmin || (user?.id === accessory.created_by);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline">{accessory.brand}</Badge>
          <Badge variant="secondary">{accessory.click_count} clics</Badge>
        </div>
        <CardTitle className="text-lg">{accessory.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col">
        {accessory.image_url && (
          <div className="relative mb-4 h-40 bg-muted rounded-md overflow-hidden">
            <img 
              src={accessory.image_url} 
              alt={accessory.name} 
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        <CardDescription className="text-sm flex-grow">
          {accessory.short_description}
        </CardDescription>
        
        {accessory.creator && (
          <div className="mt-4 pt-4 border-t flex items-center text-sm text-muted-foreground">
            <span className="mr-2">Ajouté par:</span>
            <ProfileDisplay profile={accessory.creator} showName={true} size="sm" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
          {canEdit && (
            <>
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(accessory)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDelete(accessory.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
        
        {accessory.external_url && (
          <Button 
            variant="default" 
            size="sm"
            onClick={handleExternalClick}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Visiter
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AccessoryCard;
