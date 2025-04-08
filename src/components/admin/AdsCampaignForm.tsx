import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const campaignFormSchema = z.object({
  name: z.string().min(3, 'Le nom doit avoir au moins 3 caractères'),
  campaign_type: z.enum(['pro', 'sponsored']),
  jam_id: z.string().uuid('Veuillez sélectionner une confiture valide').optional()
    .refine(
      (val, ctx) => {
        return ctx.data.campaign_type !== 'sponsored' || (val && val.length > 0);
      },
      {
        message: "La confiture est requise pour les campagnes sponsorisées",
        path: ["jam_id"],
      }
    ),
  redirect_url: z.string().url('Veuillez entrer une URL valide').optional()
    .refine(
      (val, ctx) => {
        return ctx.data.campaign_type !== 'pro' || (val && val.length > 0);
      },
      {
        message: "L'URL de redirection est requise pour les campagnes professionnelles",
        path: ["redirect_url"],
      }
    ),
  planned_impressions: z.coerce.number().min(100, 'Minimum 100 impressions'),
  display_frequency: z.coerce.number().min(1, 'La fréquence minimale est 1'),
  budget_euros: z.coerce.number().min(5, 'Le budget minimum est de 5€'),
  start_date: z.date({
    required_error: "La date de début est requise",
  }),
  end_date: z.date({
    required_error: "La date de fin est requise",
  }).refine(date => date > new Date(), "La date de fin doit être dans le futur"),
  billing_type: z.enum(['fixed', 'cpc', 'cpm']),
  is_visible: z.boolean().default(true)
}).refine(data => data.end_date > data.start_date, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["end_date"],
});

interface AdsCampaignFormProps {
  campaignId?: string;
}

const AdsCampaignForm: React.FC<AdsCampaignFormProps> = ({ campaignId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!campaignId;

  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [jams, setJams] = useState<any[]>([]);
  const [loadingJams, setLoadingJams] = useState(false);
  const [campaignType, setCampaignType] = useState<'pro' | 'sponsored'>('sponsored');

  const form = useForm<z.infer<typeof campaignFormSchema>>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: '',
      campaign_type: 'sponsored',
      jam_id: undefined,
      redirect_url: '',
      planned_impressions: 1000,
      display_frequency: 6,
      budget_euros: 50,
      billing_type: 'fixed',
      is_visible: true,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours par défaut
    },
  });

  const handleCampaignTypeChange = (value: 'pro' | 'sponsored') => {
    setCampaignType(value);
    form.setValue('campaign_type', value);
    
    if (value === 'pro') {
      form.setValue('jam_id', undefined);
    }
    
    if (value === 'sponsored') {
      form.setValue('redirect_url', '');
    }
    
    form.trigger();
  };

  useEffect(() => {
    const fetchJams = async () => {
      if (campaignType === 'pro') return;
      
      setLoadingJams(true);
      const { data, error } = await supabase
        .from('jams')
        .select(`
          id,
          name,
          creator_id,
          profiles:creator_id (username, full_name)
        `)
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('name');

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des confitures",
          variant: "destructive",
        });
        return;
      }

      setJams(data || []);
      setLoadingJams(false);
    };

    fetchJams();
  }, [toast, campaignType]);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) return;
      
      setLoading(true);
      
      const { data, error } = await supabaseDirect.getById('ads_campaigns', campaignId);
        
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger cette campagne",
          variant: "destructive",
        });
        navigate('/admin/campaigns');
        return;
      }
      
      setCampaign(data);
      setCampaignType(data.campaign_type);
      
      form.reset({
        name: data.name,
        campaign_type: data.campaign_type,
        jam_id: data.jam_id || undefined,
        redirect_url: data.redirect_url || '',
        planned_impressions: data.planned_impressions,
        display_frequency: data.display_frequency,
        budget_euros: data.budget_euros,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        billing_type: data.billing_type,
        is_visible: data.is_visible,
      });
      
      setLoading(false);
    };
    
    fetchCampaign();
  }, [campaignId, form, toast, navigate]);

  const onSubmit = async (values: z.infer<typeof campaignFormSchema>) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour gérer les campagnes publicitaires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const campaignData = {
        name: values.name,
        campaign_type: values.campaign_type,
        jam_id: values.campaign_type === 'sponsored' ? values.jam_id : null,
        redirect_url: values.campaign_type === 'pro' ? values.redirect_url : null,
        planned_impressions: values.planned_impressions,
        display_frequency: values.display_frequency,
        budget_euros: values.budget_euros,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        billing_type: values.billing_type,
        is_visible: values.is_visible,
        created_by: user.id,
      };

      let result;
      
      if (isEditing) {
        const { created_by, ...updateData } = campaignData;
        result = await supabaseDirect.update('ads_campaigns', updateData, { id: campaignId });
      } else {
        result = await supabaseDirect.insertAndReturn('ads_campaigns', campaignData);
      }

      if (result.error) throw result.error;

      if (!isEditing && result.data && result.data[0]?.id) {
        const invoiceData = {
          campaign_id: result.data[0].id,
          amount_euros: values.budget_euros,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const invoiceResult = await supabaseDirect.insert('ads_invoices', invoiceData);

        if (invoiceResult.error) {
          console.error("Erreur lors de la création de la facture:", invoiceResult.error);
        }
      }

      toast({
        title: isEditing ? "Campagne mise à jour" : "Campagne créée",
        description: isEditing 
          ? "La campagne a été mise à jour avec succès" 
          : "La campagne a été créée et une facture a été générée",
      });

      navigate('/admin/campaigns');
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la campagne</FormLabel>
              <FormControl>
                <Input placeholder="Campagne été 2025..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="campaign_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de campagne</FormLabel>
              <Select 
                onValueChange={(value) => handleCampaignTypeChange(value as 'pro' | 'sponsored')} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pro">Professionnel</SelectItem>
                  <SelectItem value="sponsored">Sponsorisé classique</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {campaignType === 'pro' ? 
                  "Campagne professionnelle avec redirection vers une URL externe" : 
                  "Campagne liée à une confiture spécifique"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {campaignType === 'sponsored' ? (
          <FormField
            control={form.control}
            name="jam_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confiture à promouvoir</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={loadingJams}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une confiture" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jams.map(jam => (
                      <SelectItem key={jam.id} value={jam.id}>
                        {jam.name} - {jam.profiles?.full_name || jam.profiles?.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="redirect_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de redirection</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormDescription>
                  URL vers laquelle les utilisateurs seront redirigés en cliquant sur la publicité
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="planned_impressions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impressions prévues</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={100}
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="display_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fréquence d'affichage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Affichage toutes les X cartes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget_euros"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    step={0.01}
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={
                          "pl-3 text-left font-normal"
                        }
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      locale={fr}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={
                          "pl-3 text-left font-normal"
                        }
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => 
                        date < new Date() || 
                        (form.getValues().start_date && date < form.getValues().start_date)
                      }
                      locale={fr}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="billing_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de facturation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type de facturation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fixed">Forfaitaire</SelectItem>
                  <SelectItem value="cpc">Coût par clic (CPC)</SelectItem>
                  <SelectItem value="cpm">Coût par mille impressions (CPM)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Campagne visible
                </FormLabel>
                <FormDescription>
                  La campagne sera affichée sur le site si activée
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin/campaigns')}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Chargement...' : isEditing ? 'Mettre à jour' : 'Créer la campagne'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdsCampaignForm;
