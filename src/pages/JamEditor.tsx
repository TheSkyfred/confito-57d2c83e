
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useJamLoader } from "@/hooks/useJamLoader";
import { useJamForm } from "@/hooks/useJamForm";
import JamEditorTabs from "@/components/jam-editor/JamEditorTabs";
import JamEditorHeader from "@/components/jam-editor/JamEditorHeader";
import JamEditorLoading from "@/components/jam-editor/JamEditorLoading";

const JamEditor: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState<string>("edit");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "basic-info",
  ]);

  const {
    loading,
    jamCreatorId,
    isProJam,
    mainImagePreview,
    initialFormData,
  } = useJamLoader({
    jamId: id,
    userId: user?.id,
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
    jamCreatorId: user?.id || null,
    isProJam,
  });

  if (!user) {
    return null; // Auth redirect is handled in the useEffect in useJamLoader
  }

  if (loading) {
    return <JamEditorLoading />;
  }

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <JamEditorHeader 
            title={isEditMode ? "Modifier la confiture" : "Créer une confiture"}
            subtitle={isEditMode 
              ? "Mettez à jour les informations de votre confiture" 
              : "Partagez votre délicieuse création avec la communauté"
            }
          />
          
          <JamEditorTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            formData={isEditMode ? initialFormData : formData}
            updateFormData={updateFormData}
            mainImagePreview={mainImagePreview}
            handleImageChange={handleImageChange}
            saving={saving}
            handleSubmit={handleSubmit}
            isEditMode={isEditMode}
            expandedSections={expandedSections}
            setExpandedSections={setExpandedSections}
          />
        </div>
      </div>
    </div>
  );
};

export default JamEditor;
