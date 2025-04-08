
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Trophy, Users, ArrowRight } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NewBattleType, BattleStatus } from '@/types/supabase';

interface BattleCardProps {
  battle: NewBattleType;
  variant?: 'default' | 'compact';
}

const statusLabels: Record<BattleStatus, { label: string; color: string }> = {
  'inscription': { label: 'Inscriptions ouvertes', color: 'bg-green-100 text-green-800' },
  'selection': { label: 'Sélection des participants', color: 'bg-blue-100 text-blue-800' },
  'production': { label: 'Production en cours', color: 'bg-amber-100 text-amber-800' },
  'envoi': { label: 'Envoi des pots', color: 'bg-purple-100 text-purple-800' },
  'vote': { label: 'Votes en cours', color: 'bg-indigo-100 text-indigo-800' },
  'termine': { label: 'Terminé', color: 'bg-gray-100 text-gray-800' }
};

const getBattleDate = (battle: NewBattleType) => {
  switch (battle.status) {
    case 'inscription':
      return {
        label: 'Inscriptions jusqu\'au',
        date: battle.registration_end_date
      };
    case 'selection':
      return {
        label: 'Sélection jusqu\'au',
        date: battle.registration_end_date
      };
    case 'production':
      return {
        label: 'Production jusqu\'au',
        date: battle.production_end_date
      };
    case 'envoi':
    case 'vote':
      return {
        label: 'Votes jusqu\'au',
        date: battle.voting_end_date
      };
    case 'termine':
      return {
        label: 'Terminé le',
        date: battle.voting_end_date
      };
  }
};

const BattleCard: React.FC<BattleCardProps> = ({ battle, variant = 'default' }) => {
  if (!battle) {
    console.error('Battle is undefined in BattleCard');
    return null;
  }

  const dateInfo = getBattleDate(battle);
  if (!dateInfo || !dateInfo.date) {
    console.error('Invalid date information for battle', battle);
    return null;
  }

  const isCompact = variant === 'compact';
  
  const formattedDate = format(new Date(dateInfo.date), 'd MMMM yyyy', { locale: fr });
  const isPastDate = isPast(new Date(dateInfo.date));
  const isDeadlineSoon = !isPastDate && !isFuture(new Date(dateInfo.date));
  
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className={`${isCompact ? 'py-3' : 'py-4'}`}>
        <div className="flex justify-between items-start">
          <Badge className={statusLabels[battle.status].color}>
            {statusLabels[battle.status].label}
          </Badge>
          {battle.is_featured && (
            <Badge variant="secondary">Événement spécial</Badge>
          )}
        </div>
        <CardTitle className={`mt-2 ${isCompact ? 'text-lg' : 'text-2xl'} font-serif`}>
          {battle.theme}
        </CardTitle>
        {!isCompact && battle.constraints && (
          <CardDescription>
            {Object.entries(battle.constraints).map(([key, value]) => (
              <span key={key} className="inline-block mr-2 text-xs bg-muted px-2 py-1 rounded-md">
                {key}: {value}
              </span>
            ))}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={`grow ${isCompact ? 'pb-2' : ''}`}>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-2" />
            <span className={isPastDate ? 'text-red-500' : (isDeadlineSoon ? 'text-amber-500' : '')}>
              {dateInfo.label} <strong>{formattedDate}</strong>
            </span>
          </div>
          
          {!isCompact && (
            <>
              <div className="flex items-center text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 mr-2" />
                <span>
                  Gain: <strong>{battle.reward_credits} crédits</strong>
                  {battle.reward_description && ` + ${battle.reward_description}`}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>
                  Max. <strong>{battle.max_judges} juges</strong> | 
                  Remise de <strong>{battle.judge_discount_percent}%</strong>
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className={`${isCompact ? 'pt-0' : ''}`}>
        <Button asChild className="w-full" variant={isCompact ? "outline" : "default"}>
          <Link to={`/battles/${battle.id}`}>
            Voir détails
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BattleCard;
