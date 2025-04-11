
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Download,
  Calendar, 
  ExternalLink,
  ChevronDown,
  BarChart
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AdviceProduct } from '@/types/advice';

interface ProductReportItem {
  id: string;
  name: string;
  article: string;
  article_title?: string;
  clicks: number;
  article_id: string;
  product_id: string;
  is_sponsored: boolean;
  image_url?: string;
  external_url?: string;
  last_click?: string;
  promo_code?: string;
  timestamp?: string;
  created_at: string;
}

const AdminAssociatedProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  
  const [isLoading, setIsLoading] = useState(true);
  const [clicks, setClicks] = useState<ProductReportItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState('clicks');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterSponsored, setFilterSponsored] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isAdmin && !isModerator) {
      navigate('/admin');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour cette page",
        variant: "destructive"
      });
    } else if (!user) {
      navigate('/auth');
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder à cette page",
        variant: "destructive"
      });
    } else {
      fetchClicksData();
    }
  }, [timeRange, user, isAdmin, isModerator, navigate]);

  const fetchClicksData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch products with click data directly from advice_products table
      const { data: productsData, error } = await supabase
        .from('advice_products')
        .select(`
          id,
          name,
          description,
          external_url,
          image_url,
          is_sponsored,
          click_count,
          article_id,
          created_at,
          updated_at,
          advice_articles:article_id (title, id)
        `);

      if (error) {
        console.error("Error fetching click data:", error);
        setError("Failed to fetch product click data");
        return;
      }

      const formattedClicks = (productsData || []).map((product) => {
        return {
          id: product.id,
          name: product.name, 
          article: product.advice_articles ? product.advice_articles.title : 'N/A',
          clicks: product.click_count || 0,
          article_id: product.article_id || '',
          product_id: product.id,
          is_sponsored: product.is_sponsored || false,
          image_url: product.image_url,
          external_url: product.external_url,
          promo_code: null, // This field doesn't exist, so set to null
          timestamp: product.created_at,
          created_at: product.created_at
        };
      });

      setClicks(formattedClicks);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredProducts = clicks
    .filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.article.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSponsored = 
        filterSponsored === 'all' || 
        (filterSponsored === 'sponsored' && product.is_sponsored) ||
        (filterSponsored === 'regular' && !product.is_sponsored);
        
      return matchesSearch && matchesSponsored;
    })
    .sort((a, b) => {
      if (sortBy === 'clicks') {
        return sortOrder === 'desc' ? b.clicks - a.clicks : a.clicks - b.clicks;
      } else if (sortBy === 'name') {
        return sortOrder === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name);
      } else if (sortBy === 'article') {
        return sortOrder === 'desc' 
          ? b.article.localeCompare(a.article) 
          : a.article.localeCompare(b.article);
      } else if (sortBy === 'last_click') {
        if (!a.timestamp) return sortOrder === 'desc' ? 1 : -1;
        if (!b.timestamp) return sortOrder === 'desc' ? -1 : 1;
        return sortOrder === 'desc' 
          ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return 0;
    });
    
  const exportToCSV = () => {
    const headers = ['Nom', 'Conseil', 'Clics', 'Sponsorisé', 'URL Externe'];
    const rows = filteredProducts.map(product => [
      product.name,
      product.article,
      product.clicks,
      product.is_sponsored ? 'Oui' : 'Non',
      product.external_url || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `produits-associes-rapport-${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Produits Associés - Rapport</h1>
        </div>
        
        <Button onClick={exportToCSV} variant="outline" className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>
      
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Vue d'ensemble</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-md p-4">
                <h3 className="text-sm text-blue-600 font-medium">Total Produits</h3>
                <p className="text-2xl font-bold">{clicks.length}</p>
              </div>
              <div className="bg-green-50 rounded-md p-4">
                <h3 className="text-sm text-green-600 font-medium">Total Clics</h3>
                <p className="text-2xl font-bold">{clicks.reduce((sum, product) => sum + product.clicks, 0)}</p>
              </div>
              <div className="bg-amber-50 rounded-md p-4">
                <h3 className="text-sm text-amber-600 font-medium">Produits Sponsorisés</h3>
                <p className="text-2xl font-bold">{clicks.filter(p => p.is_sponsored).length}</p>
              </div>
              <div className="bg-purple-50 rounded-md p-4">
                <h3 className="text-sm text-purple-600 font-medium">Clics Sponsorisés</h3>
                <p className="text-2xl font-bold">
                  {clicks
                    .filter(p => p.is_sponsored)
                    .reduce((sum, product) => sum + product.clicks, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle>Liste des produits associés</CardTitle>
            
            <div className="flex flex-col md:flex-row gap-3">
              <div className="grid grid-cols-2 md:flex gap-3">
                <Select 
                  value={timeRange} 
                  onValueChange={(value) => setTimeRange(value)}
                >
                  <SelectTrigger className="w-full md:w-[150px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tout</SelectItem>
                    <SelectItem value="7d">7 derniers jours</SelectItem>
                    <SelectItem value="30d">30 derniers jours</SelectItem>
                    <SelectItem value="90d">90 derniers jours</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={filterSponsored} 
                  onValueChange={(value) => setFilterSponsored(value)}
                >
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Sponsorisé" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="sponsored">Sponsorisés</SelectItem>
                    <SelectItem value="regular">Non sponsorisés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Input 
                placeholder="Rechercher un produit..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun produit trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Conseil</TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center" 
                        onClick={() => {
                          setSortBy('clicks');
                          setSortOrder(sortOrder === 'desc' && sortBy === 'clicks' ? 'asc' : 'desc');
                        }}
                      >
                        Clics
                        <ChevronDown className={`h-4 w-4 ml-1 ${sortBy === 'clicks' && sortOrder === 'asc' ? 'rotate-180' : ''} ${sortBy !== 'clicks' ? 'opacity-50' : ''}`} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center" 
                        onClick={() => {
                          setSortBy('last_click');
                          setSortOrder(sortOrder === 'desc' && sortBy === 'last_click' ? 'asc' : 'desc');
                        }}
                      >
                        Dernier clic
                        <ChevronDown className={`h-4 w-4 ml-1 ${sortBy === 'last_click' && sortOrder === 'asc' ? 'rotate-180' : ''} ${sortBy !== 'last_click' ? 'opacity-50' : ''}`} />
                      </button>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <span className="line-clamp-1">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`/conseils/${product.article_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <span className="line-clamp-1">{product.article}</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <BarChart className="h-4 w-4 mr-1 text-green-600" />
                          <span>{product.clicks}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.timestamp 
                          ? format(new Date(product.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {product.is_sponsored ? (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Sponsorisé
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            Standard
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                          >
                            <a href={`/admin/conseils/edit/${product.article_id}`} target="_blank" rel="noopener noreferrer">
                              Modifier
                            </a>
                          </Button>
                          {product.external_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={product.external_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
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

export default AdminAssociatedProducts;
