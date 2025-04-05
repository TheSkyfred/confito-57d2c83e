
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Swords, 
  Calendar, 
  Trophy, 
  User, 
  Settings, 
  CreditCard, 
  LogIn, 
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur lors de la déconnexion",
        description: error.message || "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-background border-b">
      <nav className="flex flex-col space-y-4 p-4">
        <NavItemMobile to="/" label="Accueil" icon={Home} onClick={onClose} />
        <NavItemMobile to="/explore" label="Explorer" icon={Search} onClick={onClose} />
        <NavItemMobile to="/battles" label="Battles" icon={Swords} onClick={onClose} />
        <NavItemMobile to="/seasonal" label="Saisonnier" icon={Calendar} onClick={onClose} />
        <NavItemMobile to="/rankings" label="Classement" icon={Trophy} onClick={onClose} />
        
        {user ? (
          <>
            <NavItemMobile to="/dashboard" label="Tableau de bord" icon={User} onClick={onClose} />
            <NavItemMobile to="/profile" label="Profil" icon={Settings} onClick={onClose} />
            <NavItemMobile to="/credits" label="Crédits" icon={CreditCard} onClick={onClose} />
            <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </>
        ) : (
          <>
            <NavItemMobile to="/auth" label="Se connecter" icon={LogIn} onClick={onClose} />
            <Button variant="default" className="justify-start" asChild>
              <Link to="/auth" onClick={onClose}>
                S'inscrire
              </Link>
            </Button>
          </>
        )}
      </nav>
    </div>
  );
};

interface NavItemMobileProps {
  to: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
}

const NavItemMobile: React.FC<NavItemMobileProps> = ({ to, label, icon, onClick }) => (
  <Button variant="ghost" className="justify-start" asChild>
    <Link to={to} onClick={onClick} className="w-full">
      <div className="flex items-center">
        {React.createElement(icon, { className: 'mr-2 h-4 w-4' })}
        <span>{label}</span>
      </div>
    </Link>
  </Button>
);

export default MobileMenu;
