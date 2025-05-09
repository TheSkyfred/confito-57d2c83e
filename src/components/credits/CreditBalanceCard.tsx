
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditBadge } from '@/components/ui/credit-badge';
import { ProfileType } from '@/types/supabase';

interface CreditBalanceCardProps {
  profile: ProfileType | null;
  isLoading: boolean;
}

export const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({
  profile,
  isLoading
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Votre solde</CardTitle>
        <CardDescription>
          Crédits disponibles sur votre compte
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
        ) : (
          <CreditBadge amount={profile?.credits || 0} size="xlarge" />
        )}
      </CardContent>
    </Card>
  );
};
