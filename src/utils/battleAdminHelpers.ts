
import { supabase } from '@/integrations/supabase/client';

/**
 * Validate a battle judge
 */
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

/**
 * Validate a battle candidate
 */
export const validateBattleCandidate = async (candidateId: string, battleId: string): Promise<boolean> => {
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

/**
 * Declare a battle winner
 */
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
      .update({ status: 'termine' })
      .eq('id', battleId);
    
    if (statusError) throw statusError;
    
    return true;
  } catch (error) {
    console.error('Error declaring winner:', error);
    return false;
  }
};

/**
 * Distribute battle rewards
 */
export const distributeBattleRewards = async (battleId: string): Promise<{ success: boolean, message: string }> => {
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
      // Update user credits
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', battleResults.winner_id)
        .single();
      
      if (userError) throw userError;
      
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ 
          credits: (userData.credits || 0) + rewardAmount 
        })
        .eq('id', battleResults.winner_id);
      
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
