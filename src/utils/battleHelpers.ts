
import { supabase } from '@/integrations/supabase/client';
import { 
  BattleCandidateType, 
  BattleJudgeType, 
  BattleResultType, 
  BattleStarsType, 
  BattleStatus, 
  NewBattleType, 
  Json 
} from '@/types/supabase';

export const fetchBattleById = async (battleId: string) => {
  try {
    const { data: battleData, error } = await supabase
      .from('jam_battles_new')
      .select(`
        *,
        battle_participants:battle_participants(
          *,
          profile:user_id(username, avatar_url),
          jam:jam_id(*)
        ),
        battle_judges:battle_judges(
          *,
          profile:user_id(username, avatar_url)
        ),
        battle_candidates:battle_candidates(
          *,
          profile:user_id(username, avatar_url),
          reference_jam:reference_jam_id(*)
        ),
        battle_results:battle_results(
          *,
          winner:winner_id(username, avatar_url),
          participant_a:participant_a_id(username, avatar_url),
          participant_b:participant_b_id(username, avatar_url)
        )
      `)
      .eq('id', battleId)
      .single();

    if (error) {
      console.error('Error fetching battle:', error);
      return null;
    }

    // Convert Json constraints to Record<string, any>
    if (battleData && typeof battleData.constraints === 'string') {
      try {
        battleData.constraints = JSON.parse(battleData.constraints);
      } catch (e) {
        battleData.constraints = {}; // Default to empty object if parsing fails
      }
    }

    // Battle results might be null if no results are recorded yet
    // Extract the first (and should be only) battle_results object if exists
    if (battleData && battleData.battle_results && Array.isArray(battleData.battle_results) && battleData.battle_results.length > 0) {
      battleData.battle_results = battleData.battle_results[0];
    } else {
      battleData.battle_results = null;
    }

    // Use a type assertion to handle the complex structure from the database
    return battleData as unknown as NewBattleType;
  } catch (error) {
    console.error('Error fetching battle:', error);
    return null;
  }
};

export const fetchBattleList = async (status?: string) => {
  let query = supabase
    .from('jam_battles_new')
    .select(`
      *,
      battle_participants:battle_participants(count),
      battle_judges:battle_judges(count),
      battle_candidates:battle_candidates(count),
      battle_results:battle_results(
        *,
        winner:winner_id(username, avatar_url)
      )
    `);
  
  if (status) {
    query = query.eq('status', status as BattleStatus);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data: battles, error } = await query;

  if (error) {
    console.error('Error fetching battles:', error);
    return [];
  }

  // Process the battle results to be in the expected format
  return battles.map(battle => {
    // Ensure we convert string JSON to object
    if (typeof battle.constraints === 'string') {
      try {
        battle.constraints = JSON.parse(battle.constraints);
      } catch (e) {
        battle.constraints = {}; // Default to empty object if parsing fails
      }
    }
    
    // Ensure we flatten the count objects
    const processedBattle = {
      ...battle,
      participant_count: battle.battle_participants?.[0]?.count || 0,
      judge_count: battle.battle_judges?.[0]?.count || 0,
      candidate_count: battle.battle_candidates?.[0]?.count || 0,
    };
    
    // Extract the first battle result if exists
    if (processedBattle.battle_results && Array.isArray(processedBattle.battle_results) && processedBattle.battle_results.length > 0) {
      processedBattle.battle_results = processedBattle.battle_results[0];
    } else {
      processedBattle.battle_results = null;
    }
    
    // Use a type assertion to handle the database structure
    return processedBattle as unknown as NewBattleType;
  });
};

// Create functions missing from battleHelpers.ts

export const fetchUpcomingBattles = async (): Promise<NewBattleType[]> => {
  // Fetch battles with status "inscription" or "selection"
  const battles = await fetchBattleList();
  return battles.filter(b => b.status === 'inscription' || b.status === 'selection');
};

