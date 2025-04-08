
import { supabase } from '@/integrations/supabase/client';
import { 
  NewBattleType, 
  BattleParticipantType, 
  BattleCandidateType,
  BattleJudgeType,
  BattleVoteDetailedType,
  BattleStarsType
} from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

// Fonction pour récupérer tous les battles
export const fetchAllBattles = async () => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as NewBattleType[];
  } catch (error: any) {
    console.error('Erreur lors de la récupération des battles:', error.message);
    return [];
  }
};

// Fonction pour récupérer les battles à venir
export const fetchUpcomingBattles = async () => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select('*')
      .in('status', ['inscription', 'selection'])
      .order('registration_end_date', { ascending: true });
      
    if (error) throw error;
    return data as NewBattleType[];
  } catch (error: any) {
    console.error('Erreur lors de la récupération des battles à venir:', error.message);
    return [];
  }
};

// Fonction pour récupérer les battles en cours
export const fetchActiveBattles = async () => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select('*')
      .in('status', ['production', 'envoi', 'vote'])
      .order('voting_end_date', { ascending: true });
      
    if (error) throw error;
    return data as NewBattleType[];
  } catch (error: any) {
    console.error('Erreur lors de la récupération des battles en cours:', error.message);
    return [];
  }
};

// Fonction pour récupérer les battles terminés
export const fetchCompletedBattles = async () => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select(`
        *,
        battle_results (*)
      `)
      .eq('status', 'termine')
      .order('voting_end_date', { ascending: false });
      
    if (error) throw error;
    return data as NewBattleType[];
  } catch (error: any) {
    console.error('Erreur lors de la récupération des battles terminés:', error.message);
    return [];
  }
};

// Fonction pour récupérer un battle spécifique
export const fetchBattleById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select(`
        *,
        battle_participants (
          *,
          profile:profiles(*),
          jam:jams(*)
        ),
        battle_judges (
          *,
          profile:profiles(*)
        ),
        battle_candidates (
          *,
          profile:profiles(*),
          reference_jam:jams(*)
        ),
        battle_results (*)
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as NewBattleType;
  } catch (error: any) {
    console.error(`Erreur lors de la récupération du battle ${id}:`, error.message);
    return null;
  }
};

// Fonction pour postuler à un battle
export const applyToBattle = async (battleId: string, motivation: string, referenceJamId: string | null) => {
  try {
    const { error } = await supabase
      .from('battle_candidates')
      .insert({
        battle_id: battleId,
        user_id: supabase.auth.getUser().then(res => res.data.user?.id),
        motivation,
        reference_jam_id: referenceJamId
      });
      
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erreur lors de la candidature au battle:', error.message);
    return false;
  }
};

// Fonction pour s'inscrire comme juge
export const applyAsJudge = async (battleId: string) => {
  try {
    const { error } = await supabase
      .from('battle_judges')
      .insert({
        battle_id: battleId,
        user_id: supabase.auth.getUser().then(res => res.data.user?.id)
      });
      
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription comme juge:', error.message);
    return false;
  }
};

// Fonction pour récupérer les Battle Stars
export const fetchBattleStars = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('battle_stars')
      .select(`
        *,
        profile:profiles(*)
      `)
      .order('total_score', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data as BattleStarsType[];
  } catch (error: any) {
    console.error('Erreur lors de la récupération des Battle Stars:', error.message);
    return [];
  }
};

// Fonction pour créer un nouveau battle (admin uniquement)
export const createNewBattle = async (battleData: Omit<NewBattleType, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .insert(battleData)
      .select()
      .single();
      
    if (error) throw error;
    return data as NewBattleType;
  } catch (error: any) {
    console.error('Erreur lors de la création du battle:', error.message);
    return null;
  }
};

// Hook pour vérifier si l'utilisateur est éligible pour participer à un battle
export const useEligibilityCheck = () => {
  const { toast } = useToast();
  
  const checkEligibility = async (battleId: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast({
          title: "Non connecté",
          description: "Vous devez être connecté pour postuler à un battle.",
          variant: "destructive"
        });
        return false;
      }
      
      const userId = user.data.user.id;
      
      // Vérifier si l'utilisateur a déjà postulé
      const { data: existingApplication } = await supabase
        .from('battle_candidates')
        .select()
        .eq('battle_id', battleId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (existingApplication) {
        toast({
          title: "Déjà candidat",
          description: "Vous avez déjà postulé à ce battle.",
          variant: "destructive"
        });
        return false;
      }
      
      // Vérifier le nombre minimum de confitures requises
      const { data: battle } = await supabase
        .from('jam_battles_new')
        .select('min_jams_required')
        .eq('id', battleId)
        .single();
        
      const { count } = await supabase
        .from('jams')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', userId);
        
      if (battle && count !== null && count < battle.min_jams_required) {
        toast({
          title: "Non éligible",
          description: `Vous devez avoir créé au moins ${battle.min_jams_required} confitures pour postuler à ce battle.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
      
    } catch (error: any) {
      console.error("Erreur lors de la vérification d'éligibilité:", error.message);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la vérification de votre éligibilité.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return { checkEligibility };
};
