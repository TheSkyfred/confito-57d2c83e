
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useUserRole = () => {
  const { profile, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // When authLoading changes to false, we know the auth process is complete
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);
  
  // Ensure profile?.role is a valid role or default to 'user'
  const role: UserRole = profile?.role && ['admin', 'moderator', 'user'].includes(profile.role as string) 
    ? profile.role as UserRole 
    : 'user';
  
  // Always compute these values consistently
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator' || isAdmin;
  
  return { isAdmin, isModerator, role, isLoading };
};
