
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Swords, Calendar, Trophy } from 'lucide-react';

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

const DesktopNavigation: React.FC = () => {
  const location = useLocation();
  
  const isCurrentPage = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="hidden md:flex space-x-6">
      <NavItem to="/" label="Accueil" icon={Home} isCurrent={isCurrentPage('/')} />
      <NavItem to="/explore" label="Explorer" icon={Search} isCurrent={isCurrentPage('/explore')} />
      <NavItem to="/battles" label="Battles" icon={Swords} isCurrent={isCurrentPage('/battles')} />
      <NavItem to="/seasonal" label="Saisonnier" icon={Calendar} isCurrent={isCurrentPage('/seasonal')} />
      <NavItem to="/rankings" label="Classement" icon={Trophy} isCurrent={isCurrentPage('/rankings')} />
    </nav>
  );
};

export default DesktopNavigation;
