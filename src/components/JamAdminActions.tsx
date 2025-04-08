
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminActionButtons from '@/components/AdminActionButtons';

interface JamAdminActionsProps {
  jamId: string;
  status?: string;
  onStatusChange?: () => void;
}

const JamAdminActions: React.FC<JamAdminActionsProps> = ({ 
  jamId,
  status = 'pending',
  onStatusChange 
}) => {
  return (
    <AdminActionButtons 
      itemId={jamId}
      itemType="jam"
      status={status}
      onStatusChange={onStatusChange}
      canEdit={true}
      canDelete={true}
      editRoute={`/jam/edit/${jamId}`}
      redirectAfterDelete="/explore"
    />
  );
};

export default JamAdminActions;
