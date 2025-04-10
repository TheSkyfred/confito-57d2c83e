
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminActionButtons from '@/components/AdminActionButtons';
import { useUserRole } from '@/hooks/useUserRole';

interface JamAdminActionsProps {
  jamId: string;
  status?: string;
  isActive?: boolean;
  onStatusChange?: () => void;
  onActiveChange?: () => void;
  creatorId?: string;
}

const JamAdminActions: React.FC<JamAdminActionsProps> = ({ 
  jamId,
  status = 'pending',
  isActive = true,
  onStatusChange,
  onActiveChange,
  creatorId
}) => {
  const { isAdmin, isModerator } = useUserRole();

  // Permettre aux admins et modérateurs d'éditer toutes les confitures
  const canEdit = isAdmin || isModerator;

  return (
    <AdminActionButtons 
      itemId={jamId}
      itemType="jam"
      status={status}
      isActive={isActive}
      onStatusChange={onStatusChange}
      onActiveChange={onActiveChange}
      canEdit={canEdit}
      canDelete={isAdmin}
      editRoute={`/jam/edit/${jamId}`}
      redirectAfterDelete="/explore"
    />
  );
};

export default JamAdminActions;
