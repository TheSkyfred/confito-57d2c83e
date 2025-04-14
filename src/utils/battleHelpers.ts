
import { supabase } from '@/integrations/supabase/client';

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

    // Battle results might be null if no results are recorded yet
    // Extract the first (and should be only) battle_results object if exists
    if (battleData && battleData.battle_results && battleData.battle_results.length > 0) {
      battleData.battle_results = battleData.battle_results[0];
    } else {
      battleData.battle_results = null;
    }

    return battleData;
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
    query = query.eq('status', status);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data: battles, error } = await query;

  if (error) {
    console.error('Error fetching battles:', error);
    return [];
  }

  // Process the battle results to be in the expected format
  return battles.map(battle => {
    // Ensure we flatten the count objects
    const processedBattle = {
      ...battle,
      participant_count: battle.battle_participants[0]?.count || 0,
      judge_count: battle.battle_judges[0]?.count || 0,
      candidate_count: battle.battle_candidates[0]?.count || 0,
    };
    
    // Extract the first battle result if exists
    if (processedBattle.battle_results && processedBattle.battle_results.length > 0) {
      processedBattle.battle_results = processedBattle.battle_results[0];
    } else {
      processedBattle.battle_results = null;
    }
    
    return processedBattle;
  });
};
