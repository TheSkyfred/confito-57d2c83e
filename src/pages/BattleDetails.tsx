import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchBattleById } from '@/utils/battleHelpers';
import { NewBattleType } from '@/types/supabase';
import { useEligibilityCheck } from '@/utils/battleHelpers';

const BattleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [battle, setBattle] = useState<NewBattleType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBattle = async () => {
      setLoading(true);
      if (id) {
        const battleData = await fetchBattleById(id);
        setBattle(battleData);
      }
      setLoading(false);
    };

    loadBattle();
  }, [id]);

  if (loading) {
    return <div className="container py-8">Chargement...</div>;
  }

  if (!battle) {
    return <div className="container py-8">Battle non trouvé</div>;
  }

  // Fix the usage of the hook
  const eligibility = useEligibilityCheck();
  const isEligible = eligibility.isEligible;

  const checkUserEligibility = async () => {
    return await eligibility.checkEligibility();
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button asChild variant="outline">
            <Link to="/battles">
              Retour aux battles
            </Link>
          </Button>
          {battle.is_featured && (
            <Badge variant="secondary">En vedette</Badge>
          )}
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">
          {battle.theme}
        </h1>
        <p className="text-muted-foreground">
          Découvrez les détails de ce battle passionnant
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails du Battle</CardTitle>
          <CardDescription>
            Informations clés et dates importantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Inscriptions jusqu'au{' '}
              {format(parseISO(battle.registration_end_date), 'PPP', {
                locale: fr,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{battle.max_judges} juges maximum</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Vote final le{' '}
              {format(parseISO(battle.voting_end_date), 'PPP', { locale: fr })}
            </span>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Récompenses</h4>
            <p className="text-muted-foreground">
              {battle.reward_credits} crédits et {battle.reward_description || 'un badge exclusif'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comment Participer</CardTitle>
          <CardDescription>
            Rejoignez le battle et montrez votre talent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEligible ? (
            <div className="space-y-2">
              <p>Vous êtes éligible pour participer à ce battle !</p>
              <Button>Participer maintenant</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                Malheureusement, vous ne remplissez pas les critères pour
                participer à ce battle.
              </p>
              <Button variant="secondary" disabled>
                Non éligible
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BattleDetails;
