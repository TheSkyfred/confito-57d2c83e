
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarRange, 
  CheckCircle2, 
  Circle, 
  Clock, 
  PackageOpen, 
  Truck, 
  Vote 
} from 'lucide-react';
import { NewBattleType, BattleStatus as BattleStatusType } from '@/types/supabase';

interface BattleStatusProps {
  status: BattleStatusType;
  battle?: NewBattleType;
}

const BattleStatus: React.FC<BattleStatusProps> = ({ status, battle }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'inscription':
        return {
          label: 'Inscriptions en cours',
          description: battle?.registration_end_date ? 
            `Les inscriptions sont ouvertes jusqu'au ${format(new Date(battle.registration_end_date), 'd MMMM yyyy', { locale: fr })}` :
            'Les inscriptions sont ouvertes',
          color: 'bg-blue-500',
          icon: <CalendarRange className="h-5 w-5" />
        };
      case 'selection':
        return {
          label: 'Sélection des participants',
          description: 'L\'administrateur sélectionne les participants parmi les candidatures',
          color: 'bg-purple-500',
          icon: <CheckCircle2 className="h-5 w-5" />
        };
      case 'production':
        return {
          label: 'Production en cours',
          description: battle?.production_end_date ?
            `Les participants produisent leur confiture jusqu'au ${format(new Date(battle.production_end_date), 'd MMMM yyyy', { locale: fr })}` :
            'Les participants produisent leur confiture',
          color: 'bg-orange-500',
          icon: <PackageOpen className="h-5 w-5" />
        };
      case 'envoi':
        return {
          label: 'Envoi des pots',
          description: 'Les participants envoient leurs pots aux juges',
          color: 'bg-yellow-500',
          icon: <Truck className="h-5 w-5" />
        };
      case 'vote':
        return {
          label: 'Vote en cours',
          description: battle?.voting_end_date ?
            `Les juges votent jusqu'au ${format(new Date(battle.voting_end_date), 'd MMMM yyyy', { locale: fr })}` :
            'Les juges votent pour les confitures',
          color: 'bg-green-500',
          icon: <Vote className="h-5 w-5" />
        };
      case 'termine':
        return {
          label: 'Battle terminé',
          description: battle?.voting_end_date ?
            `Battle terminé le ${format(new Date(battle.voting_end_date), 'd MMMM yyyy', { locale: fr })}` :
            'Battle terminé',
          color: 'bg-gray-500',
          icon: <Clock className="h-5 w-5" />
        };
      default:
        return {
          label: 'État inconnu',
          description: 'Le statut du battle n\'est pas reconnu',
          color: 'bg-gray-500',
          icon: <Circle className="h-5 w-5" />
        };
    }
  };
  
  const { label, description, color, icon } = getStatusInfo();
  
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: color.replace('bg-', 'var(--') + ')', color: 'white' }}>
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default BattleStatus;
