
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createNewBattle } from '@/utils/battleHelpers';

const battleFormSchema = z.object({
  theme: z.string().min(5, "Le thème doit contenir au moins 5 caractères."),
  constraints: z.string().min(3, "Veuillez spécifier au moins une contrainte."),
  max_price_credits: z.number().min(1, "Le prix ne peut pas être inférieur à 1 crédit."),
  min_jams_required: z.number().min(0, "La valeur minimale est 0."),
  max_judges: z.number().min(3, "Il faut au moins 3 juges."),
  judge_discount_percent: z.number().min(0, "La remise ne peut pas être négative.").max(100, "La remise ne peut pas dépasser 100%."),
  reward_credits: z.number().min(0, "La récompense ne peut pas être négative."),
  reward_description: z.string().optional(),
  registration_end_date: z.date(),
  production_end_date: z.date(),
  voting_end_date: z.date(),
  is_featured: z.boolean().default(false),
});

type BattleFormValues = z.infer<typeof battleFormSchema>;

interface BattleFormProps {
  onSuccess?: (battleId: string) => void;
}

const BattleForm: React.FC<BattleFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  
  const form = useForm<BattleFormValues>({
    resolver: zodResolver(battleFormSchema),
    defaultValues: {
      theme: '',
      constraints: '',
      max_price_credits: 10,
      min_jams_required: 3,
      max_judges: 10,
      judge_discount_percent: 25,
      reward_credits: 50,
      reward_description: '',
      registration_end_date: addDays(new Date(), 14),
      production_end_date: addDays(new Date(), 30),
      voting_end_date: addDays(new Date(), 45),
      is_featured: false,
    },
  });
  
  const onSubmit = async (data: BattleFormValues) => {
    try {
      // Formater les contraintes en objet JSON
      const constraintsObj = {};
      data.constraints.split(',').forEach(constraint => {
        const [key, value] = constraint.split(':').map(part => part.trim());
        if (key && value) {
          constraintsObj[key] = value;
        }
      });
      
      const battleData = {
        ...data,
        constraints: constraintsObj,
        status: 'inscription' as const
      };
      
      const newBattle = await createNewBattle(battleData);
      
      if (newBattle) {
        toast({
          title: "Succès!",
          description: "Le battle a été créé avec succès.",
        });
        
        if (onSuccess) {
          onSuccess(newBattle.id);
        }
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la création du battle.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création du battle:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du battle.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thème du battle</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Confitures aux fruits rouges" {...field} />
                </FormControl>
                <FormDescription>
                  Le thème principal du battle qui inspirera les participants.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="constraints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraintes</FormLabel>
                <FormControl>
                  <Input placeholder="ex: fruit:fraise, couleur:rouge" {...field} />
                </FormControl>
                <FormDescription>
                  Liste des contraintes séparées par des virgules (clé:valeur).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="max_price_credits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix maximum (crédits)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Le prix maximum autorisé pour un pot.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="min_jams_required"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confitures minimales requises</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Nombre minimum de confitures déjà créées pour participer.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="max_judges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre maximum de juges</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={3}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Le nombre maximum de personnes pouvant juger ce battle.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="judge_discount_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remise pour les juges (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0}
                    max={100}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Pourcentage de remise appliqué pour les juges.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reward_credits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Récompense (crédits)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Nombre de crédits attribués au gagnant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reward_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description de la récompense (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Badge exclusif Battle Champion" {...field} />
                </FormControl>
                <FormDescription>
                  Récompense additionnelle pour le gagnant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="registration_end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin des inscriptions</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "d MMMM yyyy", { locale: fr })
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
            name="production_end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin de production</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "d MMMM yyyy", { locale: fr })
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
                        (form.getValues("registration_end_date") && date <= form.getValues("registration_end_date"))
                      }
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
            name="voting_end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin des votes</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "d MMMM yyyy", { locale: fr })
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
                        (form.getValues("production_end_date") && date <= form.getValues("production_end_date"))
                      }
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
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Battle en vedette</FormLabel>
                <FormDescription>
                  Mettre ce battle en évidence sur la page principale.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">Créer le Battle</Button>
      </form>
    </Form>
  );
};

export default BattleForm;
