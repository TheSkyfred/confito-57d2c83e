
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { format, differenceInDays, isBefore, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { NewBattleType } from '@/types/supabase';
import { CalendarDays, Clock } from 'lucide-react';

interface BattleStatusProps {
  battle: NewBattleType;
}

const statusColors = {
  'inscription': 'bg-green-100 text-green-800 border-green-200',
  'selection': 'bg-blue-100 text-blue-800 border-blue-200',
  'production': 'bg-amber-100 text-amber-800 border-amber-200',
  'envoi': 'bg-purple-100 text-purple-800 border-purple-200',
  'vote': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'termine': 'bg-gray-100 text-gray-800 border-gray-200'
};

const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'inscription': return 'Inscriptions ouvertes';
    case 'selection': return 'Sélection des participants';
    case 'production': return 'Production en cours';
    case 'envoi': return 'Envoi des pots';
    case 'vote': return 'Votes en cours';
    case 'termine': return 'Terminé';
    default: return status;
  }
};

const BattleStatus: React.FC<BattleStatusProps> = ({ battle }) => {
  // Calculer le pourcentage de progression en fonction du statut
  const getProgressPercentage = () => {
    const now = new Date();
    
    switch (battle.status) {
      case 'inscription': {
        const start = new Date(battle.registration_start_date);
        const end = new Date(battle.registration_end_date);
        if (isBefore(now, start)) return 0;
        if (isAfter(now, end)) return 100;
        const total = differenceInDays(end, start) || 1;
        const elapsed = differenceInDays(now, start);
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
      }
      case 'selection': return 50;
      case 'production': {
        const start = new Date(battle.registration_end_date);
        const end = new Date(battle.production_end_date);
        if (isBefore(now, start)) return 0;
        if (isAfter(now, end)) return 100;
        const total = differenceInDays(end, start) || 1;
        const elapsed = differenceInDays(now, start);
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
      }
      case 'envoi': return 75;
      case 'vote': {
        const start = new Date(battle.production_end_date);
        const end = new Date(battle.voting_end_date);
        if (isBefore(now, start)) return 0;
        if (isAfter(now, end)) return 100;
        const total = differenceInDays(end, start) || 1;
        const elapsed = differenceInDays(now, start);
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
      }
      case 'termine': return 100;
      default: return 0;
    }
  };
  
  const getNextDeadline = () => {
    switch (battle.status) {
      case 'inscription':
        return {
          date: battle.registration_end_date,
          label: "Fin des inscriptions"
        };
      case 'selection':
        return {
          date: battle.registration_end_date,
          label: "Fin de la sélection"
        };
      case 'production':
        return {
          date: battle.production_end_date,
          label: "Fin de la production"
        };
      case 'envoi':
      case 'vote':
        return {
          date: battle.voting_end_date,
          label: "Fin des votes"
        };
      case 'termine':
        return {
          date: battle.voting_end_date,
          label: "Battle terminé le"
        };
    }
  };
  
  const deadline = getNextDeadline();
  const daysLeft = differenceInDays(new Date(deadline.date), new Date());
  const progress = getProgressPercentage();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge className={statusColors[battle.status]}>
          {getStatusDisplay(battle.status)}
        </Badge>
        
        <div className="text-sm text-muted-foreground flex items-center">
          <CalendarDays className="h-4 w-4 mr-1" />
          <span>{deadline.label}: <strong>{format(new Date(deadline.date), 'd MMMM yyyy', { locale: fr })}</strong></span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progression</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {daysLeft > 0 && battle.status !== 'termine' && (
        <div className="flex items-center justify-center p-2 bg-muted/50 rounded-md text-sm">
          <Clock className="h-4 w-4 mr-2" />
          <span>
            {daysLeft === 1 ? (
              <span className="text-red-500 font-medium">Dernier jour!</span>
            ) : (
              <>Il reste <strong>{daysLeft} jours</strong></>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default BattleStatus;
