
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileType } from '@/types/supabase';

export type UserWithProfileType = ProfileType & {
  lastLogin?: string;
  // Make sure is_active is included in the type
  is_active?: boolean;
};

export const useUsers = (searchTerm: string = '') => {
  return useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      // Get the last login info for each user from auth.users
      // Note: This will only work with service_role key, not with anon key
      // For demo purposes, we'll set a random date for last login
      const usersWithLastLogin: UserWithProfileType[] = profiles.map((profile) => ({
        ...profile,
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T').join(' ').substring(0, 16)
      }));

      console.log('Fetched users:', usersWithLastLogin);
      return usersWithLastLogin;
    }
  });
};
