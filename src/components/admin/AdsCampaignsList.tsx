
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { AdsCampaignType } from '@/types/recipes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Edit, 
  Eye, 
  EyeOff, 
  FileText, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdsCampaignsList: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Récupérer les campagnes
  const { data: campaigns, isLoading, error, refetch } = useQuery({
    queryKey: ['adsCampaigns'],
    queryFn: async () => {
      try {
        const { data, error } = await supabaseDirect.select('ads_campaigns', `
          *,
          jam:jam_id (
            id,
            name,
            image_url: jam_images(url, is_primary)
          ),
          creator:created_by (
            id, 
            username, 
            full_name
          ),
          clicks:ads_clicks (id),
          conversions:ads_conversions (id)
        `);
          
        if (error) throw error;
        
        // Calculer les métriques
        return (data || []).map((campaign: any) => ({
          ...campaign,
          clicks_count: campaign.clicks?.length || 0,
          conversions_count: campaign.conversions?.length || 0,
          ctr: campaign.clicks?.length ? 
            (campaign.clicks.length / campaign.planned_impressions) * 100 : 0,
          conversion_rate: campaign.clicks?.length && campaign.conversions?.length ? 
            (campaign.conversions.length / campaign.clicks.length) * 100 : 0
        })) as AdsCampaignType[];
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }
    }
  });
  
  // Supprimer une campagne
  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      return;
    }
    
    try {
      const { error } = await supabaseDirect.delete('ads_campaigns', { id });
      
      if (error) throw error;
      
      toast({
        title: 'Campagne supprimée',
        description: 'La campagne a été supprimée avec succès',
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };
  
  // Changer la visibilité d'une campagne
  const toggleVisibility = async (campaign: AdsCampaignType) => {
    try {
      const { error } = await supabaseDirect.update(
        'ads_campaigns',
        { is_visible: !campaign.is_visible },
        { id: campaign.id }
      );
      
      if (error) throw error;
      
      toast({
        title: campaign.is_visible ? 'Campagne masquée' : 'Campagne visible',
        description: campaign.is_visible 
          ? 'La campagne a été masquée et ne sera plus affichée' 
          : 'La campagne est maintenant visible',
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };
  
  
  // Filtrer les campagnes
  const filteredCampaigns = campaigns?.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.jam?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Badge de statut avec couleur appropriée
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">En attente</Badge>;
      case 'completed':
        return <Badge variant="secondary">Terminée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Chargement des campagnes...</div>;
  }
  
  if (error) {
    return (
      <Card className="mx-auto max-w-4xl my-8">
        <CardHeader>
          <CardTitle className="text-red-500">Erreur</CardTitle>
          <CardDescription>
            Une erreur est survenue lors du chargement des campagnes
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une campagne..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant={!statusFilter ? "default" : "outline"} 
            className="w-full sm:w-auto"
            onClick={() => setStatusFilter(null)}
          >
            Toutes
          </Button>
          <Button 
            variant={statusFilter === 'active' ? "default" : "outline"} 
            className="w-full sm:w-auto"
            onClick={() => setStatusFilter('active')}
          >
            Actives
          </Button>
          <Button 
            variant={statusFilter === 'pending' ? "default" : "outline"} 
            className="w-full sm:w-auto"
            onClick={() => setStatusFilter('pending')}
          >
            À venir
          </Button>
          <Button 
            variant={statusFilter === 'completed' ? "default" : "outline"} 
            className="w-full sm:w-auto"
            onClick={() => setStatusFilter('completed')}
          >
            Terminées
          </Button>
        </div>
        
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/ads/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Link>
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Campagne</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Budget</TableHead>
              <TableHead className="hidden md:table-cell">Période</TableHead>
              <TableHead className="hidden md:table-cell">Clics</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns && filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold">{campaign.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {campaign.jam?.name || 'Confiture inconnue'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={campaign.status} />
                      {!campaign.is_visible && (
                        <Badge variant="outline" className="border-gray-500 text-gray-500">
                          Masquée
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {campaign.campaign_type === 'pro' ? 'Pro' : 'Sponsorisé'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {campaign.budget_euros} €
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col text-sm">
                      <span>
                        <Calendar className="inline mr-1 h-3 w-3" />
                        {format(new Date(campaign.start_date), 'dd/MM/yy', { locale: fr })}
                      </span>
                      <span>
                        <Calendar className="inline mr-1 h-3 w-3" />
                        {format(new Date(campaign.end_date), 'dd/MM/yy', { locale: fr })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col">
                      <span>{campaign.clicks_count} clics</span>
                      <span className="text-xs text-muted-foreground">
                        {campaign.ctr?.toFixed(2)}% CTR
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/ads/view/${campaign.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> Voir les détails
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/ads/edit/${campaign.id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/ads/invoices/${campaign.id}`}>
                            <FileText className="mr-2 h-4 w-4" /> Factures
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleVisibility(campaign)}
                        >
                          {campaign.is_visible ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" /> Masquer
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" /> Rendre visible
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-500 focus:text-red-500" 
                          onClick={() => handleDelete(campaign.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Aucune campagne trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdsCampaignsList;
