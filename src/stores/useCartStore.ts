import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JamType, ProfileType } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';

// Define the item type for the cart
export interface CartItem {
  jam: JamType;
  quantity: number;
}

// Define the store's state
interface CartState {
  items: CartItem[];
  cartId: string | null;
  addItem: (jam: JamType) => void;
  removeItem: (jamId: string) => void;
  updateQuantity: (jamId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalCredits: () => number;
  syncWithDatabase: () => Promise<void>;
}

type GetterFn = () => CartState;
type SetterFn = (fn: (prevState: CartState) => CartState) => void;

// Function to update or create a cart in the database
const updateOrCreateCart = async (userId: string, cartId: string | null) => {
  if (cartId) {
    // Update existing cart
    const { error } = await supabase
      .from('carts')
      .update({ user_id: userId })
      .eq('id', cartId);
    if (error) throw error;
    return cartId;
  } else {
    // Create a new cart
    const { data, error } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data.id;
  }
};

// Function to update cart items in the database
const updateCartItemsInDatabase = async (cartId: string, items: CartItem[]) => {
  // Delete existing items
  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);
  if (deleteError) throw deleteError;

  // Insert current items
  const cartItemsToInsert = items.map(item => ({
    cart_id: cartId,
    jam_id: item.jam.id,
    quantity: item.quantity,
  }));
  const { error: insertError } = await supabase
    .from('cart_items')
    .insert(cartItemsToInsert);
  if (insertError) throw insertError;
};

// Update the cart item data structure when loading from database
const transformCartItems = (items: any[]): CartItem[] => {
  return items.map(item => {
    // Ensure profiles have all required fields
    if (item.jam?.profiles) {
      const profile = item.jam.profiles;
      item.jam.profiles = {
        ...profile,
        address_line1: profile.address_line1 || profile.address || '',
        address_line2: profile.address_line2 || null,
        postal_code: profile.postal_code || '',
        city: profile.city || ''
      };
    }
    return item;
  });
};

// Create the store
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      addItem: (jam) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.jam.id === jam.id);
          if (existingItem) {
            const updatedItems = state.items.map((item) =>
              item.jam.id === jam.id ? { ...item, quantity: item.quantity + 1 } : item
            );
            
            // Sync with database
            if (state.cartId) {
              updateCartItemsInDatabase(state.cartId, updatedItems);
            }
            
            return { ...state, items: updatedItems };
          } else {
            const newItem: CartItem = { jam, quantity: 1 };
            
            // Sync with database
            if (state.cartId) {
              updateCartItemsInDatabase(state.cartId, [...state.items, newItem]);
            }
            
            return { ...state, items: [...state.items, newItem] };
          }
        });
      },
      removeItem: (jamId) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.jam.id !== jamId);
          
          // Sync with database
          if (state.cartId) {
            updateCartItemsInDatabase(state.cartId, updatedItems);
          }
          
          return { ...state, items: updatedItems };
        });
      },
      updateQuantity: (jamId, quantity) => {
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.jam.id === jamId ? { ...item, quantity } : item
          );
          
          // Sync with database
          if (state.cartId) {
            updateCartItemsInDatabase(state.cartId, updatedItems);
          }
          
          return { ...state, items: updatedItems };
        });
      },
      clearCart: () => {
        set((state) => {
          // Sync with database
          if (state.cartId) {
            updateCartItemsInDatabase(state.cartId, []);
          }
          
          return { ...state, items: [], cartId: null };
        });
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalCredits: () => {
        return get().items.reduce((total, item) => total + item.jam.price_credits * item.quantity, 0);
      },
      syncWithDatabase: async () => {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        
        if (!user) {
          console.log('No user found, skipping sync with database');
          return;
        }
        
        // If there's a user, try to load the cart from the database
        if (user) {
          try {
            const { data: cartData, error: cartError } = await supabase
              .from('carts')
              .select('*')
              .eq('user_id', user.id)
              .single();
            
            if (cartError && cartError.message.includes('No rows found')) {
              console.log('No cart found for user, creating a new one');
            } else if (cartError) {
              throw cartError;
            }
            
            let currentCartId = cartData?.id || null;
            
            if (!currentCartId) {
              currentCartId = await updateOrCreateCart(user.id, null);
              set({ cartId: currentCartId });
            } else {
              set({ cartId: currentCartId });
            }
            
            const { data: cartItemsData, error: cartItemsError } = await supabase
              .from('cart_items')
              .select('*, jam:jam_id(*, profiles:creator_id(*))')
              .eq('cart_id', currentCartId);
            
            if (cartItemsError) throw cartItemsError;
            
            // Process the cart items
            if (cartData && cartItemsData) {
              const processedItems = transformCartItems(cartItemsData);
              set({ 
                items: processedItems,
                cartId: cartData.id 
              });
            }
          } catch (error) {
            console.error('Error loading cart from database:', error);
          }
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: typeof window !== 'undefined' 
        ? {
            getItem: (name) => {
              const str = localStorage.getItem(name);
              if (!str) return null;
              return JSON.parse(str);
            },
            setItem: (name, value) => {
              localStorage.setItem(name, JSON.stringify(value));
            },
            removeItem: (name) => localStorage.removeItem(name)
          }
        : undefined,
    }
  )
);
