
import React from 'react';
import AdminActionButtons from '@/components/AdminActionButtons';
import { useUserRole } from '@/hooks/useUserRole';

interface RecipeAdminActionsProps {
  recipeId: string;
  status?: string;
  isActive?: boolean;
  onStatusChange?: () => void;
  onActiveChange?: () => void;
}

const RecipeAdminActions: React.FC<RecipeAdminActionsProps> = ({ 
  recipeId,
  status = 'brouillon',
  isActive = true,
  onStatusChange,
  onActiveChange
}) => {
  const { isAdmin, isModerator } = useUserRole();
  
  // Map Supabase recipe status to our simplified status
  const mappedStatus = status === 'approuvé' 
    ? 'approved' 
    : status === 'rejeté' 
      ? 'rejected' 
      : 'pending';

  return (
    <AdminActionButtons 
      itemId={recipeId}
      itemType="recipe"
      status={mappedStatus}
      isActive={isActive}
      onStatusChange={onStatusChange}
      onActiveChange={onActiveChange}
      editRoute={`/recipes/edit/${recipeId}`}
      redirectAfterDelete="/recipes"
    />
  );
};

export default RecipeAdminActions;
