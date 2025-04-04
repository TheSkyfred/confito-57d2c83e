
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Bell, 
  User, 
  Menu, 
  Coffee,
  Heart,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Award,
  Swords,
  CalendarDays,
  ShoppingCart,
  CreditCard,
  ShieldAlert
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { CreditBadge } from './ui/credit-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

export default function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo et titre */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-jam-raspberry" />
            <span className="font-serif text-xl font-bold text-jam-dark hidden sm:inline-block">
              Jam-<span className="text-jam-raspberry">Jar</span> Jamboree
            </span>
            <span className="font-serif text-xl font-bold text-jam-dark sm:hidden">
              J<span className="text-jam-raspberry">J</span>J
            </span>
          </Link>
        </div>

        {/* Recherche - visible uniquement sur desktop */}
        <div className="hidden md:flex max-w-sm flex-1 mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des confitures..."
              className="pl-8 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Navigation et actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:flex">
                  <Button variant="ghost" size="sm">Explorer</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem asChild>
                    <Link to="/explore" className="w-full">Toutes les confitures</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/seasonal" className="w-full">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Fruits de saison
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/battles" className="w-full">
                      <Swords className="mr-2 h-4 w-4" />
                      Battles de confitures
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/rankings" className="w-full">
                      <Award className="mr-2 h-4 w-4" />
                      Classements
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link to="/credits" className="hidden md:flex">
                <CreditBadge amount={25} className="mr-1" />
              </Link>
              
              <Button variant="ghost" size="icon" className="text-muted-foreground hidden md:flex">
                <Link to="/dashboard">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button variant="ghost" size="icon" className="text-muted-foreground hidden md:flex">
                <Bell className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
                      <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/myjams" className="flex items-center">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Mes confitures
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Mes commandes
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/credits" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Acheter des crédits
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Admin section if applicable */}
                  {user?.user_metadata?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                <Link to="/auth">Se connecter</Link>
              </Button>
              <Button size="sm" className="bg-jam-raspberry hover:bg-jam-raspberry/90" asChild>
                <Link to="/auth?signup=true">S'inscrire</Link>
              </Button>
            </>
          )}

          {/* Menu mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem asChild>
                <Link to="/explore" className="flex items-center">Explorer</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/seasonal" className="flex items-center">Fruits de saison</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/battles" className="flex items-center">Battles de confitures</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/rankings" className="flex items-center">Classements</Link>
              </DropdownMenuItem>
              
              {user ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">Tableau de bord</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/myjams" className="flex items-center">Mes confitures</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center">Mes commandes</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/credits" className="flex items-center">Crédits</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Se déconnecter</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="flex items-center">Se connecter</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth?signup=true" className="flex items-center">S'inscrire</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