export const fetchActiveBattles = async (): Promise<NewBattleType[]> => {
  // Fetch battles with status "production", "envoi" or "vote"
  const battles = await fetchBattleList();
  return battles.filter(b => ['production', 'envoi', 'vote'].includes(b.status));
};

export const fetchCompletedBattles = async (): Promise<NewBattleType[]> => {
  // Fetch battles with status "termine"
  return await fetchBattleList('termine');
};

export const fetchBattleStars = async (limit: number = 10): Promise<BattleStarsType[]> => {
  const { data, error } = await supabase
    .from('battle_stars')
    .select(`
      *,
      profile:user_id(username, avatar_url)
    `)
    .order('total_score', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching battle stars:', error);
    return [];
  }
  
  return data as unknown as BattleStarsType[];
};

export const createNewBattle = async (battleData: Partial<NewBattleType>): Promise<NewBattleType | null> => {
  try {
    // Make sure constraints is an object, not a string
    if (typeof battleData.constraints === 'string') {
      try {
        battleData.constraints = JSON.parse(battleData.constraints);
      } catch (e) {
        battleData.constraints = {};
      }
    }
    
    // Ensure required fields are present for database insert
    const requiredFields = {
      theme: battleData.theme || 'Unnamed Battle',
      production_end_date: battleData.production_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      voting_end_date: battleData.voting_end_date || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      registration_end_date: battleData.registration_end_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const dataToInsert = {
      ...battleData,
      ...requiredFields
    };
    
    const { data, error } = await supabase
      .from('jam_battles_new')
      .insert(dataToInsert)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating battle:', error);
      throw error;
    }
    
    // Convert returned data to expected format
    if (data && typeof data.constraints === 'string') {
      try {
        data.constraints = JSON.parse(data.constraints);
      } catch (e) {
        data.constraints = {};
      }
    }
    
    return data as unknown as NewBattleType;
  } catch (error) {
    console.error('Error creating battle:', error);
    return null;
  }
};

// Add missing helper functions related to battle admin tasks
export const validateBattleJudge = async (judgeId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('battle_judges')
      .update({ is_validated: true })
      .eq('id', judgeId);
      
    return !error;
  } catch (error) {
    console.error('Error validating judge:', error);
    return false;
  }
};

