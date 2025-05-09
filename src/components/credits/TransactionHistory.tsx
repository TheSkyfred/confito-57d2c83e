
import React from 'react';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreditTransaction } from '@/types/credits';

interface TransactionHistoryProps {
  transactions: CreditTransaction[] | null;
  isLoading: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry" />
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Vous n'avez pas encore effectué de transactions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
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
  );
};
