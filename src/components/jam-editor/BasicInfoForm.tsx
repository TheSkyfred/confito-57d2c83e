
import React from 'react';
import { 
  StandaloneFormLabel as FormLabel, 
  StandaloneFormDescription as FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';

export interface BasicInfoFormProps {
  formData: {
    name: string;
    description: string;
    type?: string;
    badges?: string[];
    [key: string]: any;
  };
  updateFormData: (key: string, value: any) => void;
  mainImagePreview?: string | null;
  handleImageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const commonTags = [
  { id: 'bio', label: 'Bio' },
  { id: 'vegan', label: 'Végan' },
  { id: 'sans-sucre', label: 'Sans sucre ajouté' },
  { id: 'local', label: 'Produits locaux' },
  { id: 'edition-limitee', label: 'Édition limitée' },
  { id: 'artisanal', label: 'Artisanal' }
];

const jamCategories = [
  { value: 'classic', label: 'Classique (fruits)' },
  { value: 'vegetable', label: 'Légumes' },
  { value: 'floral', label: 'Florale' },
  { value: 'spicy', label: 'Épicée' },
  { value: 'exotic', label: 'Exotique' },
  { value: 'mixed', label: 'Mixte (fruits et légumes)' }
];

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ 
  formData, 
  updateFormData,
  mainImagePreview, 
  handleImageChange 
}) => {
  const selectedTags = formData.badges || [];

  const toggleTag = (tagId: string) => {
    const currentTags = [...(selectedTags || [])];
    const tagIndex = currentTags.indexOf(tagId);
    
    if (tagIndex !== -1) {
      currentTags.splice(tagIndex, 1);
    } else {
      currentTags.push(tagId);
    }
    
    updateFormData('badges', currentTags);
  };

  return (
    <div className="space-y-6">
      <div>
        <FormLabel>Nom de la confiture *</FormLabel>
        <Input 
          placeholder="Ex: Confiture de Fraises de Gariguette" 
          value={formData.name} 
          onChange={(e) => updateFormData('name', e.target.value)}
        />
        <FormDescription>
          Donnez un nom attrayant qui décrit bien votre confiture.
        </FormDescription>
      </div>

      {handleImageChange && (
        <div>
          <FormLabel>Photo principale</FormLabel>
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
            <div className="relative w-40 h-40 border rounded-md overflow-hidden bg-muted flex items-center justify-center">
              {mainImagePreview ? (
                <img
                  src={mainImagePreview}
                  alt="Aperçu de la confiture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-xs text-center px-2">
                  Aucune image
                </span>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="bg-muted hover:bg-muted/80 flex items-center gap-2 px-4 py-2 rounded-md">
                  <Upload className="h-4 w-4" />
                  <span>Sélectionner une image</span>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <FormDescription>
                Format recommandé : image carrée de 800x800px, maximum 2MB.
                <br />Cette photo sera l'image principale de votre confiture.
              </FormDescription>
            </div>
          </div>
        </div>
      )}

      <div>
        <FormLabel>Description</FormLabel>
        <Textarea
          placeholder="Décrivez votre confiture en quelques lignes..."
          className="min-h-[100px]"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
        />
        <FormDescription>
          Une description attrayante qui donne envie de goûter votre confiture. Parlez du goût, de la texture, des occasions parfaites pour la déguster...
        </FormDescription>
      </div>

      <div>
        <FormLabel>Catégorie *</FormLabel>
        <Select 
          value={formData.type} 
          onValueChange={(value) => updateFormData('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {jamCategories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormDescription>
          Choisissez la catégorie qui correspond le mieux à votre confiture.
        </FormDescription>
      </div>

      <div>
        <FormLabel>Badges</FormLabel>
        <div className="flex flex-wrap gap-2">
          {commonTags.map(tag => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className={`cursor-pointer ${selectedTags.includes(tag.id) ? 'bg-jam-raspberry' : ''}`}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.label}
              {selectedTags.includes(tag.id) && (
                <X className="ml-1 h-3 w-3" />
              )}
            </Badge>
          ))}
        </div>
        <FormDescription>
          Cliquez sur les badges pour les ajouter ou les retirer.
        </FormDescription>
      </div>
    </div>
  );
};

export default BasicInfoForm;
