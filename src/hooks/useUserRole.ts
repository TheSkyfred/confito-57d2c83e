
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'moderator' | 'user' | 'pro';

export const useUserRole = () => {
  const { profile, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // When authLoading changes to false, we know the auth process is complete
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);
  
  // If no profile, assume anonymous user with role 'user'
  if (!profile) {
    return {
      isAdmin: false,
      isModerator: false,
      isPro: false,
      role: 'user' as UserRole,
      isLoading,
      canManage: false
    };
  }
  
  // Ensure profile?.role is a valid role or default to 'user'
  const role: UserRole = profile?.role && ['admin', 'moderator', 'user', 'pro'].includes(profile.role as string) 
    ? profile.role as UserRole 
    : 'user';
  
  // Always compute these values consistently
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator' || isAdmin;
  const isPro = role === 'pro';
  
  // Add canManage property for the JamDetails component
  const canManage = isAdmin || isModerator;
  
  return { isAdmin, isModerator, isPro, role, isLoading, canManage };
};
