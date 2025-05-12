
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarBadge } from '@/components/ui/avatar-badge';
import { ProfileType } from '@/types/supabase';
import { getProfileInitials } from '@/utils/supabaseHelpers';
import { 
  getProfileUsername,
  getProfileAvatarUrl,
  getProfileFullName,
  getProfileId
} from '@/utils/profileTypeGuards';
import { useCartStore } from '@/stores/useCartStore';

interface ProfileDisplayProps {
  profile: ProfileType | null | undefined | Record<string, any>;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCartBadge?: boolean;
}

export const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ 
  profile, 
  showName = true,
  size = 'md',
  showCartBadge = false
}) => {
  const username = getProfileUsername(profile);
  const avatarUrl = getProfileAvatarUrl(profile);
  const displayName = getProfileFullName(profile);
  const userId = getProfileId(profile);
  const initial = getProfileInitials(username);
  const totalItems = useCartStore(state => state.getTotalItems());
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={avatarUrl || ''} alt={username} />
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        {showCartBadge && totalItems > 0 && (
          <AvatarBadge 
            variant="default" 
            size={size === 'lg' ? 'lg' : 'md'}
            badgeContent={totalItems > 99 ? '99+' : totalItems}
          />
        )}
      </div>
      {showName && (
        <span className="text-sm font-medium">{displayName}</span>
      )}
    </div>
  );
};
