
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { AdsCampaignType } from '@/types/recipes';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Trash2,
  Users
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AdsCampaignDetailsProps {
  campaignId: string;
}

const AdsCampaignDetails: React.FC<AdsCampaignDetailsProps> = ({ campaignId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Récupérer les données de la campagne
  const { data: campaign, isLoading, error, refetch } = useQuery({
    queryKey: ['adsCampaign', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads_campaigns')
        .select(`
          *,
          jam:jam_id (
            id,
            name,
            creator_id,
            description,
            image_url: jam_images(url, is_primary)
          ),
          creator:created_by (
            id, 
            username, 
            full_name
          ),
          clicks:ads_clicks (
            id,
            user_id,
            clicked_at,
            source_page,
            user:user_id (username, full_name)
          ),
          conversions:ads_conversions (
            id,
            conversion_type,
            conversion_value,
            converted_at,
            user:user_id (username, full_name)
          )
        `)
        .eq('id', campaignId)
        .single();
      
      if (error) throw error;
      
      // Calculer les métriques
      const calculatedData = {
        ...data,
        clicks_count: data.clicks?.length || 0,
        conversions_count: data.conversions?.length || 0,
        ctr: data.clicks?.length ? 
          (data.clicks.length / data.planned_impressions) * 100 : 0,
        conversion_rate: data.clicks?.length && data.conversions?.length ? 
          (data.conversions.length / data.clicks.length) * 100 : 0
      };
      
      return calculatedData as AdsCampaignType;
    }
  });
  
  // Récupérer les factures pour cette campagne
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['adsInvoices', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads_invoices')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
  
  // Supprimer une campagne
  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('ads_campaigns')
        .delete()
        .eq('id', campaignId);
      
      if (error) throw error;
      
      toast({
        title: 'Campagne supprimée',
        description: 'La campagne a été supprimée avec succès',
      });
      
      navigate('/admin/campaigns');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };
  
  // Changer la visibilité d'une campagne
  const toggleVisibility = async () => {
    if (!campaign) return;
    
    try {
      const { error } = await supabase
        .from('ads_campaigns')
        .update({ is_visible: !campaign.is_visible })
        .eq('id', campaignId);
      
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
    return <div className="text-center py-8">Chargement des détails de la campagne...</div>;
  }
  
  if (error || !campaign) {
    return (
      <Card className="mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-red-500">Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Une erreur est survenue lors du chargement des détails de la campagne</p>
          <Button 
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/admin/campaigns')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/campaigns')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux campagnes
          </Button>
          
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={campaign.status} />
            {!campaign.is_visible && (
              <Badge variant="outline" className="border-gray-500 text-gray-500">
                Masquée
              </Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {campaign.campaign_type === 'pro' ? 'Pro' : 'Sponsorisé'}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline"
            size="sm"
            onClick={toggleVisibility}
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
          </Button>
          <Button 
            asChild
            size="sm"
          >
            <Link to={`/admin/campaigns/edit/${campaign.id}`}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Link>
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{campaign.budget_euros} €</p>
            <p className="text-sm text-muted-foreground">
              Facturation: {campaign.billing_type === 'fixed' 
                ? 'Forfaitaire' 
                : campaign.billing_type === 'cpc' 
                  ? 'Coût par clic' 
                  : 'Coût par mille impressions'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Période
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>Début: {format(new Date(campaign.start_date), 'dd MMM yyyy', { locale: fr })}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>Fin: {format(new Date(campaign.end_date), 'dd MMM yyyy', { locale: fr })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Performances
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <p className="text-2xl font-bold">{campaign.clicks_count}</p>
                <p className="text-sm text-muted-foreground">Clics</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{campaign.ctr.toFixed(2)}%</p>
                <p className="text-sm text-muted-foreground">CTR</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produit promu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0"></div>
              <div>
                <p className="font-medium">{campaign.jam?.name || 'Inconnu'}</p>
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {campaign.jam?.description?.substring(0, 30) || 'Aucune description'}
                  {campaign.jam?.description?.length > 30 ? '...' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" /> Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="clicks">
            <Users className="mr-2 h-4 w-4" /> Clics ({campaign.clicks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="mr-2 h-4 w-4" /> Factures ({invoices?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Détails de la campagne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Informations générales</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    <dt className="text-sm font-medium text-muted-foreground">Nom:</dt>
                    <dd>{campaign.name}</dd>
                    
                    <dt className="text-sm font-medium text-muted-foreground">Créée par:</dt>
                    <dd>{campaign.creator?.full_name || campaign.creator?.username || 'Inconnu'}</dd>
                    
                    <dt className="text-sm font-medium text-muted-foreground">Date de création:</dt>
                    <dd>{format(new Date(campaign.created_at), 'PPP', { locale: fr })}</dd>
                    
                    <dt className="text-sm font-medium text-muted-foreground">Date de mise à jour:</dt>
                    <dd>{format(new Date(campaign.updated_at), 'PPP', { locale: fr })}</dd>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Paramètres d'affichage</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    <dt className="text-sm font-medium text-muted-foreground">Impressions prévues:</dt>
                    <dd>{campaign.planned_impressions}</dd>
                    
                    <dt className="text-sm font-medium text-muted-foreground">Fréquence d'affichage:</dt>
                    <dd>Toutes les {campaign.display_frequency} cartes</dd>
                    
                    <dt className="text-sm font-medium text-muted-foreground">Statut:</dt>
                    <dd>
                      <StatusBadge status={campaign.status} />
                    </dd>
                    
                    <dt className="text-sm font-medium text-muted-foreground">Visibilité:</dt>
                    <dd>
                      {campaign.is_visible ? (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-500 text-gray-500">
                          Masquée
                        </Badge>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-8 mb-2">Métriques de performance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Clics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{campaign.clicks_count}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Taux de clics (CTR)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{campaign.ctr.toFixed(2)}%</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Conversions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{campaign.conversions_count}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Taux de conversion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{campaign.conversion_rate.toFixed(2)}%</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clicks">
          <Card>
            <CardHeader>
              <CardTitle>Historique des clics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaign.clicks && campaign.clicks.length > 0 ? (
                      campaign.clicks.map((click: any) => (
                        <TableRow key={click.id}>
                          <TableCell>
                            {format(new Date(click.clicked_at), 'Pp', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            {click.user?.full_name || click.user?.username || 'Utilisateur anonyme'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {click.source_page}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Aucun clic enregistré pour cette campagne
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Factures</span>
                <Button size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Nouvelle facture
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="text-center py-4">Chargement des factures...</div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Facture</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Échéance</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices && invoices.length > 0 ? (
                        invoices.map((invoice: any) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.invoice_number}
                            </TableCell>
                            <TableCell>
                              {format(new Date(invoice.invoice_date), 'P', { locale: fr })}
                            </TableCell>
                            <TableCell>
                              {invoice.amount_euros} €
                            </TableCell>
                            <TableCell>
                              {format(new Date(invoice.due_date), 'P', { locale: fr })}
                            </TableCell>
                            <TableCell>
                              {invoice.status === 'pending' && (
                                <Badge variant="outline" className="border-amber-500 text-amber-500">
                                  En attente
                                </Badge>
                              )}
                              {invoice.status === 'paid' && (
                                <Badge variant="default" className="bg-green-600">
                                  Payée
                                </Badge>
                              )}
                              {invoice.status === 'cancelled' && (
                                <Badge variant="destructive">
                                  Annulée
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/admin/invoices/${invoice.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir
                                </Link>
                              </Button>
                              {invoice.pdf_url && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={invoice.pdf_url} target="_blank" rel="noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    PDF
                                  </a>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Aucune facture trouvée pour cette campagne
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdsCampaignDetails;