export const validateBattleCandidate = async (
  candidateId: string, 
  battleId: string
): Promise<boolean> => {
  try {
    // First, get the candidate data
    const { data: candidateData, error: fetchError } = await supabase
      .from('battle_candidates')
      .select('*')
      .eq('id', candidateId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Update candidate to mark as selected
    const { error: updateError } = await supabase
      .from('battle_candidates')
      .update({ is_selected: true })
      .eq('id', candidateId);
    
    if (updateError) throw updateError;
    
    // Add the candidate to battle participants
    const { error: insertError } = await supabase
      .from('battle_participants')
      .insert({
        battle_id: battleId,
        user_id: candidateData.user_id
      });
    
    if (insertError) throw insertError;
    
    return true;
  } catch (error) {
    console.error('Error validating candidate:', error);
    return false;
  }
};

export const declareBattleWinner = async (
  battleId: string,
  winnerId: string,
  participantAId: string,
  participantAScore: number,
  participantBId: string,
  participantBScore: number
): Promise<boolean> => {
  try {
    // Check if result already exists
    const { data: existingResult } = await supabase
      .from('battle_results')
      .select('*')
      .eq('battle_id', battleId)
      .maybeSingle();
    
    if (existingResult) {
      // Update existing result
      const { error } = await supabase
        .from('battle_results')
        .update({
          winner_id: winnerId,
          participant_a_id: participantAId,
          participant_a_score: participantAScore,
          participant_b_id: participantBId,
          participant_b_score: participantBScore,
        })
        .eq('id', existingResult.id);
      
      if (error) throw error;
    } else {
      // Create new result
      const { error } = await supabase
        .from('battle_results')
        .insert({
          battle_id: battleId,
          winner_id: winnerId,
          participant_a_id: participantAId,
          participant_a_score: participantAScore,
          participant_b_id: participantBId,
          participant_b_score: participantBScore,
        });
      
      if (error) throw error;
    }
    
    // Update battle status to "termine"
    const { error: statusError } = await supabase
      .from('jam_battles_new')
      .update({ status: 'termine' as BattleStatus })
      .eq('id', battleId);
    
    if (statusError) throw statusError;
    
    return true;
  } catch (error) {
    console.error('Error declaring winner:', error);
    return false;
  }
};

export const distributeBattleRewards = async (battleId: string): Promise<{success: boolean, message: string}> => {
  try {
    // Get battle results
    const { data: battleResults, error: resultsError } = await supabase
      .from('battle_results')
      .select('*, battle:battle_id(*)')
      .eq('battle_id', battleId)
      .single();
    
    if (resultsError) throw resultsError;
    
    if (!battleResults || battleResults.reward_distributed) {
      return { 
        success: false, 
        message: battleResults?.reward_distributed 
          ? "Les récompenses ont déjà été distribuées." 
          : "Aucun résultat trouvé pour ce battle." 
      };
    }
    
    const rewardAmount = battleResults.battle?.reward_credits || 0;
    
    // Add credits to winner
    if (rewardAmount > 0) {
      const { error: creditError } = await supabase.rpc('add_user_credits', {
        user_id_param: battleResults.winner_id,
        amount_param: rewardAmount
      });
      
      if (creditError) throw creditError;
      
      // Add credit transaction record
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: battleResults.winner_id,
          amount: rewardAmount,
          description: `Récompense pour le Battle: ${battleResults.battle?.theme || 'Battle de confiture'}`
        });
      
      if (transactionError) throw transactionError;
    }
    
    // Update battle result to mark rewards as distributed
    const { error: updateError } = await supabase
      .from('battle_results')
      .update({ reward_distributed: true })
      .eq('id', battleResults.id);
    
    if (updateError) throw updateError;
    
    // Update battle stars for the winner
    await updateBattleStars(battleResults.winner_id, true);
    
    // Also update battle stars for the participants to increment their participation count
    if (battleResults.participant_a_id !== battleResults.winner_id) {
      await updateBattleStars(battleResults.participant_a_id, false);
    }
    if (battleResults.participant_b_id !== battleResults.winner_id && 
        battleResults.participant_b_id !== battleResults.participant_a_id) {
      await updateBattleStars(battleResults.participant_b_id, false);
    }
    
    return { 
      success: true, 
      message: `${rewardAmount} crédits ont été attribués au gagnant.` 
    };
  } catch (error) {
    console.error('Error distributing rewards:', error);
    return { 
      success: false, 
      message: "Une erreur est survenue lors de la distribution des récompenses." 
    };
  }
};

// Helper function to update battle stars
async function updateBattleStars(userId: string, isWinner: boolean): Promise<void> {
  try {
    // Check if user already has a battle_stars entry
    const { data: existingStars, error: fetchError } = await supabase
      .from('battle_stars')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    
    const now = new Date().toISOString();
    
    if (existingStars) {
      // Update existing entry
      const { error: updateError } = await supabase
        .from('battle_stars')
        .update({
          participations: existingStars.participations + 1,
          victories: isWinner ? existingStars.victories + 1 : existingStars.victories,
          last_battle_date: now
        })
        .eq('id', existingStars.id);
      
      if (updateError) throw updateError;
    } else {
      // Create new entry
      const { error: insertError } = await supabase
        .from('battle_stars')
        .insert({
          user_id: userId,
          participations: 1,
          victories: isWinner ? 1 : 0,
          last_battle_date: now
        });
      
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error updating battle stars:', error);
  }
}

// Reusable eligibility check hook with checkEligibility function
export const useEligibilityCheck = () => {
  const checkEligibility = async () => {
    // Add eligibility check logic here
    return true;
  };
  
  return { 
    isEligible: true, 
    loading: false, 
    error: null,
    checkEligibility
  };
};
