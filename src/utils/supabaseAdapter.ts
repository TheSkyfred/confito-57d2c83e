
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { InsertRecord, TableName, AdsCampaignType, AdsInvoiceType } from '@/types/supabase';

// Helper for direct database operations
export const supabaseDirect = {
  // Select data from a table
  select: async <T extends object>(tableName: TableName, select: string = '*', filters?: Record<string, any>) => {
    let query = supabase.from(tableName).select(select);
    
    // Add filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    return { data: data as unknown as T[], error };
  },

  // Select data with a where clause
  selectWhere: async <T extends object>(tableName: TableName, column: string, value: any, select: string = '*') => {
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq(column, value);
    return { data: data as unknown as T[], error };
  },

  // Select data with a where in clause
  selectWhereIn: async <T extends object>(tableName: TableName, column: string, values: any[], select: string = '*') => {
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .in(column, values);
    return { data: data as unknown as T[], error };
  },

  // Get a record by ID
  getById: async <T extends object>(tableName: TableName, id: string, select: string = '*') => {
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq('id', id)
      .single();
    return { data: data as unknown as T, error };
  },

  // Insert data and return the inserted data
  insertAndReturn: async <T extends object>(tableName: TableName, data: InsertRecord<T>) => {
    const { data: returnedData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
    return { data: returnedData as unknown as T[], error };
  },

  // Insert data without returning
  insert: async <T extends object>(tableName: TableName, data: InsertRecord<T>) => {
    const { error } = await supabase
      .from(tableName)
      .insert(data);
    return { error };
  },

  // Update data
  update: async <T extends object>(tableName: TableName, data: Partial<T>, idObj: { id: string }) => {
    const { error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', idObj.id);
    return { error };
  },

  // Delete data
  delete: async (tableName: TableName, idObj: { id: string }) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', idObj.id);
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
    
    // Record the click directly in advice_products
    await supabase
      .from('advice_products')
      .update({ 
        click_count: supabase.rpc('increment', { 
          row_id: productId,
          table_name: 'advice_products',
          column_name: 'click_count' 
        }) as any
      })
      .eq('id', productId);
      
    // Log the click in a separate structure if available
    try {
      console.log('Recording product click:', clickData);
      // Could implement a different tracking mechanism here if needed
    } catch (error) {
      console.warn('Error tracking product click details:', error);
    }
      
    return true;
  } catch (error) {
    console.error('Error tracking product click:', error);
    return false;
  }
};
