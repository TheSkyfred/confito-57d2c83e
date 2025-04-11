
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileType } from '@/types/supabase';

export type UserWithProfileType = ProfileType & {
  lastLogin?: string;
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
      const usersWithLastLogin = profiles.map((profile: any) => {
        // Ensure the profile conforms to the ProfileType with the new fields
        const completeProfile: Partial<ProfileType> = {
          ...profile,
          address_line1: profile.address_line1 || profile.address || '',
          address_line2: profile.address_line2 || null,
          postal_code: profile.postal_code || '',
          city: profile.city || '',
        };

        return {
          ...completeProfile,
          lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T').join(' ').substring(0, 16)
        } as UserWithProfileType;
      });

      console.log('Fetched users:', usersWithLastLogin);
      return usersWithLastLogin;
    }
  });
};
