
import React from 'react';
import AdminActionButtons from '@/components/AdminActionButtons';
import { useUserRole } from '@/hooks/useUserRole';

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
  const { isAdmin, isModerator } = useUserRole();
  
  // For advice, we use visible status as a proxy for approved/rejected
  const mappedStatus = isVisible ? 'approved' : 'rejected';

  return (
    <AdminActionButtons 
      itemId={adviceId}
      itemType="advice"
      status={mappedStatus}
      isActive={isVisible}
      onStatusChange={onVisibilityChange}
      onActiveChange={onVisibilityChange}
      editRoute={`/conseils/edit/${adviceId}`}
      redirectAfterDelete="/conseils"
    />
  );
};

export default AdviceAdminActions;
