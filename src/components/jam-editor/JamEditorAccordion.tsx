
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { JamFormData } from "@/hooks/useJamForm";
import BasicInfoForm from "@/components/jam-editor/BasicInfoForm";
import IngredientsForm from "@/components/jam-editor/IngredientsForm";
import ManufacturingForm from "@/components/jam-editor/ManufacturingForm";
import PricingForm from "@/components/jam-editor/PricingForm";
import RecipeForm from "@/components/jam-editor/RecipeForm";
import VisibilityForm from "@/components/jam-editor/VisibilityForm";
import JamPreview from "@/components/jam-editor/JamPreview";

interface JamEditorAccordionProps {
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

const JamEditorAccordion: React.FC<JamEditorAccordionProps> = ({
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
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <div className="lg:col-span-4">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="w-full"
        >
          <AccordionItem value="basic-info">
            <AccordionTrigger>Informations de base</AccordionTrigger>
            <AccordionContent>
              <BasicInfoForm 
                formData={formData} 
                updateFormData={updateFormData}
                mainImagePreview={mainImagePreview}
                handleImageChange={handleImageChange}
              />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="ingredients">
            <AccordionTrigger>Ingrédients</AccordionTrigger>
            <AccordionContent>
              <IngredientsForm 
                formData={formData} 
                updateFormData={updateFormData} 
              />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="manufacturing">
            <AccordionTrigger>Données de fabrication</AccordionTrigger>
            <AccordionContent>
              <ManufacturingForm 
                formData={formData} 
                updateFormData={updateFormData} 
              />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="pricing">
            <AccordionTrigger>Prix</AccordionTrigger>
            <AccordionContent>
              <PricingForm 
                formData={formData} 
                updateFormData={updateFormData}
                suggestedPrice={null}
              />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="recipe">
            <AccordionTrigger>Recette (facultatif)</AccordionTrigger>
            <AccordionContent>
              <RecipeForm 
                formData={formData} 
                updateFormData={updateFormData} 
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Card className="mt-6 p-4">
          <VisibilityForm 
            saving={saving} 
            handleSubmit={handleSubmit}
            isEditMode={isEditMode} 
          />
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <div className="sticky top-20">
          <Card>
            <div className="p-4">
              <h3 className="font-medium mb-3">Aperçu</h3>
              <JamPreview formData={formData} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JamEditorAccordion;
