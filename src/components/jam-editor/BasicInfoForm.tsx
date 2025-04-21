
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JamFormData } from "@/hooks/useJamForm";
import CoverImageUpload from './CoverImageUpload';

interface BasicInfoFormProps {
  formData: JamFormData;
  updateFormData: (key: string, value: any) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nom de la confiture*
        </label>
        <Input
          id="name"
          placeholder="Ex: Confiture de fraises"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description*
        </label>
        <Textarea
          id="description"
          placeholder="Décrivez votre confiture..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Image de couverture
        </label>
        <CoverImageUpload
          currentImageUrl={formData.cover_image_url}
          onImageUploaded={(url) => updateFormData('cover_image_url', url)}
          className="mt-2"
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;
