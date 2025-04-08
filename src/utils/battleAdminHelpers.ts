
import { supabase } from '@/integrations/supabase/client';
import { BattleCandidateType, BattleJudgeType } from '@/types/supabase';

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
