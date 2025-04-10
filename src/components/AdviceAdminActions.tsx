
import React from 'react';
import AdminActionButtons from '@/components/AdminActionButtons';

interface AdviceAdminActionsProps {
  adviceId: string;
  isVisible?: boolean;
  onVisibilityChange?: () => void;
}

const AdviceAdminActions: React.FC<AdviceAdminActionsProps> = ({ 
  adviceId, 
  isVisible = true,
  onVisibilityChange
}) => {
  return (
    <AdminActionButtons 
      itemId={adviceId}
      itemType="advice"
      isActive={isVisible}
      onActiveChange={onVisibilityChange}
      editRoute={`/conseils/edit/${adviceId}`}
      redirectAfterDelete="/conseils"
    />
  );
};

export default AdviceAdminActions;
