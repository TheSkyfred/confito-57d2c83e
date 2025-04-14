
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchBattleById } from '@/utils/battleHelpers';
import { NewBattleType } from '@/types/supabase';
import BattleForm from '@/components/battle/BattleForm';

const AdminBattleEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleSuccess = (battleId: string) => {
    toast({
      title: "Battle mis à jour",
      description: "Les modifications ont été enregistrées avec succès."
    });
    navigate(`/admin/battles/manage/${battleId}`);
  };

  if (loading) {
    return <div className="container py-8">Chargement...</div>;
  }

  if (!battle) {
    return <div className="container py-8">Battle non trouvé</div>;
  }

  return (
    <div className="container py-8 max-w-5xl">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        asChild
      >
        <Link to={`/admin/battles/manage/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au battle
        </Link>
      </Button>

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Modifier le battle</h1>
        <p className="text-muted-foreground">Mettez à jour les informations du battle</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <BattleForm battleToEdit={battle} onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBattleEdit;
