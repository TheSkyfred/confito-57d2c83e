
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileType } from '@/types/supabase';
import { getProfileInitials } from '@/utils/supabaseHelpers';
import { 
  getProfileUsername,
  getProfileAvatarUrl,
  getProfileFullName
} from '@/utils/profileTypeGuards';

interface ProfileDisplayProps {
  profile: ProfileType | null | undefined | Record<string, any>;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ 
  profile, 
  showName = true,
  size = 'md'
}) => {
  const username = getProfileUsername(profile);
  const avatarUrl = getProfileAvatarUrl(profile);
  const displayName = getProfileFullName(profile);
  const initial = getProfileInitials(username);
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  
  return (
    <div className="flex items-center gap-2">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl || ''} alt={username} />
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-sm font-medium">{displayName}</span>
      )}
    </div>
  );
};
