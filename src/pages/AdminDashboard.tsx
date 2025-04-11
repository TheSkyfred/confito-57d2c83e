
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  ShoppingBag, 
  Users, 
  BookOpen, 
  Award, 
  Gift,
  Calendar, 
  Apple,
  Package,
  FileText,
  BadgeDollarSign,
} from 'lucide-react';

interface DashboardStat {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, isModerator } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, DashboardStat>>({});
  
  useEffect(() => {
    if (user && !isAdmin && !isModerator) {
      navigate('/dashboard');
      return;
    }
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        // Fetch counts from various tables
        const [
          { count: userCount },
          { count: jamCount },
          { count: salesCount },
          { count: ordersCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('jams').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ]);
        
        setStats({
          users: {
            title: 'Utilisateurs',
            value: userCount || 0,
            icon: <Users className="h-4 w-4" />,
          },
          jams: {
            title: 'Confitures',
            value: jamCount || 0,
            icon: <Gift className="h-4 w-4" />,
          },
          sales: {
            title: 'Ventes Livrées',
            value: salesCount || 0,
            icon: <ShoppingBag className="h-4 w-4" />,
          },
          orders: {
            title: 'Commandes En Attente',
            value: ordersCount || 0,
            icon: <Package className="h-4 w-4" />,
          },
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, isAdmin, isModerator, navigate]);
  
  const adminModules = [
    {
      title: 'Confitures',
      description: 'Gérer les confitures, validations et rejets',
      icon: <ShoppingBag className="h-10 w-10 text-primary" />,
      href: '/admin/jams',
      primary: true
    },
    {
      title: 'Conseils & Articles',
      description: 'Gérer les conseils, articles et produits associés',
      icon: <FileText className="h-10 w-10 text-primary" />,
      href: '/admin/conseils',
      primary: true
    },
    {
      title: 'Battles',
      description: 'Gérer les battles, participations et votes',
      icon: <Award className="h-10 w-10 text-primary" />,
      href: '/admin/battles'
    },
    {
      title: 'Recettes',
      description: 'Gérer les recettes, validations et rejets',
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      href: '/admin/recipes'
    },
    {
      title: 'Fruits de saison',
      description: 'Gérer le calendrier des fruits de saison',
      icon: <Apple className="h-10 w-10 text-primary" />,
      href: '/admin/seasonal-fruits'
    },
    {
      title: 'Publicités',
      description: 'Gérer les campagnes publicitaires',
      icon: <BadgeDollarSign className="h-10 w-10 text-primary" />,
      href: '/admin/ads'
    },
    {
      title: 'Utilisateurs',
      description: 'Gérer les utilisateurs et leurs rôles',
      icon: <Users className="h-10 w-10 text-primary" />,
      href: '/admin/users'
    },
    {
      title: 'Produits Associés',
      description: 'Rapport des produits associés et des clics',
      icon: <Package className="h-10 w-10 text-primary" />,
      href: '/admin/associatedproducts'
    }
  ];
  
  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Administration</h1>
        <div className="h-64 flex items-center justify-center">
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Administration</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(stats).map(([key, stat]) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="rounded-full bg-muted p-1">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                  {stat.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {adminModules.map((module, i) => (
          <Link to={module.href} key={i} className="block">
            <Card className={`h-full hover:shadow-md transition-shadow ${module.primary ? 'border-primary/20' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  {module.icon}
                  {module.primary && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Principal
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl mt-2">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Accéder</Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
