
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import JamPreview from "@/components/jam-editor/JamPreview";
import { JamFormData } from "@/hooks/useJamForm";
import JamEditorAccordion from "@/components/jam-editor/JamEditorAccordion";

interface JamEditorTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formData: JamFormData;
  updateFormData: (key: string, value: any) => void;
  mainImagePreview: string | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
  handleSubmit: (publish?: boolean) => Promise<boolean>;
  isEditMode: boolean;
  expandedSections: string[];
  setExpandedSections: (sections: string[]) => void;
}

const JamEditorTabs: React.FC<JamEditorTabsProps> = ({
  activeTab,
  setActiveTab,
  formData,
  updateFormData,
  mainImagePreview,
  handleImageChange,
  saving,
  handleSubmit,
  isEditMode,
  expandedSections,
  setExpandedSections,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="edit">Éditer</TabsTrigger>
        <TabsTrigger value="preview">Aperçu</TabsTrigger>
      </TabsList>
      
      <TabsContent value="edit" className="mt-0">
        <JamEditorAccordion
          formData={formData}
          updateFormData={updateFormData}
          mainImagePreview={mainImagePreview}
          handleImageChange={handleImageChange}
          saving={saving}
          handleSubmit={handleSubmit}
          isEditMode={isEditMode}
          expandedSections={expandedSections}
          setExpandedSections={setExpandedSections}
        />
      </TabsContent>
      
      <TabsContent value="preview" className="mt-0">
        <Card>
          <div className="p-6">
            <JamPreview formData={formData} fullPreview={true} />
            
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActiveTab("edit")}>
                Retour à l'édition
              </Button>
              <Button 
                disabled={saving} 
                onClick={() => handleSubmit(false)}
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
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default JamEditorTabs;
