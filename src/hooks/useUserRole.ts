
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useUserRole = () => {
  const { profile } = useAuth();
  
  // Ensure profile?.role is a valid role or default to 'user'
  const role: UserRole = profile?.role && ['admin', 'moderator', 'user'].includes(profile.role as string) 
    ? profile.role as UserRole 
    : 'user';
  
  // Always compute these values consistently
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator' || isAdmin;
  
  return { isAdmin, isModerator, role };
};
