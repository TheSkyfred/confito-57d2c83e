
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminActionButtons from '@/components/AdminActionButtons';
import { useUserRole } from '@/hooks/useUserRole';
import { JamType } from '@/types/supabase';

interface JamAdminActionsProps {
  jamId: string;
  status?: string;
  isActive?: boolean;
  onStatusChange?: () => void;
  onActiveChange?: () => void;
  creatorId?: string;
  isPro?: boolean;
}

const JamAdminActions: React.FC<JamAdminActionsProps> = ({ 
  jamId,
  status = 'pending',
  isActive = true,
  onStatusChange,
  onActiveChange,
  creatorId,
  isPro = false
}) => {
  const { isAdmin, isModerator } = useUserRole();

  // Permettre aux admins d'éditer toutes les confitures
  // Permettre aux modérateurs d'éditer toutes les confitures SAUF celles des pros
  // Les confitures pro ne peuvent être éditées que par les admins
  const canEdit = isAdmin || (isModerator && !isPro);

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
