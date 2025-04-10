
import { supabase } from '@/integrations/supabase/client';

// Function to initialize necessary storage buckets
export const initStorageBuckets = async () => {
  // Check if advice_images bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error checking storage buckets:', listError);
    return;
  }
  
  // Create advice_images bucket if it doesn't exist
  const adviceImagesBucketExists = buckets?.some(bucket => bucket.name === 'advice_images');
  
  if (!adviceImagesBucketExists) {
    const { error: createError } = await supabase.storage.createBucket('advice_images', { 
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    });
    
    if (createError) {
      console.error('Error creating advice_images bucket:', createError);
      return;
    }
    
    console.log('Created advice_images storage bucket');
    
    // Set public bucket policy
    const { error: policyError } = await supabase.storage.from('advice_images').createSignedUrl(
      'placeholder.txt', 
      60,
      {
        download: true
      }
    );
    
    if (policyError && policyError.message !== 'The resource was not found') {
      console.error('Error setting bucket policy:', policyError);
    }
  }
};
