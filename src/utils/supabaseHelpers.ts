
import { supabase } from '@/integrations/supabase/client';

// Helper function to safely type Supabase queries
export const getTypedSupabaseQuery = (table: string) => {
  return supabase.from(table);
};
