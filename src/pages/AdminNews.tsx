
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Newspaper,
  Plus,
  Search,
  Edit,
  Trash,
  MoreVertical,
  Eye,
  ArrowUpDown,
  Check,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type NewsItem = {
  id: string;
  title: string;
  summary?: string;
  content: string;
  cover_image_url?: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: 'draft' | 'published' | 'archived';
};

const AdminNews = () => {
  const navigate = useNavigate();
  const { isAdmin, isModerator, isLoading } = useUserRole();
  const { toast } = useToast();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Redirection si l'utilisateur n'est pas admin ou modérateur
  useEffect(() => {
    if (!isLoading && !isAdmin && !isModerator) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        variant: "destructive"
      });
    }
  }, [isAdmin, isModerator, navigate, isLoading, toast]);

  // Charger les actualités
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order(sortField, { ascending: sortOrder === 'asc' });

        if (error) {
          throw error;
        }

        setNewsItems(data || []);
      } catch (error: any) {
        console.error('Erreur lors du chargement des actualités:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les actualités",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && (isAdmin || isModerator)) {
      fetchNews();
    }
  }, [isLoading, isAdmin, isModerator, toast, sortField, sortOrder]);

  // Filtrer les actualités selon la recherche et le filtre actif
  const filteredNews = newsItems.filter(news => {
    // Filtre de recherche
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (news.summary && news.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filtre d'onglet
    const matchesTab = activeTab === 'all' || news.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Mise à jour de l'état local
      setNewsItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

      toast({
        title: "Statut mis à jour",
        description: `L'actualité a été ${newStatus === 'published' ? 'publiée' : newStatus === 'archived' ? 'archivée' : 'enregistrée comme brouillon'}.`,
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const handleFeaturedToggle = async (id: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ is_featured: !isFeatured })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Mise à jour de l'état local
      setNewsItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, is_featured: !isFeatured } : item
        )
      );

      toast({
        title: "Mise en avant modifiée",
        description: `L'actualité est maintenant ${!isFeatured ? 'mise en avant' : 'non mise en avant'}.`,
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la mise en avant:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la mise en avant",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Mise à jour de l'état local
      setNewsItems(prevItems => prevItems.filter(item => item.id !== id));

      toast({
        title: "Actualité supprimée",
        description: "L'actualité a été supprimée avec succès.",
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'actualité",
        variant: "destructive"
      });
    }
  };

  if (isLoading || (!isAdmin && !isModerator)) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Publié</Badge>;
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archivé</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Gestion des actualités</h1>
          <p className="text-muted-foreground mt-2">
            Créez, modifiez et gérez les actualités du site.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/news/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle actualité
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des actualités</CardTitle>
          <CardDescription>
            Gérez les actualités du site. Vous pouvez filtrer, modifier ou supprimer les actualités.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des actualités..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="published">Publiés</TabsTrigger>
                <TabsTrigger value="draft">Brouillons</TabsTrigger>
                <TabsTrigger value="archived">Archivés</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="text-center py-8">Chargement des actualités...</div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
              <p className="mt-4 text-muted-foreground">Aucune actualité trouvée</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button 
                        className="flex items-center w-full" 
                        onClick={() => handleSort('title')}
                      >
                        Titre
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </button>
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center w-full" 
                        onClick={() => handleSort('updated_at')}
                      >
                        Dernière modification
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNews.map((news) => (
                    <TableRow key={news.id}>
                      <TableCell>
                        <div className="font-medium">{news.title}</div>
                        {news.is_featured && (
                          <Badge className="bg-jam-raspberry mt-1">Mis en avant</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(news.status)}</TableCell>
                      <TableCell>
                        {format(new Date(news.updated_at), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/news/edit/${news.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/news/${news.id}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {news.status !== 'published' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(news.id, 'published')}>
                                <Check className="h-4 w-4 mr-2" />
                                Publier
                              </DropdownMenuItem>
                            )}
                            {news.status !== 'draft' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(news.id, 'draft')}>
                                <Edit className="h-4 w-4 mr-2" />
                                Mettre en brouillon
                              </DropdownMenuItem>
                            )}
                            {news.status !== 'archived' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(news.id, 'archived')}>
                                <X className="h-4 w-4 mr-2" />
                                Archiver
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleFeaturedToggle(news.id, news.is_featured)}>
                              {news.is_featured ? (
                                <>Retirer de la une</>
                              ) : (
                                <>Mettre à la une</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="flex w-full text-left text-destructive items-center px-2 py-1.5 text-sm">
                                    <Trash className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action est irréversible et supprimera définitivement cette actualité.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleDelete(news.id)}
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNews;
