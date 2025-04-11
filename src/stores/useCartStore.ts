
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JamType } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { createJSONStorage } from 'zustand/middleware';

interface CartItem {
  jam: JamType;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (jam: JamType, quantity?: number) => Promise<void>;
  removeItem: (jamId: string) => Promise<void>;
  updateQuantity: (jamId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalCredits: () => number;
  syncWithDatabase: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [] as CartItem[],
      
      addItem: async (jam, quantity = 1) => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData.session?.user;
          
          if (user) {
            const { data: existingCarts, error: cartsError } = await supabase
              .from('carts')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (cartsError) {
              console.error("Erreur lors de la récupération du panier:", cartsError.message);
              throw cartsError;
            }
            
            let cartId: string;
            
            if (!existingCarts) {
              const { data: newCart, error: cartError } = await supabase
                .from('carts')
                .insert({ user_id: user.id })
                .select('id')
                .single();
              
              if (cartError) throw cartError;
              cartId = newCart.id;
            } else {
              cartId = existingCarts.id;
            }
            
            const { data: existingItems, error: itemsError } = await supabase
              .from('cart_items')
              .select('id, quantity')
              .eq('cart_id', cartId)
              .eq('jam_id', jam.id)
              .maybeSingle();
            
            if (itemsError) {
              console.error("Erreur lors de la récupération des articles du panier:", itemsError.message);
              throw itemsError;
            }
            
            if (existingItems) {
              const newQuantity = Math.min(
                existingItems.quantity + quantity,
                jam.available_quantity
              );
              
              const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', existingItems.id);
              
              if (updateError) {
                if (updateError.message.includes('Quantité demandée')) {
                  toast({
                    title: "Quantité limitée",
                    description: `Il ne reste que ${jam.available_quantity} exemplaires disponibles.`,
                    variant: "destructive"
                  });
                } else {
                  throw updateError;
                }
              }
            } else {
              const { error: insertError } = await supabase
                .from('cart_items')
                .insert({
                  cart_id: cartId,
                  jam_id: jam.id,
                  quantity: Math.min(quantity, jam.available_quantity)
                });
              
              if (insertError) {
                if (insertError.message.includes('Quantité demandée')) {
                  toast({
                    title: "Quantité limitée",
                    description: `Il ne reste que ${jam.available_quantity} exemplaires disponibles.`,
                    variant: "destructive"
                  });
                } else {
                  throw insertError;
                }
              }
            }
            
            await get().syncWithDatabase();
          } else {
            set((state) => {
              const existingItem = state.items.find(item => item.jam.id === jam.id);
              
              if (existingItem) {
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
          }
        } catch (error: any) {
          console.error("Erreur lors de l'ajout au panier:", error.message);
          toast({
            title: "Erreur",
            description: "Impossible d'ajouter cet article au panier.",
            variant: "destructive"
          });
        }
      },
      
      removeItem: async (jamId) => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData.session?.user;
          
          if (user) {
            const { data: cartData, error: cartError } = await supabase
              .from('carts')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (cartError) {
              console.error("Erreur lors de la récupération du panier:", cartError.message);
              throw cartError;
            }
            
            if (cartData) {
              const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('cart_id', cartData.id)
                .eq('jam_id', jamId);
              
              if (error) throw error;
              
              await get().syncWithDatabase();
            }
          } else {
            set((state) => ({
              items: state.items.filter(item => item.jam.id !== jamId)
            }));
          }
        } catch (error: any) {
          console.error("Erreur lors de la suppression du panier:", error.message);
          toast({
            title: "Erreur",
            description: "Impossible de supprimer cet article du panier.",
            variant: "destructive"
          });
        }
      },
      
