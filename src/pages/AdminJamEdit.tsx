
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useJamLoader } from "@/hooks/useJamLoader";
import { useJamForm } from "@/hooks/useJamForm";
import { JamFormData } from "@/hooks/useJamForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Loader2 } from "lucide-react";
import JamEditorAccordion from "@/components/jam-editor/JamEditorAccordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const AdminJamEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isModerator } = useUserRole();
  
  // Add state for expanded sections in the accordion
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "basic-info",
    "pricing"
  ]);
  
  // Load the jam data with admin privileges
  const {
    loading,
    jamCreatorId,
    isProJam,
    mainImagePreview,
    initialFormData,
  } = useJamLoader({
    jamId: id,
    userId: null, // Don't filter by user since we're admin
    isAdmin,
    isModerator,
  });
  
  // Initialize the form with the loaded data
  const {
    formData,
    updateFormData,
    handleSubmit,
    saving,
    handleImageChange,
  } = useJamForm({
    initialJamId: id,
    jamCreatorId: jamCreatorId,
    isProJam: isProJam,
    isAdmin: true, // Enable admin features
  });
  
  // Toggle PRO status
  const handleToggleProStatus = () => {
    updateFormData('is_pro', !formData.is_pro);
  };
  
  // Navigate back to the admin jams list
  const handleGoBack = () => {
    navigate('/admin/jams');
  };
  
  // Check access permissions
  if (!isAdmin && !isModerator) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-6">
            <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Special rule for moderators who cannot edit PRO jams
  if (isModerator && !isAdmin && isProJam) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-6">
            <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
            <p className="mb-4">Cette confiture est marquée comme "pro" et ne peut être modifiée que par un administrateur.</p>
            <Button onClick={() => navigate('/admin/jams')} variant="outline">
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-jam-raspberry mb-4" />
          <p>Chargement des données de la confiture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={handleGoBack} 
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
            <h1 className="text-3xl font-serif font-bold">Administration de confiture</h1>
            <p className="text-muted-foreground">
              Modifier les informations de cette confiture
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-md">
                <Checkbox 
                  id="is_pro"
                  checked={formData.is_pro || false}
                  onCheckedChange={handleToggleProStatus}
                />
                <div className="grid gap-1">
                  <div className="flex items-center">
                    <Label 
                      htmlFor="is_pro" 
                      className="font-medium cursor-pointer flex items-center"
                    >
                      <Crown className="h-4 w-4 mr-1.5 text-amber-500" />
                      Statut Pro
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Réservé aux producteurs professionnels
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          {jamCreatorId && (
            <div className="bg-slate-50 p-4 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Créateur:</strong> {jamCreatorId}
              </p>
            </div>
          )}
          
          <Card className="w-full">
            <CardContent className="p-6">
              <JamEditorAccordion
                formData={formData}
                updateFormData={updateFormData}
                mainImagePreview={mainImagePreview}
                handleImageChange={handleImageChange}
                saving={saving}
                handleSubmit={handleSubmit}
                isEditMode={true}
                expandedSections={expandedSections}
                setExpandedSections={setExpandedSections}
              />
              
              <Separator className="my-6" />
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleGoBack}
                >
                  Annuler
                </Button>
                <Button 
                  variant="default" 
                  disabled={saving || !formData.name} 
                  onClick={() => handleSubmit(false)}
                  className="bg-slate-800 hover:bg-slate-900"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer en brouillon
                </Button>
                <Button 
                  variant="default" 
                  disabled={saving || !formData.name} 
                  onClick={() => handleSubmit(true)}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publier
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminJamEdit;
