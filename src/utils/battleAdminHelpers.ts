
import { supabase } from '@/integrations/supabase/client';
import { BattleCandidateType, BattleJudgeType, BattleRewardType } from '@/types/supabase';

// Validate a candidate for participation in a battle
export const validateBattleCandidate = async (candidateId: string, battleId: string) => {
  try {
    // 1. Mark candidate as selected
    const { error: selectionError } = await supabase
      .from('battle_candidates')
      .update({ is_selected: true })
      .eq('id', candidateId);
      
    if (selectionError) throw selectionError;
    
    // 2. Get candidate details to add them as a participant
    const { data: candidate, error: candidateError } = await supabase
      .from('battle_candidates')
      .select('user_id')
      .eq('id', candidateId)
      .single();
      
    if (candidateError || !candidate) throw candidateError || new Error('Candidate not found');
    
    // 3. Add the candidate as a participant
    const { error: participantError } = await supabase
      .from('battle_participants')
      .insert({
        battle_id: battleId,
        user_id: candidate.user_id
      });
      
    if (participantError) throw participantError;
    
    return true;
  } catch (error: any) {
    console.error('Error validating battle candidate:', error.message);
    return false;
  }
};

// Validate a judge for a battle
export const validateBattleJudge = async (judgeId: string) => {
  try {
    // Just mark the judge as validated
    const { error } = await supabase
      .from('battle_judges')
      .update({ is_validated: true })
      .eq('id', judgeId);
      
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error validating battle judge:', error.message);
    return false;
  }
};

// Désigner un gagnant et enregistrer les résultats
export const declareBattleWinner = async (
  battleId: string, 
  winnerParticipantId: string, 
  participantAId: string, 
  participantAScore: number, 
  participantBId: string, 
  participantBScore: number
) => {
  try {
    // 1. Get user_id from participant
    const { data: winnerParticipant, error: winnerError } = await supabase
      .from('battle_participants')
      .select('user_id')
      .eq('id', winnerParticipantId)
      .single();
      
    if (winnerError || !winnerParticipant) throw winnerError || new Error('Winner participant not found');
    
    // 2. Get participant A user_id
    const { data: participantA, error: participantAError } = await supabase
      .from('battle_participants')
      .select('user_id')
      .eq('id', participantAId)
      .single();
      
    if (participantAError || !participantA) throw participantAError || new Error('Participant A not found');
    
    // 3. Get participant B user_id
    const { data: participantB, error: participantBError } = await supabase
      .from('battle_participants')
      .select('user_id')
      .eq('id', participantBId)
      .single();
      
    if (participantBError || !participantB) throw participantBError || new Error('Participant B not found');
    
    // 4. Create battle result
    const { error: resultError } = await supabase
      .from('battle_results')
      .insert({
        battle_id: battleId,
        winner_id: winnerParticipant.user_id,
        participant_a_id: participantA.user_id,
        participant_b_id: participantB.user_id,
        participant_a_score: participantAScore,
        participant_b_score: participantBScore,
        reward_distributed: false
      });
      
    if (resultError) throw resultError;
    
    // 5. Update battle status to "termine"
    const { error: statusError } = await supabase
      .from('jam_battles_new')
      .update({ status: 'termine' })
      .eq('id', battleId);
      
    if (statusError) throw statusError;
    
    return true;
  } catch (error: any) {
    console.error('Error declaring battle winner:', error.message);
    return false;
  }
};

