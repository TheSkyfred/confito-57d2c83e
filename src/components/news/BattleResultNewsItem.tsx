
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, CalendarDays, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BattleResultType, NewBattleType } from '@/types/supabase';
import { getProfileInitials } from '@/utils/supabaseHelpers';

interface BattleResultNewsItemProps {
  result: BattleResultType & {
    battle?: NewBattleType;
    winner?: {
      username: string;
      avatar_url: string | null;
    };
    participant_a?: {
      username: string;
      avatar_url: string | null;
    };
    participant_b?: {
      username: string;
      avatar_url: string | null;
    };
  };
}

const BattleResultNewsItem: React.FC<BattleResultNewsItemProps> = ({ result }) => {
  if (!result.battle) {
    return null;
  }
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const getScoreDisplay = () => {
    const scoreA = result.participant_a_score || 0;
    const scoreB = result.participant_b_score || 0;
    
    return (
      <div className="flex items-center gap-2 font-mono">
        <span className={`font-bold ${scoreA > scoreB ? 'text-green-600' : ''}`}>{scoreA}</span>
        <span>-</span>
        <span className={`font-bold ${scoreB > scoreA ? 'text-green-600' : ''}`}>{scoreB}</span>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Résultat de battle</span>
              </CardDescription>
              <CardDescription className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDate(result.created_at)}</span>
              </CardDescription>
            </div>
            <CardTitle className="flex items-center gap-2">
              <span>Battle: {result.battle.theme}</span>
              {result.battle.is_featured && (
                <Badge variant="secondary" className="ml-2">Événement spécial</Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Participant A */}
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage 
                    src={result.participant_a?.avatar_url || undefined} 
                    alt={result.participant_a?.username || 'Participant A'} 
                  />
                  <AvatarFallback>{getProfileInitials(result.participant_a?.username)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{result.participant_a?.username || 'Participant A'}</div>
              </div>
              
              {/* Score */}
              <div className="flex flex-col items-center justify-center">
                {getScoreDisplay()}
                <div className="mt-2 text-center">
                  <div className="font-bold text-sm">Vainqueur</div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">{result.winner?.username || 'Inconnu'}</span>
                  </div>
                </div>
              </div>
              
              {/* Participant B */}
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage 
                    src={result.participant_b?.avatar_url || undefined} 
                    alt={result.participant_b?.username || 'Participant B'} 
                  />
                  <AvatarFallback>{getProfileInitials(result.participant_b?.username)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{result.participant_b?.username || 'Participant B'}</div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="ml-auto" asChild>
              <Link to={`/battles/${result.battle_id}`}>
                Voir les détails
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default BattleResultNewsItem;
