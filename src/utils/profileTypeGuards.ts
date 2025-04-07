
import { ProfileType } from '@/types/supabase';

// Type guard for checking if an object is a valid ProfileType
export const isProfileType = (obj: any): obj is ProfileType => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'username' in obj
  );
};

// Ensure profile objects are properly typed
export const ensureProfileType = (profile: any): ProfileType | null => {
  if (isProfileType(profile)) {
    return profile;
  }
  return null;
};

// Safe property accessors for profiles
export const getProfileUsername = (profile: any): string => {
  if (isProfileType(profile) && profile.username) {
    return profile.username;
  }
  return 'User';
};

export const getProfileAvatarUrl = (profile: any): string | null => {
  if (isProfileType(profile)) {
    return profile.avatar_url;
  }
  return null;
};

export const getProfileFullName = (profile: any): string => {
  if (isProfileType(profile) && profile.full_name) {
    return profile.full_name;
  }
  return getProfileUsername(profile);
};

export const getProfileId = (profile: any): string | null => {
  if (isProfileType(profile)) {
    return profile.id;
  }
  return null;
};
