
import { supabase } from '@/integrations/supabase/client';

type InsertRecord<T> = T extends { id: any } ? Omit<T, 'id' | 'created_at' | 'updated_at'> : T;

/**
 * Insert a record and return the inserted record
 */
export const supabaseDirect = {
  insertAndReturn: async <T extends object>(
    tableName: string, 
    data: InsertRecord<T>
  ): Promise<{ data: T[], error: any }> => {
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select('*');
      
    return { data: insertedData || [], error };
  }
};

// Track product clicks
export const trackProductClick = async (productId: string, articleId: string) => {
  try {
    const { user } = await supabase.auth.getUser();
    
    const clickData = {
      product_id: productId,
      article_id: articleId,
      user_id: user?.id || null,
      user_agent: navigator.userAgent,
    };
    
    // Record the click
    await supabase.from('advice_product_clicks').insert(clickData);
    
    // Update the click count on the product
    await supabase
      .from('advice_products')
      .update({ 
        click_count: supabase.rpc('increment', { row_id: productId, table_name: 'advice_products', column_name: 'click_count' })
      })
      .eq('id', productId);
      
    return true;
  } catch (error) {
    console.error('Error tracking product click:', error);
    return false;
  }
};
