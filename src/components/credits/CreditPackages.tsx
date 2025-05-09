
import React from 'react';
import { Check } from 'lucide-react';
import { CreditPackage } from '@/types/credits';

interface CreditPackagesProps {
  creditPackages: CreditPackage[];
  selectedPackage: string;
  setSelectedPackage: (id: string) => void;
}

export const CreditPackages: React.FC<CreditPackagesProps> = ({
  creditPackages,
  selectedPackage,
  setSelectedPackage
}) => {
  return (
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
  );
};
