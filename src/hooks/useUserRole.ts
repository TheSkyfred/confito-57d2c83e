
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'admin' | 'moderator' | 'user';

export const useUserRole = () => {
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === 'admin';
  const isModerator = profile?.role === 'moderator' || isAdmin;
  
  return { isAdmin, isModerator };
};
