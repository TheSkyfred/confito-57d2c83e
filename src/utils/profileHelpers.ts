
import { ProfileType } from '@/types/supabase';

/**
 * Ensures the profile data has a valid ID field by using either id or user_id
 */
export const formatProfileData = (profileData: any): ProfileType => {
  if (!profileData) return null as unknown as ProfileType;
  
  // If profile has user_id but no id, use user_id as id
  return {
    ...profileData,
    id: profileData.id || profileData.user_id
  };
};

/**
 * Batch formats an array of profile data
 */
export const formatProfilesData = (profilesData: any[]): ProfileType[] => {
  if (!profilesData) return [];
  
  return profilesData.map(formatProfileData);
};
