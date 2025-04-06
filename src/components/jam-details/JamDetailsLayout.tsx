
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

type JamDetailsLayoutProps = {
  children: React.ReactNode;
};

export const JamDetailsLayout = ({ children }: JamDetailsLayoutProps) => {
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/explore">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Retour aux confitures
          </Link>
        </Button>
      </div>
      {children}
    </div>
  );
};
