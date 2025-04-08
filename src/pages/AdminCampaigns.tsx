
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import AdsCampaignsList from '@/components/admin/AdsCampaignsList';
import AdsCampaignForm from '@/components/admin/AdsCampaignForm';
import AdsCampaignDetails from '@/components/admin/AdsCampaignDetails';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

const AdminCampaigns = () => {
  const { isAdmin } = useUserRole();
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Accès non autorisé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 p-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
              <p>Seuls les administrateurs peuvent gérer les campagnes publicitaires.</p>
              <Button asChild>
                <Link to="/">Retourner à l'accueil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Routes>
        <Route path="/" element={
          <>
            <h1 className="text-3xl font-serif font-bold mb-8">Gestion des campagnes publicitaires</h1>
            <AdsCampaignsList />
          </>
        } />
        <Route path="/new" element={
          <>
            <h1 className="text-3xl font-serif font-bold mb-8">Nouvelle campagne publicitaire</h1>
            <AdsCampaignForm />
          </>
        } />
        <Route path="/edit/:id" element={
          <>
            <h1 className="text-3xl font-serif font-bold mb-8">Modifier la campagne</h1>
            <AdsCampaignForm campaignId={window.location.pathname.split('/').pop()} />
          </>
        } />
        <Route path="/:id" element={
          <>
            <h1 className="text-3xl font-serif font-bold mb-8">Détails de la campagne</h1>
            <AdsCampaignDetails campaignId={window.location.pathname.split('/').pop() || ''} />
          </>
        } />
        <Route path="/:id/invoices" element={
          <>
            <h1 className="text-3xl font-serif font-bold mb-8">Factures de la campagne</h1>
            {/* Ici, on pourrait ajouter un composant de liste de factures détaillé */}
          </>
        } />
      </Routes>
    </div>
  );
};

export default AdminCampaigns;
