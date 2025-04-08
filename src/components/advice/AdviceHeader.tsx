
import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';

interface AdviceHeaderProps {
  user: any;
}

const AdviceHeader: React.FC<AdviceHeaderProps> = ({ user }) => {
  const { isAdmin, isModerator } = useUserRole();
  const canCreateAdvice = user && (isAdmin || isModerator);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-serif font-bold">Conseils de confitures</h1>
        <p className="text-muted-foreground">
          Découvrez des astuces et conseils pour réaliser vos confitures maison
        </p>
      </div>
      
      {canCreateAdvice && (
        <Button asChild>
          <Link to="/conseils/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer un conseil
          </Link>
        </Button>
      )}
    </div>
  );
};

export default AdviceHeader;
