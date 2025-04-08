
import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';

interface AdminActionButtonsProps {
  entityId: string;
  entityType: 'jam' | 'battle';
  onDelete?: () => void;
}

export const AdminActionButtons: React.FC<AdminActionButtonsProps> = ({
  entityId,
  entityType,
  onDelete
}) => {
  const { isAdmin, isModerator } = useUserRole();
  
  if (!isModerator) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        asChild
      >
        <Link to={`/${entityType}/edit/${entityId}`}>
          <Pencil className="h-4 w-4 mr-1" />
          Modifier
        </Link>
      </Button>
      
      {isAdmin && onDelete && (
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
      )}
    </div>
  );
};
