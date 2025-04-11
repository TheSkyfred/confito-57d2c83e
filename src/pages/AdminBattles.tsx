
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import BattleForm from '@/components/battle/BattleForm';

const AdminBattles = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');
  
  const handleBattleCreated = (battleId: string) => {
    navigate(`/battles/${battleId}`);
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Administration des Battles</h1>
        <p className="text-muted-foreground">Créez et gérez les battles de confitures pour la communauté Confito.</p>
      </div>
      
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="create">Créer un Battle</TabsTrigger>
            <TabsTrigger value="manage">Gérer les Battles</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créer un nouveau Battle</CardTitle>
              <CardDescription>
                Définissez les paramètres du nouveau battle de confitures qui sera proposé à la communauté.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BattleForm onSuccess={handleBattleCreated} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gérer les Battles existants</CardTitle>
              <CardDescription>
                Cette fonctionnalité sera disponible prochainement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                La gestion des battles existants sera implémentée dans une prochaine mise à jour.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBattles;
