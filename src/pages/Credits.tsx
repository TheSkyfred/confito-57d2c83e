
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CreditCard,
  DollarSign,
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ProfileType, CreditTransactionType } from '@/types/supabase';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CreditBadge } from '@/components/ui/credit-badge';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const creditPackages = [
  {
    id: 'credits-10',
    amount: 10,
    price: 5.99,
    popular: false,
    description: 'Pour goûter quelques confitures',
    stripeProductId: 'prod_SHKlMY5fad4jpJ',
    stripePriceId: 'price_1RMm60QKGqePiKGPrw7IHreC'
  },
  {
    id: 'credits-25',
    amount: 25,
    price: 12.99,
    popular: true,
    description: 'Notre offre la plus populaire',
    stripeProductId: 'prod_SHKjhWMkbrnn4w',
    stripePriceId: 'price_1RMm60QKGqePiKGPrw7IHreC'
  },
  {
    id: 'credits-50',
    amount: 50,
    price: 22.99,
    popular: false,
    description: 'Pour les amateurs de confitures',
    stripeProductId: 'prod_SHKmJPb3URoR5j',
    stripePriceId: 'price_1RMm6oQKGqePiKGPEO9BC9nr'
  },
  {
    id: 'credits-100',
    amount: 100,
    price: 39.99,
    popular: false,
    description: 'Pour les passionnés',
    stripeProductId: 'prod_SHKmsUaZugXmoD',
    stripePriceId: 'price_1RMm7NQKGqePiKGPNFj02Pbx'
  }
];

const Credits = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(creditPackages[1].id);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch user profile
  const { data: profile, isLoading: loadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  // Fetch credit transactions
  const { data: transactions, isLoading: loadingTransactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['creditTransactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Connectez-vous",
        description: "Veuillez vous connecter pour acheter des crédits",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    const selectedPkg = creditPackages.find(pkg => pkg.id === selectedPackage);
    if (!selectedPkg) return;
    
    setIsProcessing(true);
    
    try {
      // Call the Stripe checkout function with error handling
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          packageId: selectedPackage,
          priceId: selectedPkg.stripePriceId,
          productId: selectedPkg.stripeProductId
        }
      });
      
      if (error) {
        console.error("Error calling create-checkout function:", error);
        throw new Error(`Erreur lors de la création du checkout: ${error.message}`);
      }
      
      if (!data || !data.url) {
        throw new Error("Aucune URL de paiement n'a été retournée");
      }
      
      console.log("Redirecting to Stripe checkout:", data.url);
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Erreur lors de l'achat",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors du traitement de votre paiement",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl mb-4">Connectez-vous pour acheter des crédits</h2>
            <Button asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <CreditCard className="h-8 w-8 text-jam-raspberry" />
        <h1 className="font-serif text-3xl font-bold">Crédits & Paiements</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Acheter des crédits</CardTitle>
              <CardDescription>
                Les crédits vous permettent d'échanger des confitures avec d'autres membres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creditPackages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className={`
                      relative border rounded-lg p-4 cursor-pointer transition-all
                      ${selectedPackage === pkg.id 
                        ? 'border-jam-raspberry bg-jam-raspberry/5' 
                        : 'hover:border-muted-foreground'}
                    `}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 -right-2">
                        <span className="bg-jam-raspberry text-white text-xs py-1 px-3 rounded-full">
                          Populaire
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-medium">{pkg.amount} crédits</p>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      </div>
                      <p className="text-xl font-bold">{pkg.price.toFixed(2)}€</p>
                    </div>
                    
                    {selectedPackage === pkg.id && (
                      <div className="absolute bottom-2 right-2">
                        <Check className="h-5 w-5 text-jam-raspberry" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto bg-jam-raspberry hover:bg-jam-raspberry/90"
                  onClick={handlePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Acheter maintenant
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique des transactions</CardTitle>
              <CardDescription>
                Historique de vos achats et échanges de crédits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Vous n'avez pas encore effectué de transactions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'dd MMMM yyyy HH:mm', { locale: fr })}
                        </p>
                      </div>
                      <div className={`text-lg font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} crédits
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Votre solde</CardTitle>
              <CardDescription>
                Crédits disponibles sur votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {loadingProfile ? (
                <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
              ) : (
                <CreditBadge amount={profile?.credits || 0} size="xlarge" />
              )}
            </CardContent>
          </Card>

          <Card className="bg-muted/40">
            <CardHeader>
              <CardTitle>Comment ça marche ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-jam-raspberry/10 p-2 rounded-full">
                  <ShoppingBag className="h-5 w-5 text-jam-raspberry" />
                </div>
                <div>
                  <p className="font-medium">Achetez des crédits</p>
                  <p className="text-sm text-muted-foreground">
                    Choisissez un pack adapté à vos besoins
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-jam-raspberry/10 p-2 rounded-full">
                  <ArrowRight className="h-5 w-5 text-jam-raspberry" />
                </div>
                <div>
                  <p className="font-medium">Échangez des confitures</p>
                  <p className="text-sm text-muted-foreground">
                    Utilisez vos crédits pour commander des confitures
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-jam-raspberry/10 p-2 rounded-full">
                  <RefreshCw className="h-5 w-5 text-jam-raspberry" />
                </div>
                <div>
                  <p className="font-medium">Gagnez des crédits</p>
                  <p className="text-sm text-muted-foreground">
                    Vendez vos confitures pour gagner des crédits
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-1" />
                <p className="text-sm text-muted-foreground">
                  Les crédits achetés ne sont pas remboursables et sont uniquement utilisables sur Confito.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Credits;
