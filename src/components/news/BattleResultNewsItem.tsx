
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Trophy, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BattleResultType, NewBattleType, ProfileType } from '@/types/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getProfileInitials } from '@/utils/supabaseHelpers';

type BattleResultNewsItemProps = {
  result: BattleResultType & { 
    battle?: NewBattleType;
    winner?: ProfileType;
    participant_a?: ProfileType;
    participant_b?: ProfileType;
  }
};

const BattleResultNewsItem = ({ result }: BattleResultNewsItemProps) => {
  const battleUrl = `/battles/${result.battle_id}`;
  const winnerName = result.winner?.username || "Participant";
  const theme = result.battle?.theme || "Confiture Battle";
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(result.created_at), 'PPP', { locale: fr })}</span>
        </div>
        <h3 className="text-xl font-semibold">
          Résultats du battle: {theme}
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={result.winner?.avatar_url || undefined} alt={winnerName} />
                <AvatarFallback>{getProfileInitials(winnerName)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="font-medium mt-1">{winnerName}</p>
            <p className="text-sm text-muted-foreground">Gagnant</p>
          </div>
          
          <div className="flex-grow">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg flex flex-col items-center">
                <Avatar className="h-10 w-10 mb-1">
                  <AvatarImage src={result.participant_a?.avatar_url || undefined} alt={result.participant_a?.username || "Participant A"} />
                  <AvatarFallback>
                    {getProfileInitials(result.participant_a?.username || "PA")}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{result.participant_a?.username || "Participant A"}</p>
                <p className="text-lg font-bold">{result.participant_a_score} pts</p>
              </div>
              
              <div className="p-3 border rounded-lg flex flex-col items-center">
                <Avatar className="h-10 w-10 mb-1">
                  <AvatarImage src={result.participant_b?.avatar_url || undefined} alt={result.participant_b?.username || "Participant B"} />
                  <AvatarFallback>
                    {getProfileInitials(result.participant_b?.username || "PB")}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{result.participant_b?.username || "Participant B"}</p>
                <p className="text-lg font-bold">{result.participant_b_score} pts</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild>
          <Link to={battleUrl}>
            Voir le détail du battle
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BattleResultNewsItem;
