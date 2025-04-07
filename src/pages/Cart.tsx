
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/useCartStore';
import { Trash2, ShoppingBag, MinusCircle, PlusCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, getTotalCredits } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Synchroniser le panier avec la base de données au chargement de la page
  useEffect(() => {
    useCartStore.getState().syncWithDatabase();
  }, []);
  
  const handleQuantityChange = (jamId: string, newQuantity: number, maxQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }
    
    if (newQuantity > maxQuantity) {
      toast({
        title: "Quantité limitée",
        description: `Il ne reste que ${maxQuantity} exemplaires disponibles.`,
        variant: "destructive"
      });
      updateQuantity(jamId, maxQuantity);
      return;
    }
    
    updateQuantity(jamId, newQuantity);
  };
  
  const handleProceedToCheckout = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour finaliser votre commande.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/checkout");
    }, 800);
  };
  
  if (items.length === 0) {
    return (
      <div className="container max-w-4xl py-16">
        <h1 className="text-3xl font-bold mb-6">Mon Panier</h1>
        <div className="bg-background rounded-lg border shadow-sm p-8 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/60 mb-4" />
          <h2 className="text-xl font-medium mb-2">Votre panier est vide</h2>
          <p className="text-muted-foreground mb-6">Découvrez nos délicieuses confitures et ajoutez-les à votre panier.</p>
          <Button onClick={() => navigate("/explore")}>
            Explorer les confitures
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl py-16">
      <h1 className="text-3xl font-bold mb-6">Mon Panier</h1>
      
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.jam.id} className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-md">
              <img 
                src={item.jam.jam_images?.[0]?.url || '/placeholder.svg'} 
                alt={item.jam.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-grow">
              <h3 className="font-medium">{item.jam.name}</h3>
              <div className="flex items-center mt-1">
                <ProfileDisplay 
                  profile={item.jam.profiles} 
                  size="sm" 
                  showName={true}
                />
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className="text-jam-raspberry">
                  {item.jam.price_credits} crédits
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleQuantityChange(item.jam.id, item.quantity - 1, item.jam.available_quantity)}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              
              <Input
                type="number"
                min="1" 
                max={item.jam.available_quantity}
                value={item.quantity}
                onChange={(e) => handleQuantityChange(
                  item.jam.id, 
                  parseInt(e.target.value) || 1,
                  item.jam.available_quantity
                )}
                className="w-16 text-center"
              />
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleQuantityChange(
                  item.jam.id, 
                  item.quantity + 1,
                  item.jam.available_quantity
                )}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="font-medium text-right min-w-[80px]">
                {item.jam.price_credits * item.quantity} crédits
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeItem(item.jam.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-card p-6 rounded-lg border shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Total</span>
          <span className="font-bold text-xl">{getTotalCredits()} crédits</span>
        </div>
        
        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={() => clearCart()}>
            Vider le panier
          </Button>
          
          <Button 
            onClick={handleProceedToCheckout}
            disabled={isProcessing}
            className="gap-2"
          >
            Valider mon panier
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
