import { supabase } from '@/integrations/supabase/client';
import { NewBattleType, BattleCandidateType, BattleJudgeType, BattleParticipantType, ProfileType } from '@/types/supabase';
import { format, parseISO, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Fetches all battles from the database.
 * @returns {Promise<NewBattleType[]>} A promise that resolves to an array of battle objects.
 */
export const fetchAllBattles = async (): Promise<NewBattleType[]> => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching battles:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchAllBattles:', error);
    return [];
  }
};

/**
 * Fetches a battle by its ID from the database.
 * @param {string} id The ID of the battle to fetch.
 * @returns {Promise<NewBattleType | null>} A promise that resolves to the battle object or null if not found.
 */
export const fetchBattleById = async (id: string): Promise<NewBattleType | null> => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select(`
        *,
        battle_participants (*, profile:user_id (*, *)),
        battle_judges (*, profile:user_id (*, *)),
        battle_candidates (*, profile:user_id (*, *)),
        battle_results (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching battle by ID:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in fetchBattleById:', error);
    return null;
  }
};

/**
 * Fetches featured battles from the database.
 * @returns {Promise<NewBattleType[]>} A promise that resolves to an array of featured battle objects.
 */
export const fetchFeaturedBattles = async (): Promise<NewBattleType[]> => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured battles:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchFeaturedBattles:', error);
    return [];
  }
};

/**
 * Fetches battles by status from the database.
 * @param {string} status The status of the battles to fetch.
 * @returns {Promise<NewBattleType[]>} A promise that resolves to an array of battle objects with the specified status.
 */
export const fetchBattlesByStatus = async (status: string): Promise<NewBattleType[]> => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching battles with status ${status}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchBattlesByStatus:', error);
    return [];
  }
};

/**
 * Fetches battles that are currently open for registration.
 * @returns {Promise<NewBattleType[]>} A promise that resolves to an array of battle objects open for registration.
 */
export const fetchRegistrationBattles = async (): Promise<NewBattleType[]> => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select('*')
      .eq('status', 'inscription')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching registration battles:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchRegistrationBattles:', error);
    return [];
  }
};

/**
 * Fetches battles that are in the voting phase.
 * @returns {Promise<NewBattleType[]>} A promise that resolves to an array of battle objects in the voting phase.
 */
export const fetchVotingBattles = async (): Promise<NewBattleType[]> => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select('*')
      .eq('status', 'vote')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching voting battles:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchVotingBattles:', error);
    return [];
  }
};

/**
 * Fetches battles that are completed.
 * @returns {Promise<NewBattleType[]>} A promise that resolves to an array of battle objects that are completed.
 */
export const fetchCompletedBattles = async (): Promise<NewBattleType[]> => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .select('*')
      .eq('status', 'termine')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed battles:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCompletedBattles:', error);
    return [];
  }
};

/**
 * Fetches the participants of a specific battle.
 * @param {string} battleId The ID of the battle.
 * @returns {Promise<BattleParticipantType[]>} A promise that resolves to an array of participant objects.
 */
export const fetchBattleParticipants = async (battleId: string): Promise<BattleParticipantType[]> => {
  try {
    const { data, error } = await supabase
      .from('battle_participants')
      .select('*')
      .eq('battle_id', battleId);

    if (error) {
      console.error(`Error fetching participants for battle ${battleId}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchBattleParticipants:', error);
    return [];
  }
};

/**
 * Fetches the judges of a specific battle.
 * @param {string} battleId The ID of the battle.
 * @returns {Promise<BattleJudgeType[]>} A promise that resolves to an array of judge objects.
 */
