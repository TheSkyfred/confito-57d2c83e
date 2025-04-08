
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { JamType, NewBattleType } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

const candidateFormSchema = z.object({
  motivation: z.string()
    .min(50, "Votre motivation doit contenir au moins 50 caractères.")
    .max(500, "Votre motivation ne doit pas dépasser 500 caractères."),
  reference_jam_id: z.string().optional(),
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

interface BattleCandidateFormProps {
  battle: NewBattleType;
  onSuccess: () => void;
}

const BattleCandidateForm: React.FC<BattleCandidateFormProps> = ({ battle, onSuccess }) => {
  const { toast } = useToast();
  const [userJams, setUserJams] = useState<JamType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      motivation: '',
      reference_jam_id: undefined,
    },
  });
  
  useEffect(() => {
    const fetchUserJams = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('jams')
            .select('*')
            .eq('creator_id', user.id)
            .eq('is_active', true);
            
          if (error) throw error;
          setUserJams(data as JamType[]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des confitures:", error);
      }
    };
    
    fetchUserJams();
  }, []);
  
  const onSubmit = async (data: CandidateFormValues) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Non connecté",
          description: "Vous devez être connecté pour postuler à un battle.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('battle_candidates')
        .insert({
          battle_id: battle.id,
          user_id: user.id,
          motivation: data.motivation,
          reference_jam_id: data.reference_jam_id || null
        });
        
      if (error) throw error;
      
      toast({
        title: "Candidature envoyée!",
        description: "Votre candidature a été soumise avec succès.",
      });
      
      onSuccess();
      
    } catch (error: any) {
      console.error("Erreur lors de la soumission de la candidature:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la soumission de votre candidature.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="motivation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre motivation</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Expliquez pourquoi vous souhaitez participer à ce battle et ce qui vous inspire dans le thème..."
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Décrivez votre motivation et vos idées pour ce battle (entre 50 et 500 caractères).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reference_jam_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confiture de référence (optionnel)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une de vos confitures..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {userJams.length > 0 ? (
                    userJams.map((jam) => (
                      <SelectItem key={jam.id} value={jam.id}>
                        {jam.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Aucune confiture disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Vous pouvez sélectionner une de vos confitures existantes comme référence.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Envoi en cours..." : "Postuler au battle"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BattleCandidateForm;
