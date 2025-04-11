import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  BookOpen,
  CalendarDays,
  GaugeCircle,
  Trophy,
  Users,
  ShoppingCart,
  Megaphone,
  Calendar,
  Medal,
  MessageCircle,
  FileText,
  Leaf
} from 'lucide-react';

const AdminDashboard = () => {
  const { isAdmin, isModerator, isLoading, role } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (!isLoading && !isAdmin && !isModerator) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        variant: "destructive",
      });
    }
  }, [isAdmin, isModerator, navigate, isLoading, toast]);
  
  if (isLoading || (!isAdmin && !isModerator)) {
    return null;
  }
  
  const adminModules = [
    {
      title: "Confitures",
      icon: <GaugeCircle className="h-5 w-5 mr-2" />,
      description: "Gérer les confitures et modérer le contenu utilisateur",
      link: "/admin/jams",
    },
    {
      title: "Combats de confitures",
      icon: <Trophy className="h-5 w-5 mr-2" />,
      description: "Créer et gérer les tournois de confitures",
      link: "/admin/battles",
    },
    {
      title: "Recettes",
      icon: <BookOpen className="h-5 w-5 mr-2" />,
      description: "Gérer les recettes de confitures",
      link: "/admin/recipes",
    },
    {
      title: "Fruits saisonniers",
      icon: <Leaf className="h-5 w-5 mr-2" />,
      description: "Gérer le calendrier des fruits de saison",
      link: "/admin/fruits",
      new: true,
    },
    {
      title: "Conseils",
      icon: <MessageCircle className="h-5 w-5 mr-2" />,
      description: "Gérer les articles de conseils",
      link: "/admin/conseils",
    },
    {
      title: "Publicités",
      icon: <Megaphone className="h-5 w-5 mr-2" />,
      description: "Gérer les campagnes publicitaires",
      link: "/admin/ads",
    },
    {
      title: "Utilisateurs",
      icon: <Users className="h-5 w-5 mr-2" />,
      description: "Gérer les comptes utilisateurs",
      link: "/admin/users",
    },
    {
      title: "Commandes",
      icon: <ShoppingCart className="h-5 w-5 mr-2" />,
      description: "Voir et gérer les commandes",
      link: "/admin/orders",
    },
  ];
  
  const statCards = [
    {
      title: "Utilisateurs actifs",
      value: "234",
      change: "+12%",
      positive: true,
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Confitures publiées",
      value: "187",
      change: "+24%",
      positive: true,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: "Commandes du mois",
      value: "28",
      change: "-4%",
      positive: false,
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      title: "Recettes ajoutées",
      value: "45",
      change: "+8%",
      positive: true,
      icon: <FileText className="h-4 w-4" />,
    },
  ];
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue dans l'interface d'administration.
          </p>
        </div>
        <div className="flex items-center">
          <Badge className="bg-jam-raspberry text-white mr-2">
            {role === 'admin' ? 'Administrateur' : 'Modérateur'}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <span className="bg-primary/10 text-primary p-1 rounded-full">
                  {stat.icon}
                </span>
              </div>
              <div className="flex items-end mt-2">
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <span className={`text-xs ml-2 mb-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-medium mb-4">Modules d'administration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                {module.icon}
                {module.title}
                {module.new && (
                  <span className="ml-2 bg-jam-raspberry text-white text-xs px-2 py-0.5 rounded-full">
                    Nouveau
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <Link to={module.link}>
                <Button variant="ghost" className="w-full justify-start">
                  Accéder
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12">
        <h2 className="text-xl font-medium mb-4">Calendrier des événements</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Événements à venir
            </CardTitle>
            <CardDescription>
              Prochains événements et échéances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-md mr-3">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Lancement du nouveau concours</p>
                  <p className="text-sm text-muted-foreground">15 juin 2023</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-md mr-3">
                  <Medal className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Annonce des résultats du concours été</p>
                  <p className="text-sm text-muted-foreground">30 juin 2023</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
