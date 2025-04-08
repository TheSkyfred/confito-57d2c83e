
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdsCampaignsList from '@/components/admin/AdsCampaignsList';
import AdsCampaignForm from '@/components/admin/AdsCampaignForm';
import AdsCampaignDetails from '@/components/admin/AdsCampaignDetails';
import { useUserRole } from '@/hooks/useUserRole';

const AdminAds: React.FC = () => {
  const { isAdmin, isLoading } = useUserRole();
  const { action, id } = useParams<{ action?: string; id?: string }>();
  
  console.log('AdminAds - Route Params:', { action, id }); // Debug logging

  // Afficher un indicateur de chargement pendant la vérification du rôle
  if (isLoading) {
    return (
      <div className="container p-6">
        <div className="text-center py-8">Vérification des permissions...</div>
      </div>
    );
  }

  // Rediriger si l'utilisateur n'est pas admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  const renderContent = () => {
    console.log('Rendering content with:', { action, id }); // Additional debug logging

    // Si action = new, afficher le formulaire de création
    if (action === 'new') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle campagne publicitaire</CardTitle>
          </CardHeader>
          <CardContent>
            <AdsCampaignForm />
          </CardContent>
        </Card>
      );
    }
    
    // Si action = edit et id existe, afficher le formulaire d'édition
    if (action === 'edit' && id) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Modifier la campagne</CardTitle>
          </CardHeader>
          <CardContent>
            <AdsCampaignForm campaignId={id} />
          </CardContent>
        </Card>
      );
    }
    
    // Si action = view et id existe, afficher les détails
    if ((action === 'view' || !action) && id) {
      return <AdsCampaignDetails campaignId={id} />;
    }
    
    // Par défaut, afficher la liste des campagnes
    return <AdsCampaignsList />;
  };
  
  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Publicités</h1>
      {renderContent()}
    </div>
  );
};

export default AdminAds;
