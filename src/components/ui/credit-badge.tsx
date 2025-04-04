
import React from 'react';
import { CreditCard } from 'lucide-react';

interface CreditBadgeProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xlarge' | 'large';
}

export const CreditBadge: React.FC<CreditBadgeProps> = ({ 
  amount, 
  size = 'md'
}) => {
  // Size classes mapping
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
    large: 'text-lg px-4 py-2',
    xlarge: 'text-xl px-5 py-3',
  };
  
  const iconSizes = {
    sm: 'h-3 w-3 mr-1',
    md: 'h-4 w-4 mr-1.5',
    lg: 'h-5 w-5 mr-2',
    large: 'h-6 w-6 mr-3',
    xlarge: 'h-7 w-7 mr-3',
  };
  
  return (
    <div className={`inline-flex items-center justify-center font-medium rounded-full bg-jam-raspberry/10 text-jam-raspberry ${sizeClasses[size]}`}>
      <CreditCard className={iconSizes[size]} />
      <span>{amount}</span>
    </div>
  );
};
