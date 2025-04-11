
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { useToast } from '@/hooks/use-toast';
import { AdsCampaignType, AdsInvoiceType } from '@/types/recipes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  EyeOff,
  FileText,
  MousePointer,
  Percent,
  ShoppingCart,
  Target,
  Trash2,
  TrendingUp,
  User,
  Users,
  Activity,
  ArrowLeft,
  Eye,
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<AdsCampaignType | null>(null);
  const [invoices, setInvoices] = useState<AdsInvoiceType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabaseDirect.getById('ads_campaigns', campaignId, `
          *,
          jam:jam_id (
            id,
            name,
            price_euros,
            creator_id,
            profiles:creator_id (username, full_name)
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
        
        if (!data) {
          throw new Error('Campagne non trouvée');
        }

        // Calculer les métriques
        const campaignData = {
          ...data,
          clicks_count: data.clicks?.length || 0,
          conversions_count: data.conversions?.length || 0,
          ctr: data.clicks?.length ? 
            (data.clicks.length / data.planned_impressions) * 100 : 0,
          conversion_rate: data.clicks?.length && data.conversions?.length ? 
            (data.conversions.length / data.clicks.length) * 100 : 0
        };
        
        setCampaign(campaignData as AdsCampaignType);
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de charger les détails de la campagne',
          variant: 'destructive',
        });
        navigate('/admin/campaigns');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchInvoices = async () => {
      setLoadingInvoices(true);
      
      try {
        const { data, error } = await supabaseDirect.selectWhere('ads_invoices', 'campaign_id', campaignId);
          
        if (error) throw error;
        
        setInvoices(data || []);
      } catch (error: any) {
        console.error('Erreur lors du chargement des factures:', error);
      } finally {
        setLoadingInvoices(false);
      }
    };
    
    fetchCampaign();
    fetchInvoices();
  }, [campaignId, navigate, toast]);
  
  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      return;
    }
    
    try {
      const { error } = await supabaseDirect.delete('ads_campaigns', { id: campaignId });
      
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
  
  const toggleVisibility = async () => {
    if (!campaign) return;
    
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
      
      setCampaign({
        ...campaign,
        is_visible: !campaign.is_visible
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Chargement des détails...</div>;
  }
  
  if (!campaign) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Erreur</CardTitle>
          <CardDescription>Campagne non trouvée</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link to="/admin/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux campagnes
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">En attente</Badge>;
      case 'completed':
        return <Badge variant="secondary">Terminée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600">Payée</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">En attente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/campaigns')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to={`/admin/campaigns/edit/${campaign.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={toggleVisibility}
          >
            {campaign.is_visible ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Masquer
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Rendre visible
              </>
            )}
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{campaign.name}</CardTitle>
                <CardDescription>
                  Campagne {campaign.campaign_type === 'pro' ? 'professionnelle' : 'sponsorisée'}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1">
                {getStatusBadge(campaign.status)}
                {!campaign.is_visible && (
                  <Badge variant="outline" className="border-gray-500 text-gray-500">
                    Masquée
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Période</span>
                </div>
                <div>
                  <div className="text-sm">
                    Du {format(new Date(campaign.start_date), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                  <div className="text-sm">
                    Au {format(new Date(campaign.end_date), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget</span>
                </div>
                <div className="font-semibold">{campaign.budget_euros} €</div>
                <div className="text-xs text-muted-foreground">
                  Mode: {campaign.billing_type === 'fixed' ? 'Forfait' : 
                         campaign.billing_type === 'cpc' ? 'Coût par clic' : 
                         'Coût par mille impressions'}
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Target className="h-4 w-4" />
                  <span>Performance</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">{campaign.clicks_count}</span> clics
                </div>
                <div className="text-xs text-muted-foreground">
                  CTR: {campaign.ctr.toFixed(2)}%
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Conversions</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">{campaign.conversions_count}</span> conversions
                </div>
                <div className="text-xs text-muted-foreground">
                  Taux: {campaign.conversion_rate.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Confiture promue</h3>
                <div className="bg-muted/50 p-3 rounded-md">
                  {campaign.jam ? (
                    <Link to={`/jams/${campaign.jam.id}`} className="hover:underline flex items-center justify-between">
                      <span>{campaign.jam.name}</span>
                      <Badge variant="outline">
                        {campaign.jam.price_euros?.toFixed(2)} €
                      </Badge>
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Confiture non disponible</span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Configuration</h3>
                <div className="bg-muted/50 p-3 rounded-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impressions planifiées:</span>
                    <span>{campaign.planned_impressions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fréquence d'affichage:</span>
                    <span>Toutes les {campaign.display_frequency} cartes</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Factures</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingInvoices ? (
              <div className="text-center py-2 text-sm text-muted-foreground">
                Chargement...
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                Aucune facture disponible
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="p-3 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold">{invoice.invoice_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(invoice.invoice_date), 'dd/MM/yyyy', { locale: fr })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{invoice.amount_euros} €</div>
                      <div className="mt-1">{getInvoiceStatusBadge(invoice.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/admin/campaigns/${campaign.id}/invoices`}>
                <FileText className="mr-2 h-4 w-4" />
                Toutes les factures
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="statistics">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="statistics">
            <BarChart className="h-4 w-4 mr-2" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="clicks">
            <MousePointer className="h-4 w-4 mr-2" />
            Clics
          </TabsTrigger>
          <TabsTrigger value="conversions">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Conversions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="statistics">
          <Card className="border-t-0 rounded-t-none">
            <CardContent className="py-6">
              <div className="mb-4 text-sm text-muted-foreground">
                Statistiques de la campagne du {format(new Date(campaign.start_date), 'dd/MM/yyyy', { locale: fr })}
                {' '}au {format(new Date(campaign.end_date), 'dd/MM/yyyy', { locale: fr })}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="border rounded-md p-4">
                  <div className="flex gap-2 items-center text-muted-foreground mb-1">
                    <Activity className="h-4 w-4" /> 
                    <span className="text-xs">Impressions</span>
                  </div>
                  <div className="text-2xl font-bold">{campaign.planned_impressions}</div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex gap-2 items-center text-muted-foreground mb-1">
                    <MousePointer className="h-4 w-4" /> 
                    <span className="text-xs">Clics</span>
                  </div>
                  <div className="text-2xl font-bold">{campaign.clicks_count}</div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex gap-2 items-center text-muted-foreground mb-1">
                    <Percent className="h-4 w-4" /> 
                    <span className="text-xs">CTR</span>
                  </div>
                  <div className="text-2xl font-bold">{campaign.ctr.toFixed(2)}%</div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex gap-2 items-center text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" /> 
                    <span className="text-xs">Conv. Rate</span>
                  </div>
                  <div className="text-2xl font-bold">{campaign.conversion_rate.toFixed(2)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clicks">
          <Card className="border-t-0 rounded-t-none">
            <CardContent className="py-6">
              <div className="text-center py-8 text-muted-foreground">
                Les données détaillées des clics seront disponibles prochainement
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversions">
          <Card className="border-t-0 rounded-t-none">
            <CardContent className="py-6">
              <div className="text-center py-8 text-muted-foreground">
                Les données détaillées des conversions seront disponibles prochainement
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
    </div>
  );
};

export default AdsCampaignDetails;
