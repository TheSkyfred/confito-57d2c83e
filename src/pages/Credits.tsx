
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

import { CreditPackages } from '@/components/credits/CreditPackages';
import { TransactionHistory } from '@/components/credits/TransactionHistory';
import { HowItWorks } from '@/components/credits/HowItWorks';
import { CreditBalanceCard } from '@/components/credits/CreditBalanceCard';
import { useCredits } from '@/hooks/useCredits';
import { creditPackages } from '@/types/credits';

const Credits = () => {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(creditPackages[1].id);
  const { isProcessing, error, handlePurchase } = useCredits();
  
  // Fetch user profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
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
  const { data: transactions, isLoading: loadingTransactions } = useQuery({
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
              <CreditPackages 
                creditPackages={creditPackages} 
                selectedPackage={selectedPackage} 
                setSelectedPackage={setSelectedPackage} 
              />
              
              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <p className="text-destructive font-medium">Erreur</p>
                  </div>
                  <p className="mt-1 text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <div className="flex justify-center mt-8">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto bg-jam-raspberry hover:bg-jam-raspberry/90"
                  onClick={() => handlePurchase(selectedPackage)}
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
              <TransactionHistory 
                transactions={transactions} 
                isLoading={loadingTransactions} 
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <CreditBalanceCard 
            profile={profile} 
            isLoading={loadingProfile} 
          />

          <HowItWorks />
        </div>
      </div>
    </div>
  );
};

export default Credits;
