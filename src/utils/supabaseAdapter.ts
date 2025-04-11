
import { supabase } from '@/integrations/supabase/client';
import { InsertRecord } from '@/types/supabase';

// Helper for direct database operations
export const supabaseDirect = {
  // Select data from a table
  select: async (tableName: string, select: string = '*') => {
    const { data, error } = await supabase
      .from(tableName)
      .select(select);
    return { data, error };
  },

  // Select data with a where clause
  selectWhere: async (tableName: string, column: string, value: any, select: string = '*') => {
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq(column, value);
    return { data, error };
  },

  // Select data with a where in clause
  selectWhereIn: async (tableName: string, column: string, values: any[], select: string = '*') => {
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .in(column, values);
    return { data, error };
  },

  // Get a record by ID
  getById: async (tableName: string, id: string, select: string = '*') => {
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Insert data and return the inserted data
  insertAndReturn: async <T extends object>(tableName: string, data: InsertRecord<T>) => {
    const { data: returnedData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
    return { data: returnedData as T[], error };
  },

  // Insert data without returning
  insert: async (tableName: string, data: any) => {
    const { error } = await supabase
      .from(tableName)
      .insert(data);
    return { error };
  },

  // Update data
  update: async (tableName: string, id: string, data: any) => {
    const { error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id);
    return { error };
  },

  // Delete data
  delete: async (tableName: string, id: string) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Track product clicks
export const trackProductClick = async (productId: string, articleId: string) => {
  try {
    const { data: userResponse } = await supabase.auth.getUser();
    const user = userResponse?.user;
    
    const clickData = {
      product_id: productId,
      article_id: articleId,
      user_id: user?.id || null,
      user_agent: navigator.userAgent,
    };
    
    // Record the click
    await supabase.from('advice_product_clicks').insert(clickData);
    
    // Fetch current click count
    const { data: productData } = await supabase
      .from('advice_products')
      .select('click_count')
      .eq('id', productId)
      .single();
      
    const currentClicks = productData?.click_count || 0;
    
    // Update the click count directly
    await supabase
      .from('advice_products')
      .update({ click_count: currentClicks + 1 })
      .eq('id', productId);
      
    return true;
  } catch (error) {
    console.error('Error tracking product click:', error);
    return false;
  }
};
