import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Menu, 
  X, 
  User, 
  LogIn, 
  LogOut, 
  Settings, 
  PlusCircle, 
  Heart,
  MessageSquare,
  Calendar,
  Trophy,
  Swords,
  CreditCard,
  Bell,
  Home,
  Search,
  ShoppingBag,
  Shield,
  Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { useCartStore } from '@/stores/useCartStore';

const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const totalCartItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 50;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    useCartStore.getState().syncWithDatabase();
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur lors de la déconnexion",
        description: error.message || "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  const isCurrentPage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={`
      sticky top-0 z-40 w-full transition-colors duration-300
      ${isScrolled ? 'bg-background/95 backdrop-blur-sm' : 'bg-transparent'}
    `}>
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center font-bold text-xl md:text-2xl font-serif">
          <img src="/logo-confito.png" alt="Confito Logo" className="h-8 w-8 mr-2" />
          Confito
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          className="md:hidden"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        <nav className="hidden md:flex space-x-6">
          <NavItem to="/" label="Accueil" icon={Home} isCurrent={isCurrentPage('/')} />
          <NavItem to="/explore" label="Explorer" icon={Search} isCurrent={isCurrentPage('/explore')} />
          <NavItem to="/battles" label="Battles" icon={Swords} isCurrent={isCurrentPage('/battles')} />
          <NavItem to="/seasonal" label="Saisonnier" icon={Calendar} isCurrent={isCurrentPage('/seasonal')} />
          <NavItem to="/rankings" label="Classement" icon={Trophy} isCurrent={isCurrentPage('/rankings')} />
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <ProfileDisplay 
                    profile={user.user_metadata} 
                    showName={false} 
                    showCartBadge={true}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" onClick={closeMenu}>
                    <User className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cart" onClick={closeMenu}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Mon panier
                    {totalCartItems > 0 && (
                      <span className="ml-auto bg-jam-raspberry text-white text-xs rounded-full px-1.5 py-0.5">
                        {totalCartItems}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" onClick={closeMenu}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/credits" onClick={closeMenu}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Crédits
                  </Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" onClick={closeMenu}>
                        <Shield className="mr-2 h-4 w-4" />
                        Administration
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/ads">
                        <Layout className="mr-2 h-4 w-4" />
                        Gestion des publicités
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </Link>
              </Button>
              <Button asChild>
                <Link to="/auth">
                  S'inscrire
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <nav className="flex flex-col space-y-4 p-4">
            <NavItemMobile to="/" label="Accueil" icon={Home} onClick={closeMenu} />
            <NavItemMobile to="/explore" label="Explorer" icon={Search} onClick={closeMenu} />
            <NavItemMobile to="/battles" label="Battles" icon={Swords} onClick={closeMenu} />
            <NavItemMobile to="/seasonal" label="Saisonnier" icon={Calendar} onClick={closeMenu} />
            <NavItemMobile to="/rankings" label="Classement" icon={Trophy} onClick={closeMenu} />
            
            {user ? (
              <>
                <NavItemMobile to="/dashboard" label="Tableau de bord" icon={User} onClick={closeMenu} />
                <NavItemMobile 
                  to="/cart" 
                  label={`Mon panier${totalCartItems > 0 ? ` (${totalCartItems})` : ''}`} 
                  icon={ShoppingBag} 
                  onClick={closeMenu} 
                />
                <NavItemMobile to="/profile" label="Profil" icon={Settings} onClick={closeMenu} />
                <NavItemMobile to="/credits" label="Crédits" icon={CreditCard} onClick={closeMenu} />
                
                {isAdmin && (
                  <NavItemMobile to="/admin" label="Administration" icon={Shield} onClick={closeMenu} />
                )}
                
                <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </Button>
              </>
            ) : (
              <>
                <NavItemMobile to="/auth" label="Se connecter" icon={LogIn} onClick={closeMenu} />
                <Button variant="default" className="justify-start" asChild>
                  <Link to="/auth" onClick={closeMenu}>
                    S'inscrire
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ComponentType<any>;
  isCurrent: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, isCurrent }) => (
  <Link
    to={to}
    className={`
      flex items-center text-sm font-medium transition-colors
      ${isCurrent ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
    `}
  >
    {React.createElement(icon, { className: 'mr-2 h-4 w-4' })}
    {label}
  </Link>
);

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

export default Header;
