import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { AdsCampaignType, JamType } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const campaignFormSchema = z.object({
  name: z.string().min(3, {
    message: "Le nom de la campagne doit contenir au moins 3 caractères",
  }),
  campaign_type: z.enum(['pro', 'sponsored'], {
    required_error: "Le type de campagne est requis.",
  }),
  jam_id: z.string().optional(),
  redirect_url: z.string().url({
    message: "Veuillez entrer une URL valide",
  }).or(z.literal('')),
  planned_impressions: z.number().min(100, {
    message: "Le nombre d'impressions planifiées doit être d'au moins 100",
  }),
  display_frequency: z.number().min(1, {
    message: "La fréquence d'affichage doit être d'au moins 1",
  }),
  budget_euros: z.number().min(1, {
    message: "Le budget doit être d'au moins 1 euro",
  }),
  start_date: z.date({
    required_error: "La date de début est requise.",
  }),
  end_date: z.date({
    required_error: "La date de fin est requise.",
  }),
  billing_type: z.string().min(3, {
    message: "Le type de facturation doit contenir au moins 3 caractères",
  }),
  is_visible: z.boolean().default(true),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

interface AdsCampaignFormProps {
  campaignId?: string;
  onSuccess?: () => void;
}

const AdsCampaignForm = ({ campaignId, onSuccess }: AdsCampaignFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CampaignFormValues>>({
    is_visible: true,
  });
  const [availableJams, setAvailableJams] = useState<JamType[]>([]);

  useEffect(() => {
    const loadJams = async () => {
      try {
        const { data, error } = await supabaseDirect.select<JamType>('jams', 'id, name');
        if (error) throw error;
        setAvailableJams(data || []);
      } catch (error) {
        console.error('Error loading jams:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des confitures",
          variant: "destructive",
        });
      }
    };

    loadJams();
  }, []);

  useEffect(() => {
    if (campaignId) {
      const loadCampaign = async () => {
        try {
          setLoading(true);
          
          const { data, error } = await supabaseDirect.getById<AdsCampaignType>(
            'ads_campaigns', 
            campaignId
          );
          
          if (error) throw error;
          
          if (data) {
            // Typecasting explicite pour garantir la compatibilité avec AdsCampaignType
            const typedCampaign = data as unknown as AdsCampaignType;
            
            setFormData({
              name: typedCampaign.name,
              campaign_type: typedCampaign.campaign_type,
              jam_id: typedCampaign.jam_id || undefined,
              redirect_url: typedCampaign.redirect_url || '',
              planned_impressions: typedCampaign.planned_impressions,
              display_frequency: typedCampaign.display_frequency,
              budget_euros: typedCampaign.budget_euros,
              start_date: typedCampaign.start_date ? new Date(typedCampaign.start_date) : undefined,
              end_date: typedCampaign.end_date ? new Date(typedCampaign.end_date) : undefined,
              billing_type: typedCampaign.billing_type,
              is_visible: typedCampaign.is_visible
            });
          }
          
        } catch (error) {
          console.error('Error loading campaign:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données de la campagne",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      
      loadCampaign();
    }
  }, [campaignId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      campaignFormSchema.parse(formData);

      const campaignData = {
        ...formData,
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
      };

      if (campaignId) {
        // Update existing campaign
        await supabaseDirect.update<AdsCampaignType>('ads_campaigns', campaignData as AdsCampaignType, { id: campaignId });
        toast({
          title: "Campagne mise à jour",
          description: "La campagne a été mise à jour avec succès.",
        });
      } else {
        // Create new campaign
        await supabaseDirect.insert<AdsCampaignType>('ads_campaigns', campaignData as Omit<AdsCampaignType, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: "Campagne créée",
          description: "La campagne a été créée avec succès.",
        });
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la soumission du formulaire.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{campaignId ? "Modifier la campagne" : "Créer une campagne publicitaire"}</CardTitle>
        <CardDescription>
          {campaignId ? "Modifiez les détails de votre campagne." : "Créez une nouvelle campagne pour promouvoir vos produits."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la campagne</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="Nom de la campagne"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign_type">Type de campagne</Label>
            <Select
              value={formData.campaign_type || ''}
              onValueChange={(value) => handleSelectChange('campaign_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="sponsored">Sponsorisée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.campaign_type === 'sponsored' && (
            <div className="space-y-2">
              <Label htmlFor="jam_id">Confiture à promouvoir</Label>
              <Select
                value={formData.jam_id || ''}
                onValueChange={(value) => handleSelectChange('jam_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une confiture" />
                </SelectTrigger>
                <SelectContent>
                  {availableJams.map(jam => (
                    <SelectItem key={jam.id} value={jam.id}>
                      {jam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.campaign_type === 'pro' && (
            <div className="space-y-2">
              <Label htmlFor="redirect_url">URL de redirection</Label>
              <Input
                id="redirect_url"
                name="redirect_url"
                type="url"
                value={formData.redirect_url || ''}
                onChange={handleInputChange}
                placeholder="https://votre-site.com"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="planned_impressions">Nombre d'impressions planifiées</Label>
            <Input
              id="planned_impressions"
              name="planned_impressions"
              type="number"
              value={formData.planned_impressions || ''}
              onChange={handleInputChange}
              placeholder="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_frequency">Fréquence d'affichage (par jour)</Label>
            <Input
              id="display_frequency"
              name="display_frequency"
              type="number"
              value={formData.display_frequency || ''}
              onChange={handleInputChange}
              placeholder="10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget_euros">Budget (en euros)</Label>
            <Input
              id="budget_euros"
              name="budget_euros"
              type="number"
              value={formData.budget_euros || ''}
              onChange={handleInputChange}
              placeholder="50"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    {formData.start_date ? (
                      format(formData.start_date, "d MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Choisir une date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => handleDateChange('start_date', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    {formData.end_date ? (
                      format(formData.end_date, "d MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Choisir une date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => handleDateChange('end_date', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_type">Type de facturation</Label>
            <Input
              id="billing_type"
              name="billing_type"
              type="text"
              value={formData.billing_type || ''}
              onChange={handleInputChange}
              placeholder="Type de facturation"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Input
              id="is_visible"
              name="is_visible"
              type="checkbox"
              checked={formData.is_visible || false}
              onChange={handleCheckboxChange}
            />
            <Label htmlFor="is_visible">Visible</Label>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdsCampaignForm;
