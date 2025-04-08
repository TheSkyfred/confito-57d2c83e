
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BattleStarsType } from '@/types/supabase';
import { getProfileInitials } from '@/utils/supabaseHelpers';
import { Trophy, Award, Medal } from 'lucide-react';

interface BattleStarProps {
  battleStar: BattleStarsType;
  rank: number;
}

const BattleStar: React.FC<BattleStarProps> = ({ battleStar, rank }) => {
  if (!battleStar.profile) return null;
  
  const getRankDecoration = () => {
    switch (rank) {
      case 1:
        return (
          <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow-md">
            <Trophy className="h-4 w-4 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center shadow-md">
            <Medal className="h-3.5 w-3.5 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center shadow-md">
            <Award className="h-3.5 w-3.5 text-white" />
          </div>
        );
      default:
        return (
          <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-muted flex items-center justify-center shadow-md">
            <span className="text-xs font-medium">{rank}</span>
          </div>
        );
    }
  };
  
  const getVictoriesText = () => {
    switch (battleStar.victories) {
      case 0: return "Pas encore de victoire";
      case 1: return "1 victoire";
      default: return `${battleStar.victories} victoires`;
    }
  };
  
  const getParticipationsText = () => {
    switch (battleStar.participations) {
      case 0: return "Pas encore de participation";
      case 1: return "1 participation";
      default: return `${battleStar.participations} participations`;
    }
  };

  return (
    <Link to={`/profile/${battleStar.user_id}`}>
      <div className="relative p-4 border rounded-lg hover:bg-muted/30 transition-colors flex items-center space-x-4">
        {getRankDecoration()}
        
        <Avatar className="h-10 w-10 border border-muted-foreground/20">
          <AvatarImage src={battleStar.profile.avatar_url || undefined} alt={battleStar.profile.username} />
          <AvatarFallback>{getProfileInitials(battleStar.profile.username)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{battleStar.profile.username}</p>
          <p className="text-xs text-muted-foreground truncate">{getVictoriesText()} • {getParticipationsText()}</p>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-lg font-bold">{battleStar.total_score}</span>
          <span className="text-xs text-muted-foreground">points</span>
        </div>
      </div>
    </Link>
  );
};

export default BattleStar;
