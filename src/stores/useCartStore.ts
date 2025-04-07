
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JamType } from '@/types/supabase';

interface CartItem {
  jam: JamType;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (jam: JamType, quantity?: number) => void;
  removeItem: (jamId: string) => void;
  updateQuantity: (jamId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalCredits: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (jam, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.jam.id === jam.id);
          
          if (existingItem) {
            // Limit to available quantity
            const newQuantity = Math.min(
              existingItem.quantity + quantity,
              jam.available_quantity
            );
            
            return {
              items: state.items.map(item => 
                item.jam.id === jam.id 
                  ? { ...item, quantity: newQuantity }
                  : item
              )
            };
          }
          
          return {
            items: [...state.items, { jam, quantity: Math.min(quantity, jam.available_quantity) }]
          };
        });
      },
      
      removeItem: (jamId) => {
        set((state) => ({
          items: state.items.filter(item => item.jam.id !== jamId)
        }));
      },
      
      updateQuantity: (jamId, quantity) => {
        set((state) => ({
          items: state.items.map(item => 
            item.jam.id === jamId 
              ? { ...item, quantity: Math.min(quantity, item.jam.available_quantity) }
              : item
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalCredits: () => {
        return get().items.reduce((total, item) => total + (item.jam.price_credits * item.quantity), 0);
      }
    }),
    {
      name: 'jam-cart-storage'
    }
  )
);
