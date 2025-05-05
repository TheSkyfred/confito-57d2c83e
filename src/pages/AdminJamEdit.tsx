
import React, { useState, useEffect } from "react";
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
import { ArrowLeft, Crown, Loader2, Info, AlertTriangle } from "lucide-react";
import JamEditorAccordion from "@/components/jam-editor/JamEditorAccordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import StatusDropdown from "@/components/jam-editor/StatusDropdown";
import { supabase } from "@/integrations/supabase/client";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AdminJamEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isModerator } = useUserRole();
  
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "basic-info",
    "pricing"
  ]);
  
  // We will sync this with formData
  const [jamStatus, setJamStatus] = useState<string>("pending");
  
  const {
    loading,
    jamCreatorId,
    isProJam,
    mainImagePreview,
    initialFormData,
  } = useJamLoader({
    jamId: id,
    userId: null,
    isAdmin,
    isModerator,
  });
  
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
    isAdmin: true,
  });
  
  // Sync initialFormData with formData when it's loaded
  useEffect(() => {
    if (initialFormData && initialFormData.name && !formData.name) {
      Object.keys(initialFormData).forEach(key => {
        updateFormData(key, initialFormData[key as keyof JamFormData]);
      });
      
      // Set initial status when jam data is loaded
      if (initialFormData.status) {
        setJamStatus(initialFormData.status);
        updateFormData('status', initialFormData.status);
      }
    }
  }, [initialFormData]);
  
  const handleToggleProStatus = () => {
    if (formData.is_pro && formData.price_euros) {
      updateFormData('price_credits', Math.round(formData.price_euros));
    } else if (!formData.is_pro && formData.price_credits) {
      updateFormData('price_euros', formData.price_credits);
    }
    
    updateFormData('is_pro', !formData.is_pro);
  };
  
  const handleStatusChange = (status: string) => {
    console.log("Status changed to:", status);
    setJamStatus(status);
    updateFormData('status', status);
  };
  
  const handleGoBack = () => {
    navigate('/admin/jams');
  };
  
  // Handle cover image update
  const handleCoverImageUpdated = (url: string) => {
    console.log("Cover image updated:", url);
    updateFormData('cover_image_url', url);
  };
  
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
          
          <div className="flex items-center gap-3">
            {/* Status Dropdown */}
            <div className="mr-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium mb-2 text-muted-foreground">Statut</span>
                <StatusDropdown 
                  currentStatus={jamStatus}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
            
            {isAdmin && (
              <div className={`flex items-center space-x-2 p-3 rounded-md ${formData.is_pro ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                <div className="flex items-center space-x-2">
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
                        {formData.is_pro ? (
                          <>
                            <Crown className="h-4 w-4 mr-1.5 text-amber-500" />
                            <span className="font-semibold text-amber-700">Confiture Pro</span>
                          </>
                        ) : (
                          <>
                            <Crown className="h-4 w-4 mr-1.5 text-slate-400" />
                            <span>Statut Pro</span>
                          </>
                        )}
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1.5 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64 text-sm">
                              Les confitures professionnelles sont vendues en euros plutôt qu'en crédits.
                              Elles sont réservées aux producteurs ayant un statut pro validé.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.is_pro 
                        ? "Prix en euros pour les confitures pro" 
                        : "Réservé aux producteurs professionnels"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {formData.is_pro && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Confiture Professionnelle</h3>
              <p className="text-sm text-amber-700">
                Cette confiture est vendue en euros et non en crédits. Le prix sera affiché en euros sur la plateforme.
              </p>
            </div>
          </div>
        )}
        
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
