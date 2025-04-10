
import React from 'react';
import AdminActionButtons from '@/components/AdminActionButtons';
import { useUserRole } from '@/hooks/useUserRole';

interface ProfileAdminActionsProps {
  userId: string;
  isActive?: boolean;
  onActiveChange?: () => void;
}

const ProfileAdminActions: React.FC<ProfileAdminActionsProps> = ({ 
  userId,
  isActive = true,
  onActiveChange
}) => {
  const { isAdmin, isModerator } = useUserRole();
  
  return (
    <AdminActionButtons 
      itemId={userId}
      itemType="profile"
      status="approved" // Profiles don't have an approval status
      isActive={isActive}
      onActiveChange={onActiveChange}
      canEdit={isAdmin}
      canDelete={isAdmin}
      editRoute={`/admin/users/edit/${userId}`}
      redirectAfterDelete="/admin/users"
    />
  );
};

export default ProfileAdminActions;
