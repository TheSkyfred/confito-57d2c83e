import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JamType } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  jam: JamType;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (jam: JamType, quantity?: number) => Promise<void>;
  removeItem: (jamId: string) => Promise<void>;
  updateQuantity: (jamId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalCredits: () => number;
  syncWithDatabase: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: async (jam, quantity = 1) => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData?.session?.user;
          
          if (user) {
            // Utilisateur connecté - utiliser la base de données
            // Vérifier si un panier existe déjà pour cet utilisateur
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
              // Créer un nouveau panier si aucun n'existe
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
            
            // Vérifier si l'article existe déjà dans le panier
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
              // Mettre à jour la quantité si l'article existe
              const newQuantity = Math.min(
                existingItems.quantity + quantity,
                jam.available_quantity
              );
              
              const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', existingItems.id);
              
              if (updateError) {
                // Si l'erreur est liée à la disponibilité du stock
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
              // Ajouter un nouvel article si n'existe pas
              const { error: insertError } = await supabase
                .from('cart_items')
                .insert({
                  cart_id: cartId,
                  jam_id: jam.id,
                  quantity: Math.min(quantity, jam.available_quantity)
                });
              
              if (insertError) {
                // Si l'erreur est liée à la disponibilité du stock
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
            
            // Synchroniser le store local avec la base de données
            await get().syncWithDatabase();
          } else {
            // Utilisateur non connecté - utiliser le stockage local
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
            // Utilisateur connecté - utiliser la base de données
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
              
              // Synchroniser le store local avec la base de données
              await get().syncWithDatabase();
            }
          } else {
            // Utilisateur non connecté - utiliser le stockage local
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
            // Utilisateur connecté - utiliser la base de données
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
                  // Si l'erreur est liée à la disponibilité du stock
                  if (error.message.includes('Quantité demandée')) {
                    // Trouver la confiture dans le store local pour afficher la quantité max disponible
                    const jam = get().items.find(item => item.jam.id === jamId)?.jam;
                    toast({
                      title: "Quantité limitée",
                      description: `Il ne reste que ${jam?.available_quantity} exemplaires disponibles.`,
                      variant: "destructive"
                    });
                    
                    if (jam) {
                      // Mettre à jour avec la quantité max disponible
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
            // Utilisateur non connecté - utiliser le stockage local
            set((state) => {
              const jam = state.items.find(item => item.jam.id === jamId)?.jam;
              
              if (!jam) return state;
              
              if (quantity > jam.available_quantity) {
                toast({
                  title: "Quantité limitée",
                  description: `Il ne reste que ${jam.available_quantity} exemplaires disponibles.`,
                  variant: "destructive"
                });
              }
              
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
            // Utilisateur connecté - utiliser la base de données
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
              
              // Synchroniser le store local avec la base de données
              set({ items: [] });
            }
          } else {
            // Utilisateur non connecté - utiliser le stockage local
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
          
          // Récupérer le panier de l'utilisateur
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
          
          // Récupérer les articles du panier avec les détails des confitures
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
                  credits, role, created_at, updated_at, is_active
                )
              )
            `)
            .eq('cart_id', cartData.id);
          
          if (itemsError) {
            console.error("Erreur lors de la récupération des articles du panier:", itemsError.message);
            return;
          }
          
          // Transformer les données pour correspondre à la structure CartItem
          if (cartItemsData) {
            const formattedItems: CartItem[] = cartItemsData.map(item => ({
              jam: {
                ...item.jams,
                profiles: item.jams.profiles,
                jam_images: item.jams.jam_images || [],
                status: (item.jams.status || 'pending') as 'pending' | 'approved' | 'rejected'
              },
              quantity: item.quantity
            })) as CartItem[];
            
            set({ items: formattedItems });
          }
        } catch (error: any) {
          console.error("Erreur lors de la synchronisation avec la base de données:", error.message);
        }
      }
    }),
    {
      name: 'jam-cart-storage'
    }
  )
);

// Synchroniser le panier au chargement de l'application
if (typeof window !== 'undefined') {
  // S'assurer que le code s'exécute uniquement dans le navigateur
  setTimeout(() => {
    useCartStore.getState().syncWithDatabase();
  }, 1000);
}
