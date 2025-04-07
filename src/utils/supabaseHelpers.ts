
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Helper function to safely type Supabase queries
export const getTypedSupabaseQuery = <T extends keyof Database['public']['Tables']>(table: T) => {
  return supabase.from(table);
};

// Helper function to safely handle query results and prevent null reference errors
export const safeQueryResult = <T>(data: T | null): T | null => {
  return data;
};

// Helper function to check if object is null or undefined
export const isNullOrUndefined = (obj: any): boolean => {
  return obj === null || obj === undefined;
};

// Helper function for safely accessing object properties
export const safeAccess = <T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined => {
  if (isNullOrUndefined(obj)) {
    return undefined;
  }
  return obj[key];
};

// Helper function to safely get profile initials from a username
export const getProfileInitials = (username: string | null | undefined): string => {
  if (!username) return 'U';
  return username.substring(0, 1).toUpperCase();
};
