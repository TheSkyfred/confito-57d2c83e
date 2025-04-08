
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BattleParticipantType, BattleCriteriaType, NewBattleType } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { Rating } from './Rating';

interface BattleVoteFormProps {
  battle: NewBattleType;
  participant: BattleParticipantType;
  judgeId: string;
  onSuccess: () => void;
}

const BattleVoteForm: React.FC<BattleVoteFormProps> = ({ battle, participant, judgeId, onSuccess }) => {
  const { toast } = useToast();
  const [criterias, setCriterias] = useState<BattleCriteriaType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  
  // Construction dynamique du schéma de validation en fonction des critères
  const generateVoteSchema = () => {
    const criteriaFields = {};
    criterias.forEach(criteria => {
      criteriaFields[criteria.id] = z.number().min(1, "Une note est requise").max(5, "La note maximale est 5");
    });
    
    return z.object({
      ...criteriaFields,
      comment: z.string().min(10, "Le commentaire doit contenir au moins 10 caractères").max(500, "Le commentaire ne doit pas dépasser 500 caractères"),
    });
  };
  
  // Récupérer les critères de vote depuis la base de données
  useEffect(() => {
    const fetchCriterias = async () => {
      try {
        const { data, error } = await supabase
          .from('battle_criterias')
          .select('*')
          .order('weight', { ascending: false });
          
        if (error) throw error;
        setCriterias(data as BattleCriteriaType[]);
      } catch (error) {
        console.error("Erreur lors de la récupération des critères:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les critères d'évaluation.",
          variant: "destructive",
        });
      }
    };
    
    fetchCriterias();
  }, [toast]);
  
  // Construction dynamique des valeurs par défaut du formulaire
  const generateDefaultValues = () => {
    const defaultValues = { comment: "" };
    criterias.forEach(criteria => {
      defaultValues[criteria.id] = 0;
    });
    return defaultValues;
  };
  
  // Configuration du formulaire avec schéma de validation dynamique
  const form = useForm({
    resolver: zodResolver(generateVoteSchema()),
    defaultValues: generateDefaultValues(),
  });
  
  // Gestion de la soumission du formulaire
  const onSubmit = async (data, submitAsDraft = false) => {
    try {
      setIsLoading(true);
      
      // 1. Insérer les notes pour chaque critère
      const votePromises = criterias.map(criteria => {
        return supabase
          .from('battle_votes_detailed')
          .upsert({
            battle_id: battle.id,
            judge_id: judgeId,
            participant_id: participant.user_id,
            criteria_id: criteria.id,
            score: data[criteria.id],
          });
      });
      
      // 2. Insérer le commentaire
      const commentPromise = supabase
        .from('battle_vote_comments')
        .upsert({
          battle_id: battle.id,
          judge_id: judgeId,
          participant_id: participant.user_id,
          comment: data.comment,
          is_draft: submitAsDraft,
        });
      
      // Exécuter toutes les requêtes en parallèle
      const results = await Promise.all([...votePromises, commentPromise]);
      
      // Vérifier s'il y a des erreurs
      const errors = results.filter(res => res.error).map(res => res.error);
      if (errors.length > 0) {
        throw new Error(errors.map(e => e.message).join(", "));
      }
      
      toast({
        title: submitAsDraft ? "Brouillon enregistré" : "Vote soumis avec succès",
        description: submitAsDraft 
          ? "Votre évaluation a été sauvegardée comme brouillon."
          : "Votre vote a été enregistré. Merci pour votre participation!",
      });
      
      onSuccess();
      
    } catch (error) {
      console.error("Erreur lors de la soumission du vote:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission de votre vote.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="space-y-6">
          {criterias.map(criteria => (
            <FormField
              key={criteria.id}
              control={form.control}
              name={criteria.id}
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <FormLabel>{criteria.name}</FormLabel>
                      <FormDescription>{criteria.description}</FormDescription>
                    </div>
                    <FormControl>
                      <Rating 
                        value={field.value} 
                        onChange={field.onChange}
                        size="md"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commentaire</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Partagez votre avis sur cette confiture..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Décrivez vos impressions sur cette confiture (entre 10 et 500 caractères).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1" 
            disabled={isLoading} 
            onClick={() => {
              setIsDraft(true);
              onSubmit(form.getValues(), true);
            }}
          >
            Enregistrer le brouillon
          </Button>
          <Button 
            type="button" 
            className="flex-1" 
            disabled={isLoading}
            onClick={() => {
              setIsDraft(false);
              form.handleSubmit((data) => onSubmit(data, false))();
            }}
          >
            {isLoading ? "Envoi en cours..." : "Soumettre mon vote"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BattleVoteForm;
