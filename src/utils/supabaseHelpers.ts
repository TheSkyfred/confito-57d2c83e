
import { supabase } from '@/integrations/supabase/client';

/**
 * Get initials from a name (e.g. "John Doe" -> "JD")
 */
export const getProfileInitials = (username: string): string => {
  if (!username) return '?';
  
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else {
    return username.slice(0, 2).toUpperCase();
  }
};

/**
 * Helper function to handle file uploads to Storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    
    if (error) {
      throw error;
    }
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

/**
 * Helper function to format a username for display
 */
export const formatUsername = (username: string | null | undefined, fallback = 'User'): string => {
  if (!username) return fallback;
  return username;
};