      updateQuantity: async (jamId, quantity) => {
        try {
          if (quantity < 1) return;
          
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData.session?.user;
          
          if (user) {
            const { data: cartData, error: cartError } = await supabase
              .from('carts')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (cartError) {
              console.error("Erreur lors de la récupération du panier:", cartError.message);
              throw cartError;
            }
            
            if (cartData) {
              const { data: itemData, error: itemError } = await supabase
                .from('cart_items')
                .select('id')
                .eq('cart_id', cartData.id)
                .eq('jam_id', jamId)
                .maybeSingle();
              
              if (itemError) {
                console.error("Erreur lors de la récupération de l'article:", itemError.message);
                throw itemError;
              }
              
              if (itemData) {
                const { error } = await supabase
                  .from('cart_items')
                  .update({ quantity })
                  .eq('id', itemData.id);
                
                if (error) {
                  if (error.message.includes('Quantité demandée')) {
                    const jam = get().items.find(item => item.jam.id === jamId)?.jam;
                    toast({
                      title: "Quantité limitée",
                      description: `Il ne reste que ${jam?.available_quantity} exemplaires disponibles.`,
                      variant: "destructive"
                    });
                    
                    if (jam) {
                      const { error: retryError } = await supabase
                        .from('cart_items')
                        .update({ quantity: jam.available_quantity })
                        .eq('id', itemData.id);
                      
                      if (!retryError) {
                        await get().syncWithDatabase();
                      }
                    }
                  } else {
                    throw error;
                  }
                } else {
                  await get().syncWithDatabase();
                }
              }
            }
          } else {
            const jam = get().items.find(item => item.jam.id === jamId)?.jam;
            
            if (!jam) return;
            
            if (quantity > jam.available_quantity) {
              toast({
                title: "Quantité limitée",
                description: `Il ne reste que ${jam.available_quantity} exemplaires disponibles.`,
                variant: "destructive"
              });
            }
            
            set((state) => {
              return {
                items: state.items.map(item => 
                  item.jam.id === jamId 
                    ? { ...item, quantity: Math.min(quantity, item.jam.available_quantity) }
                    : item
                )
              };
            });
          }
        } catch (error: any) {
          console.error("Erreur lors de la mise à jour de la quantité:", error.message);
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour la quantité.",
            variant: "destructive"
          });
        }
      },
      
      clearCart: async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData.session?.user;
          
          if (user) {
            const { data: cartData, error: cartError } = await supabase
              .from('carts')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (cartError) {
              console.error("Erreur lors de la récupération du panier:", cartError.message);
              throw cartError;
            }
            
            if (cartData) {
              const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('cart_id', cartData.id);
              
              if (error) throw error;
              
              set({ items: [] });
            }
          } else {
            set({ items: [] });
          }
        } catch (error: any) {
          console.error("Erreur lors du vidage du panier:", error.message);
          toast({
            title: "Erreur",
            description: "Impossible de vider le panier.",
            variant: "destructive"
          });
        }
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalCredits: () => {
        return get().items.reduce((total, item) => total + (item.jam.price_credits * item.quantity), 0);
      },
      
      syncWithDatabase: async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData?.session?.user;
          
          if (!user) return;
          
          const { data: cartData, error: cartError } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (cartError) {
            console.error("Erreur lors de la récupération du panier:", cartError.message);
            return;
          }
          
          if (!cartData) {
            set({ items: [] });
            return;
          }
          
          const { data: cartItemsData, error: itemsError } = await supabase
            .from('cart_items')
            .select(`
              quantity,
              jams!inner (
                id, name, description, price_credits, available_quantity, creator_id,
                weight_grams, allergens, ingredients, sugar_content, recipe, is_active,
                status, rejection_reason,
                created_at, updated_at,
                jam_images (id, url, is_primary, jam_id, created_at),
                profiles!inner (
                  id, username, full_name, avatar_url, bio, address, phone, website,
                  credits, role, created_at, updated_at
                )
              )
            `)
            .eq('cart_id', cartData.id);
          
          if (itemsError) {
            console.error("Erreur lors de la récupération des articles du panier:", itemsError.message);
            return;
          }
          
          // Convert to properly typed cart items
          const cartItems = cartItemsData?.map(item => {
            const jamData = item.jams;
            
            if (jamData && jamData.profiles) {
              // Add required address fields to profile
              const completeProfiles = {
                ...jamData.profiles,
                // Ensure all required ProfileType fields are present
                address_line1: jamData.profiles.address_line1 || jamData.profiles.address || '',
                address_line2: jamData.profiles.address_line2 || null,
                postal_code: jamData.profiles.postal_code || '',
                city: jamData.profiles.city || ''
              };
              
              return {
                jam: {
                  ...jamData,
                  profiles: completeProfiles
                } as JamType,
                quantity: item.quantity
              };
            }
            
            return {
              jam: jamData as JamType,
              quantity: item.quantity
            };
          }) || [];
          
          set({ items: cartItems });
        } catch (error: any) {
          console.error("Erreur lors de la synchronisation avec la base de données:", error.message);
        }
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalCredits: () => {
        return get().items.reduce((total, item) => total + (item.jam.price_credits * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

if (typeof window !== 'undefined') {
  setTimeout(() => {
    useCartStore.getState().syncWithDatabase();
  }, 1000);
}
