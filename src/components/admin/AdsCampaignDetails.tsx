import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdsCampaignType, AdsInvoiceType } from '@/types/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart, Calendar, Download, ExternalLink, FileText, Link, Percent, TrendingUp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AdsCampaignDetailsProps {
  campaignId?: string;
}

const AdsCampaignDetails: React.FC<AdsCampaignDetailsProps> = ({ campaignId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      
      const { data, error } = await supabase
        .from('ads_campaigns')
        .select(`
          *,
          jam:jam_id (
            id,
            name,
            description,
            price_credits,
            jam_images (url, is_primary)
          ),
          clicks:ads_clicks (
            id,
            created_at,
            user_id,
            user_agent
          ),
          conversions:ads_conversions (
            id,
            created_at,
            user_id,
            value_euros
          )
        `)
        .eq('id', campaignId)
        .single();
      
      if (error) {
        console.error('Error fetching campaign:', error);
        throw error;
      }
      
      // Calculate metrics
      const clicks = data.clicks?.length || 0;
      const impressions = data.planned_impressions || 0;
      const conversions = data.conversions?.length || 0;
      
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
      
      return {
        ...data,
        clicks_count: clicks,
        conversions_count: conversions,
        ctr,
        conversion_rate: conversionRate
      } as AdsCampaignType;
    },
    enabled: !!campaignId
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['campaignInvoices', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      
      const { data, error } = await supabase
        .from('ads_invoices')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('invoice_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
      
      return data as AdsInvoiceType[];
    },
    enabled: !!campaignId
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const handleDownloadInvoice = (invoice: AdsInvoiceType) => {
    if (!invoice.pdf_url) {
      toast({
        title: "Facture non disponible",
        description: "Le PDF de cette facture n'est pas encore disponible.",
        variant: "destructive"
      });
      return;
    }
    
    window.open(invoice.pdf_url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Campagne non trouvée</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/admin/ads')}
        >
          Retour à la liste des campagnes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{campaign.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={campaign.is_visible ? "default" : "secondary"}>
              {campaign.is_visible ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">{campaign.campaign_type === 'pro' ? 'Professionnel' : 'Sponsorisé'}</Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/ads/edit/${campaign.id}`)}>
            Modifier
          </Button>
          {campaign.jam_id && (
            <Button variant="outline" asChild>
              <a href={`/jam/${campaign.jam_id}`} target="_blank" rel="noopener noreferrer">
                Voir le produit
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="billing">Facturation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Type de campagne</h4>
                    <p>{campaign.campaign_type === 'pro' ? 'Professionnel' : 'Sponsorisé'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Budget</h4>
                    <p>{campaign.budget_euros} €</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Impressions prévues</h4>
                    <p>{campaign.planned_impressions.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Fréquence d'affichage</h4>
                    <p>{campaign.display_frequency} %</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Date de début</h4>
                    <p className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDate(campaign.start_date)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Date de fin</h4>
                    <p className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDate(campaign.end_date)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Type de facturation</h4>
                    <p>{campaign.billing_type}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">URL de redirection</h4>
                    {campaign.redirect_url ? (
                      <a 
                        href={campaign.redirect_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Link className="mr-2 h-4 w-4" />
                        {campaign.redirect_url.substring(0, 30)}
                        {campaign.redirect_url.length > 30 ? '...' : ''}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">Non définie</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {campaign.jam && (
            <Card>
              <CardHeader>
                <CardTitle>Produit associé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                    {campaign.jam.jam_images && campaign.jam.jam_images.length > 0 ? (
                      <img 
                        src={campaign.jam.jam_images.find(img => img.is_primary)?.url || campaign.jam.jam_images[0].url} 
                        alt={campaign.jam.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{campaign.jam.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.jam.description}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {campaign.jam.price_credits} crédits
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Impressions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{campaign.planned_impressions.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Clics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{campaign.clicks_count.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{campaign.conversions_count.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taux de clic (CTR)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Percent className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{campaign.ctr.toFixed(2)}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Basé sur {campaign.clicks_count} clics pour {campaign.planned_impressions} impressions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taux de conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Percent className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{campaign.conversion_rate.toFixed(2)}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Basé sur {campaign.conversions_count} conversions pour {campaign.clicks_count} clics
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Détails des clics</CardTitle>
              <CardDescription>Les 10 derniers clics sur cette campagne</CardDescription>
            </CardHeader>
            <CardContent>
              {campaign.clicks && campaign.clicks.length > 0 ? (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 text-sm font-medium">Date</th>
                        <th className="text-left p-2 text-sm font-medium">Utilisateur</th>
                        <th className="text-left p-2 text-sm font-medium">Agent utilisateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaign.clicks.slice(0, 10).map((click: any) => (
                        <tr key={click.id} className="border-b">
                          <td className="p-2 text-sm">{formatDate(click.created_at)}</td>
                          <td className="p-2 text-sm">{click.user_id || 'Anonyme'}</td>
                          <td className="p-2 text-sm truncate max-w-xs">{click.user_agent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun clic enregistré pour cette campagne.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations de facturation</CardTitle>
              <CardDescription>Factures associées à cette campagne</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : invoices && invoices.length > 0 ? (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 text-sm font-medium">N° Facture</th>
                        <th className="text-left p-2 text-sm font-medium">Date</th>
                        <th className="text-left p-2 text-sm font-medium">Montant</th>
                        <th className="text-left p-2 text-sm font-medium">Statut</th>
                        <th className="text-left p-2 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b">
                          <td className="p-2 text-sm">{invoice.invoice_number}</td>
                          <td className="p-2 text-sm">{formatDate(invoice.invoice_date)}</td>
                          <td className="p-2 text-sm">{invoice.amount_euros} €</td>
                          <td className="p-2 text-sm">
                            <Badge variant={
                              invoice.status === 'paid' ? 'default' : 
                              invoice.status === 'pending' ? 'secondary' : 
                              'destructive'
                            }>
                              {invoice.status === 'paid' ? 'Payée' : 
                               invoice.status === 'pending' ? 'En attente' : 
                               'Non payée'}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice)}
                              disabled={!invoice.pdf_url}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune facture associée à cette campagne.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Résumé financier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Budget total</p>
                  <p className="text-2xl font-bold">{campaign.budget_euros} €</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Facturé</p>
                  <p className="text-2xl font-bold">
                    {invoices ? 
                      invoices.reduce((sum, invoice) => sum + invoice.amount_euros, 0) : 0} €
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Coût par clic</p>
                  <p className="text-2xl font-bold">
                    {campaign.clicks_count > 0 ? 
                      (campaign.budget_euros / campaign.clicks_count).toFixed(2) : 0} €
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    Contrat de campagne publicitaire
                  </a>
                </Button>
                
                <Button variant="outline" className="justify-start" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    Conditions générales
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdsCampaignDetails;