export const fetchBattleJudges = async (battleId: string): Promise<BattleJudgeType[]> => {
  try {
    const { data, error } = await supabase
      .from('battle_judges')
      .select('*')
      .eq('battle_id', battleId);

    if (error) {
      console.error(`Error fetching judges for battle ${battleId}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchBattleJudges:', error);
    return [];
  }
};

/**
 * Fetches the candidates for a specific battle.
 * @param {string} battleId The ID of the battle.
 * @returns {Promise<BattleCandidateType[]>} A promise that resolves to an array of candidate objects.
 */
export const fetchBattleCandidates = async (battleId: string): Promise<BattleCandidateType[]> => {
  try {
    const { data, error } = await supabase
      .from('battle_candidates')
      .select('*')
      .eq('battle_id', battleId);

    if (error) {
      console.error(`Error fetching candidates for battle ${battleId}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchBattleCandidates:', error);
    return [];
  }
};

/**
 * Adds a participant to a specific battle.
 * @param {string} battleId The ID of the battle.
 * @param {string} userId The ID of the user to add as a participant.
 * @returns {Promise<BattleParticipantType | null>} A promise that resolves to the new participant object or null if there was an error.
 */
export const addBattleParticipant = async (battleId: string, userId: string): Promise<BattleParticipantType | null> => {
  try {
    const { data, error } = await supabase
      .from('battle_participants')
      .insert([{ battle_id: battleId, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error(`Error adding participant ${userId} to battle ${battleId}:`, error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in addBattleParticipant:', error);
    return null;
  }
};

/**
 * Adds a judge to a specific battle.
 * @param {string} battleId The ID of the battle.
 * @param {string} userId The ID of the user to add as a judge.
 * @returns {Promise<BattleJudgeType | null>} A promise that resolves to the new judge object or null if there was an error.
 */
export const addBattleJudge = async (battleId: string, userId: string): Promise<BattleJudgeType | null> => {
  try {
    const { data, error } = await supabase
      .from('battle_judges')
      .insert([{ battle_id: battleId, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error(`Error adding judge ${userId} to battle ${battleId}:`, error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in addBattleJudge:', error);
    return null;
  }
};

/**
 * Adds a candidate to a specific battle.
 * @param {string} battleId The ID of the battle.
 * @param {string} userId The ID of the user to add as a candidate.
 * @param {string} motivation The motivation of the candidate.
 * @returns {Promise<BattleCandidateType | null>} A promise that resolves to the new candidate object or null if there was an error.
 */
export const addBattleCandidate = async (
  battleId: string,
  userId: string,
  motivation: string,
  referenceJamId: string | null
): Promise<BattleCandidateType | null> => {
  try {
    const { data, error } = await supabase
      .from('battle_candidates')
      .insert([{ battle_id: battleId, user_id: userId, motivation, reference_jam_id: referenceJamId }])
      .select()
      .single();

    if (error) {
      console.error(`Error adding candidate ${userId} to battle ${battleId}:`, error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in addBattleCandidate:', error);
    return null;
  }
};

/**
 * Updates a battle in the database.
 * @param {string} battleId The ID of the battle to update.
 * @param {Partial<NewBattleType>} updates An object containing the fields to update.
 * @returns {Promise<NewBattleType | null>} A promise that resolves to the updated battle object or null if there was an error.
 */
export const updateBattle = async (
  battleId: string,
  updates: Partial<NewBattleType>
): Promise<NewBattleType | null> => {
  try {
    const { data, error } = await supabase
      .from('jam_battles_new')
      .update(updates)
      .eq('id', battleId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating battle ${battleId}:`, error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in updateBattle:', error);
    return null;
  }
};

/**
 * Removes a participant from a specific battle.
 * @param {string} battleId The ID of the battle.
 * @param {string} userId The ID of the user to remove as a participant.
 * @returns {Promise<boolean>} A promise that resolves to true if the participant was successfully removed, or false if there was an error.
 */
export const removeBattleParticipant = async (battleId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('battle_participants')
      .delete()
      .eq('battle_id', battleId)
      .eq('user_id', userId);

    if (error) {
      console.error(`Error removing participant ${userId} from battle ${battleId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeBattleParticipant:', error);
    return false;
  }
};

/**
 * Removes a judge from a specific battle.
 * @param {string} battleId The ID of the battle.
 * @param {string} userId The ID of the user to remove as a judge.
 * @returns {Promise<boolean>} A promise that resolves to true if the judge was successfully removed, or false if there was an error.
 */
export const removeBattleJudge = async (battleId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('battle_judges')
      .delete()
      .eq('battle_id', battleId)
      .eq('user_id', userId);

    if (error) {
      console.error(`Error removing judge ${userId} from battle ${battleId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeBattleJudge:', error);
    return false;
  }
};

/**
 * Removes a candidate from a specific battle.
 * @param {string} battleId The ID of the battle.
 * @param {string} userId The ID of the user to remove as a candidate.
 * @returns {Promise<boolean>} A promise that resolves to true if the candidate was successfully removed, or false if there was an error.
 */
export const removeBattleCandidate = async (battleId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('battle_candidates')
      .delete()
      .eq('battle_id', battleId)
      .eq('user_id', userId);

    if (error) {
      console.error(`Error removing candidate ${userId} from battle ${battleId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeBattleCandidate:', error);
    return false;
  }
};

/**
 * Publishes a battle, making it visible to the public.
 * @param {string} battleId The ID of the battle to publish.
 * @returns {Promise<boolean>} A promise that resolves to true if the battle was successfully published, or false if there was an error.
 */
export const publishBattle = async (battleId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('jam_battles_new')
      .update({ is_active: true })
      .eq('id', battleId);

    if (error) {
      console.error(`Error publishing battle ${battleId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in publishBattle:', error);
    return false;
  }
};

/**
 * Unpublishes a battle, hiding it from the public.
 * @param {string} battleId The ID of the battle to unpublish.
 * @returns {Promise<boolean>} A promise that resolves to true if the battle was successfully unpublished, or false if there was an error.
 */
export const unpublishBattle = async (battleId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('jam_battles_new')
      .update({ is_active: false })
      .eq('id', battleId);

    if (error) {
      console.error(`Error unpublishing battle ${battleId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in unpublishBattle:', error);
    return false;
  }
};

/**
 * Sets a battle as featured, highlighting it for users.
 * @param {string} battleId The ID of the battle to set as featured.
 * @returns {Promise<boolean>} A promise that resolves to true if the battle was successfully set as featured, or false if there was an error.
 */
export const setBattleAsFeatured = async (battleId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('jam_battles_new')
      .update({ is_featured: true })
      .eq('id', battleId);

    if (error) {
      console.error(`Error setting battle ${battleId} as featured:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in setBattleAsFeatured:', error);
    return false;
  }
};

/**
 * Removes the featured status from a battle.
 * @param {string} battleId The ID of the battle to remove the featured status from.
 * @returns {Promise<boolean>} A promise that resolves to true if the featured status was successfully removed, or false if there was an error.
 */
export const removeBattleAsFeatured = async (battleId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('jam_battles_new')
      .update({ is_featured: false })
      .eq('id', battleId);

    if (error) {
      console.error(`Error removing featured status from battle ${battleId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeBattleAsFeatured:', error);
    return false;
  }
};

/**
 * Deletes a battle from the database.
 * @param {string} battleId The ID of the battle to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the battle was successfully deleted, or false if there was an error.
 */
export const deleteBattle = async (battleId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('jam_battles_new')
      .delete()
      .eq('id', battleId);

    if (error) {
      console.error(`Error deleting battle ${battleId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteBattle:', error);
    return false;
  }
};

/**
 * Validates if a user is an admin for battle management.
 * @param {string} userId The ID of the user to validate.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is an admin, or false if not.
 */
export const validateBattleAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Error validating admin status for user ${userId}:`, error);
      return false;
    }

    return data?.role === 'admin';
  } catch (error) {
    console.error('Error in validateBattleAdmin:', error);
    return false;
  }
};

/**
 * Checks if a user is eligible to participate in a battle based on certain criteria.
 * @param {string} userId The ID of the user to check for eligibility.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is eligible, or false if not.
 */
export const checkBattleEligibility = async (userId: string): Promise<boolean> => {
  try {
    // Implement your eligibility criteria here
    // This is just a placeholder, replace with your actual logic

    // Example: Check if the user has a certain number of credits
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Error checking eligibility for user ${userId}:`, error);
      return false;
    }

    // Example: User must have at least 100 credits to be eligible
    return (data?.credits || 0) >= 100;
  } catch (error) {
    console.error('Error in checkBattleEligibility:', error);
    return false;
  }
};

/**
 * Formats a date string into a human-readable format.
 * @param {string} dateString The date string to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'PPP', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Calculates the time remaining until a specific date.
 * @param {string} endDate The end date string.
 * @returns {string} A string representing the time remaining.
 */
export const calculateTimeRemaining = (endDate: string): string => {
  try {
    const end = parseISO(endDate);
    const now = new Date();

    if (isPast(end)) {
      return 'Battle terminé';
    }

    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));

    return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
  } catch (error) {
    console.error('Error calculating time remaining:', error);
    return 'Invalid Date';
  }
};

/**
 * Checks if the current date is within the registration period of a battle.
 * @param {string} registrationStartDate The registration start date string.
 * @param {string} registrationEndDate The registration end date string.
 * @returns {boolean} True if the current date is within the registration period, false otherwise.
 */
export const isWithinRegistrationPeriod = (registrationStartDate: string, registrationEndDate: string): boolean => {
  try {
    const start = parseISO(registrationStartDate);
    const end = parseISO(registrationEndDate);
    const now = new Date();

    return now >= start && now <= end;
  } catch (error) {
    console.error('Error checking registration period:', error);
    return false;
  }
};

/**
 * Checks if the current date is within the voting period of a battle.
 * @param {string} votingEndDate The voting end date string.
 * @returns {boolean} True if the current date is within the voting period, false otherwise.
 */
export const isWithinVotingPeriod = (votingEndDate: string): boolean => {
  try {
    const end = parseISO(votingEndDate);
    const now = new Date();

    return now <= end;
  } catch (error) {
    console.error('Error checking voting period:', error);
    return false;
  }
};

/**
 * Checks if the current date is after the voting period of a battle.
 * @param {string} votingEndDate The voting end date string.
 * @returns {boolean} True if the current date is after the voting period, false otherwise.
 */
export const isAfterVotingPeriod = (votingEndDate: string): boolean => {
  try {
    const end = parseISO(votingEndDate);
    const now = new Date();

    return now > end;
  } catch (error) {
    console.error('Error checking voting period:', error);
    return false;
  }
};

/**
 * Distributes rewards to the winner of a battle.
 * @param {string} battleId The ID of the battle.
 * @param {string} winnerId The ID of the winner.
 * @returns {Promise<{ success: boolean; error?: any }>} An object indicating success or failure, and an error message if applicable.
 */
export const distributeBattleRewards = async (battleId: string, winnerId: string) => {
  try {
    // Get battle details
    const { data: battle } = await supabase
      .from('jam_battles_new')
      .select('*')
      .eq('id', battleId)
      .single();
    
    if (!battle) throw new Error('Battle not found');
    
    // Update battle results to mark reward as distributed
    const { error: updateError } = await supabase
      .from('battle_results')
      .update({ reward_distributed: true })
      .eq('battle_id', battleId);
    
    if (updateError) throw updateError;
    
    // Add credits to winner's profile
    const { error: creditsError } = await supabase.rpc('calculate_recipe_average_rating', {
      recipe_uuid: winnerId
    });
    
    // Use a different approach to add credits since rpc has limited functions
    const { data: winnerData } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', winnerId)
      .single();
      
    if (winnerData) {
      const newCredits = winnerData.credits + battle.reward_credits;
      
      await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', winnerId);
        
      // Record the transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: winnerId,
          amount: battle.reward_credits,
          description: `Reward for winning battle: ${battle.theme}`
        });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error distributing rewards:', error);
    return { success: false, error };
  }
};

/**
 * A hook that checks if the user is eligible to participate in battles.
 * @returns {{ isEligible: boolean; checkEligibility: () => Promise<boolean> }} An object containing the eligibility status and a function to check eligibility.
 */
export const useEligibilityCheck = () => {
  const [isEligible, setIsEligible] = React.useState(false);

  const checkEligibility = async (): Promise<boolean> => {
    // Replace 'YOUR_USER_ID' with the actual user ID or fetch it from your authentication context
    const userId = 'YOUR_USER_ID'; // Example: useAuth().user?.id;
    const eligibility = await checkBattleEligibility(userId);
    setIsEligible(eligibility);
    return eligibility;
  };

  return { isEligible, checkEligibility };
};
