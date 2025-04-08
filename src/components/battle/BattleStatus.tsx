
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
import { NewBattleType } from '@/types/supabase';

interface BattleStatusProps {
  battle: NewBattleType;
}

const BattleStatus: React.FC<BattleStatusProps> = ({ battle }) => {
  const getStatusInfo = () => {
    switch (battle.status) {
      case 'inscription':
        return {
          label: 'Inscriptions en cours',
          description: `Les inscriptions sont ouvertes jusqu'au ${format(new Date(battle.registration_end_date), 'd MMMM yyyy', { locale: fr })}`,
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
          description: `Les participants produisent leur confiture jusqu'au ${format(new Date(battle.production_end_date), 'd MMMM yyyy', { locale: fr })}`,
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
          description: `Les juges votent jusqu'au ${format(new Date(battle.voting_end_date), 'd MMMM yyyy', { locale: fr })}`,
          color: 'bg-green-500',
          icon: <Vote className="h-5 w-5" />
        };
      case 'termine':
        return {
          label: 'Battle terminé',
          description: `Battle terminé le ${format(new Date(battle.voting_end_date), 'd MMMM yyyy', { locale: fr })}`,
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
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-full ${color} p-2 text-white`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold">{label}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <div className="flex items-center">
        {battle.status !== 'termine' && (
          <div className="text-sm text-muted-foreground">
            {battle.battle_judges?.length || 0} juges
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleStatus;