// Distribuer les récompenses au gagnant
export const distributeBattleRewards = async (battleId: string) => {
  try {
    // 1. Get battle result
    const { data: battleResult, error: resultError } = await supabase
      .from('battle_results')
      .select(`
        winner_id,
        battle_id,
        reward_distributed
      `)
      .eq('battle_id', battleId)
      .single();
      
    if (resultError || !battleResult) throw resultError || new Error('Battle result not found');
    
    // 2. Check if reward already distributed
    if (battleResult.reward_distributed) {
      return { success: false, message: 'Reward already distributed' };
    }
    
    // 3. Get all rewards for this battle
    const { data: battleRewards, error: rewardsError } = await supabase
      .from('battle_rewards')
      .select('*')
      .eq('battle_id', battleId)
      .eq('is_distributed', false);
      
    if (rewardsError) throw rewardsError;
    
    // If no rewards are configured, fall back to default credits from jam_battles_new
    if (!battleRewards || battleRewards.length === 0) {
      const { data: battle, error: battleError } = await supabase
        .from('jam_battles_new')
        .select('reward_credits')
        .eq('id', battleId)
        .single();
        
      if (battleError) throw battleError;
      
      // No rewards to distribute
      const rewardCredits = battle?.reward_credits || 0;
      if (rewardCredits <= 0) {
        return { success: false, message: 'No reward to distribute' };
      }
      
      // Add credits to winner
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', battleResult.winner_id)
        .single();
        
      if (profileError) throw profileError;
      
      // Update the user credits
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          credits: (userProfile.credits || 0) + rewardCredits 
        })
        .eq('id', battleResult.winner_id);
        
      if (updateError) throw updateError;
      
      // Create credit transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: battleResult.winner_id,
          amount: rewardCredits,
          description: `Récompense pour avoir gagné le battle #${battleId}`
        });
        
      if (transactionError) throw transactionError;
    } else {
      // Distribute all configured rewards
      for (const reward of battleRewards) {
        if (reward.reward_type === 'credits' && reward.reward_amount > 0) {
          // Add credits to winner
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', battleResult.winner_id)
            .single();
            
          if (profileError) throw profileError;
          
          // Update the user credits
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              credits: (userProfile.credits || 0) + reward.reward_amount 
            })
            .eq('id', battleResult.winner_id);
            
          if (updateError) throw updateError;
          
          // Create credit transaction
          const { error: transactionError } = await supabase
            .from('credit_transactions')
            .insert({
              user_id: battleResult.winner_id,
              amount: reward.reward_amount,
              description: reward.reward_description || `Récompense pour avoir gagné le battle #${battleId}`
            });
            
          if (transactionError) throw transactionError;
        }
        
        // Handle other reward types here (badges, products, etc.)
        if (reward.reward_type === 'badge' && reward.reward_badge_id) {
          // Award badge to winner
          const { error: badgeError } = await supabase
            .from('user_badges')
            .insert({
              user_id: battleResult.winner_id,
              badge_id: reward.reward_badge_id
            });
            
          if (badgeError) throw badgeError;
        }
        
        // Mark this reward as distributed
        const { error: updateRewardError } = await supabase
          .from('battle_rewards')
          .update({ 
            is_distributed: true,
            distributed_at: new Date().toISOString()
          })
          .eq('id', reward.id);
          
        if (updateRewardError) throw updateRewardError;
      }
    }
    
    // 6. Mark reward as distributed
    const { error: updateResultError } = await supabase
      .from('battle_results')
      .update({ reward_distributed: true })
      .eq('battle_id', battleId);
      
    if (updateResultError) throw updateResultError;
    
    return { success: true, message: 'Reward distributed successfully' };
  } catch (error: any) {
    console.error('Error distributing battle rewards:', error.message);
    return { success: false, message: error.message };
  }
};

// Add a battle reward
export const addBattleReward = async (battleId: string, rewardData: Omit<BattleRewardType, 'id' | 'created_at' | 'updated_at' | 'battle_id' | 'is_distributed' | 'distributed_at'>) => {
  try {
    const { data, error } = await supabase
      .from('battle_rewards')
      .insert({
        battle_id: battleId,
        reward_type: rewardData.reward_type,
        reward_amount: rewardData.reward_amount,
        reward_description: rewardData.reward_description,
        reward_image_url: rewardData.reward_image_url,
        reward_badge_id: rewardData.reward_badge_id,
        reward_product_id: rewardData.reward_product_id,
        is_distributed: false
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error adding battle reward:', error.message);
    return { success: false, error: error.message };
  }
};

// Get all rewards for a battle
export const getBattleRewards = async (battleId: string) => {
  try {
    const { data, error } = await supabase
      .from('battle_rewards')
      .select('*')
      .eq('battle_id', battleId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error getting battle rewards:', error.message);
    return [];
  }
};
