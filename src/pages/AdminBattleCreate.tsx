
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BattleForm from '@/components/battle/BattleForm';

const AdminBattleCreate = () => {
  const navigate = useNavigate();
  
  const handleBattleCreated = (battleId: string) => {
    navigate(`/admin/battles/manage/${battleId}`);
  };

  return (
    <div className="container py-8 max-w-5xl">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        asChild
      >
        <Link to="/admin/battles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux battles
        </Link>
      </Button>

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Créer un nouveau Battle</h1>
        <p className="text-muted-foreground">Définissez les paramètres du nouveau battle de confitures qui sera proposé à la communauté.</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <BattleForm onSuccess={handleBattleCreated} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBattleCreate;
