
export interface CreditPackage {
  id: string;
  amount: number;
  price: number;
  popular: boolean;
  description: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  created_at: string;
  stripe_session_id?: string;
}

export const creditPackages: CreditPackage[] = [
  {
    id: 'credits-10',
    amount: 10,
    price: 5.99,
    popular: false,
    description: 'Pour goûter quelques confitures'
  },
  {
    id: 'credits-25',
    amount: 25,
    price: 12.99,
    popular: true,
    description: 'Notre offre la plus populaire'
  },
  {
    id: 'credits-50',
    amount: 50,
    price: 22.99,
    popular: false,
    description: 'Pour les amateurs de confitures'
  },
  {
    id: 'credits-100',
    amount: 100,
    price: 39.99,
    popular: false,
    description: 'Pour les passionnés'
  }
];
