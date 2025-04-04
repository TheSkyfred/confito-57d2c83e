
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Bell, 
  User, 
  Menu, 
  Coffee,
  Heart,
  ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditBadge } from './ui/credit-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Header() {
  // Ces valeurs seraient normalement récupérées depuis un context d'authentification
  const isLoggedIn = false
  const userCredits = 25
  const userName = "Jamie"

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
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des confitures..."
              className="pl-8 bg-muted/50"
            />
          </div>
        </div>

        {/* Navigation et actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <CreditBadge amount={userCredits} className="mr-1" />
              
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Heart className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{userName[0]}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link to="/profile" className="flex items-center">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/my-jams" className="flex items-center">Mes confitures</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/orders" className="flex items-center">Mes échanges</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/credits" className="flex items-center">Acheter des crédits</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/settings" className="flex items-center">Paramètres</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Se déconnecter</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                <Link to="/login">Se connecter</Link>
              </Button>
              <Button size="sm" className="bg-jam-raspberry hover:bg-jam-raspberry/90" asChild>
                <Link to="/register">S'inscrire</Link>
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
              <DropdownMenuItem className="md:hidden">
                <Link to="/search" className="flex items-center">Rechercher</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/explore" className="flex items-center">Explorer</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/battles" className="flex items-center">Battles de confitures</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/seasonal" className="flex items-center">Fruits de saison</Link>
              </DropdownMenuItem>
              {isLoggedIn && (
                <>
                  <DropdownMenuItem>
                    <Link to="/profile" className="flex items-center">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/my-jams" className="flex items-center">Mes confitures</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Se déconnecter</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
