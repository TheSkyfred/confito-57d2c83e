
// Fixing the type errors in UserDashboard around profile structures
// This is a partial implementation focused on fixing the specific errors

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OrderType, ProfileType } from '@/types/supabase';

// Add addressing code to orders to fix type issues with profiles

const completeProfile = (profileData: any): ProfileType => {
  return {
    ...profileData,
    address_line1: profileData.address_line1 || profileData.address || '',
    address_line2: profileData.address_line2 || null,
    postal_code: profileData.postal_code || '',
    city: profileData.city || ''
  } as ProfileType;
};

// Update buyer and seller with the complete profile

const getReceivedOrders = async (userId: string): Promise<OrderType[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      seller:profiles!orders_seller_id_fkey (*)
    `)
    .eq('buyer_id', userId);
    
  if (error) {
    console.error('Error fetching received orders:', error);
    return [];
  }
  
  // Transform the data to ensure profiles have all required fields
  return data.map(order => {
    if (order.seller) {
      return {
        ...order,
        seller: completeProfile(order.seller)
      };
    }
    return order;
  }) as OrderType[];
};

const getSentOrders = async (userId: string): Promise<OrderType[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      buyer:profiles!orders_buyer_id_fkey (*)
    `)
    .eq('seller_id', userId);
    
  if (error) {
    console.error('Error fetching sent orders:', error);
    return [];
  }
  
  // Transform the data to ensure profiles have all required fields
  return data.map(order => {
    if (order.buyer) {
      return {
        ...order,
        buyer: completeProfile(order.buyer)
      };
    }
    return order;
  }) as OrderType[];
};
