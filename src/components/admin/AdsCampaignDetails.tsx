import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, ExternalLink, FileText, Image, Type, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { AdsCampaignType, AdsInvoiceType } from '@/types/supabase';
import { CreditBadge } from '@/components/ui/credit-badge';
import { ScrollArea } from "@/components/ui/scroll-area"

const AdsCampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [invoices, setInvoices] = useState<AdsInvoiceType[]>([]);

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabaseDirect.select<AdsCampaignType>(
        'ads_campaigns', 
        `*, clicks:ads_clicks(*), conversions:ads_conversions(*), jam:jam_id(name, profiles(username))`
      );
      
      const campaignData = data?.find(item => item.id === id);
      if (!campaignData) throw new Error('Campaign not found');
      
      // Ajout d'un typecasting explicite pour assurer la compatibilité avec AdsCampaignType
      const typedCampaign = campaignData as unknown as AdsCampaignType & {
        clicks?: any[];
        conversions?: any[];
        jam?: any;
      };
      
      // Calcul des métriques pour l'affichage
      if (typedCampaign) {
        const clicks = typedCampaign.clicks || [];
        const conversions = typedCampaign.conversions || [];
        typedCampaign.clicks_count = clicks.length;
        typedCampaign.ctr = clicks.length / (typedCampaign.planned_impressions || 1) * 100;
        typedCampaign.conversions_count = conversions.length;
        typedCampaign.conversion_rate = clicks.length > 0 ? 
          conversions.length / clicks.length * 100 : 0;
      }
      
      return typedCampaign;
    },
    enabled: !!id
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['campaign_invoices', id],
    queryFn: async () => {
      const { data, error } = await supabaseDirect.selectWhere<AdsInvoiceType>(
        'ads_invoices', 
        'campaign_id', 
        id as string
      );
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  useEffect(() => {
    if (invoicesData) {
      setInvoices(invoicesData);
    }
  }, [invoicesData]);

  if (isLoading) {
    return <div className="container py-8">Chargement...</div>;
  }

  if (error || !campaign) {
    return <div className="container py-8">Erreur: Campagne non trouvée.</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/ads">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/ads/edit/${campaign.id}`}>
            Modifier la campagne
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Détails de la campagne</CardTitle>
              <CardDescription>
                Informations générales sur la campagne publicitaire.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <span>{campaign.campaign_type === 'pro' ? 'Campagne Pro' : 'Campagne Sponsorisée'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{campaign.name}</span>
              </div>
              {campaign.jam && (
                <div className="flex items-center space-x-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span>Confiture: {campaign.jam.name}</span>
                </div>
              )}
              {campaign.redirect_url && (
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a href={campaign.redirect_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Lien de redirection
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span>Visible: {campaign.is_visible ? 'Oui' : 'Non'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span>Statut: {campaign.status}</span>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Impressions planifiées</p>
                  <p className="font-medium">{campaign.planned_impressions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fréquence d'affichage</p>
                  <p className="font-medium">{campaign.display_frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">{campaign.budget_euros} €</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type de facturation</p>
                  <p className="font-medium">{campaign.billing_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de début</p>
                  <p className="font-medium">
                    {format(new Date(campaign.start_date), 'PPP', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de fin</p>
                  <p className="font-medium">
                    {format(new Date(campaign.end_date), 'PPP', { locale: fr })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Performances</CardTitle>
              <CardDescription>
                Suivi des performances de la campagne.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre de Clics</p>
                <p className="font-medium">{campaign.clicks_count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nombre de Conversions</p>
                <p className="font-medium">{campaign.conversions_count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CTR (Click-Through Rate)</p>
                <p className="font-medium">{(campaign.ctr || 0).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux de Conversion</p>
                <p className="font-medium">{(campaign.conversion_rate || 0).toFixed(2)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Factures</CardTitle>
            <CardDescription>
              Liste des factures associées à cette campagne.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <div className="divide-y divide-border">
                {isLoadingInvoices ? (
                  <div className="p-4">Chargement des factures...</div>
                ) : invoices.length > 0 ? (
                  invoices.map(invoice => (
                    <div key={invoice.id} className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium">Facture #{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">
                            Date: {format(new Date(invoice.invoice_date), 'PPP', { locale: fr })}
                          </p>
                        </div>
                        <div>
                          <CreditBadge amount={invoice.amount_euros} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Aucune facture disponible pour cette campagne.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdsCampaignDetails;
