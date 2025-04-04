
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';

interface BasicInfoFormProps {
  mainImagePreview: string | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Common tags for jams
const commonTags = [
  { id: 'bio', label: 'Bio' },
  { id: 'vegan', label: 'Végan' },
  { id: 'sans-sucre', label: 'Sans sucre ajouté' },
  { id: 'local', label: 'Produits locaux' },
  { id: 'edition-limitee', label: 'Édition limitée' },
  { id: 'artisanal', label: 'Artisanal' }
];

// Categories for jams
const jamCategories = [
  { value: 'classic', label: 'Classique (fruits)' },
  { value: 'vegetable', label: 'Légumes' },
  { value: 'floral', label: 'Florale' },
  { value: 'spicy', label: 'Épicée' },
  { value: 'exotic', label: 'Exotique' },
  { value: 'mixed', label: 'Mixte (fruits et légumes)' }
];

const BasicInfoForm = ({ mainImagePreview, handleImageChange }: BasicInfoFormProps) => {
  const { control, setValue, watch } = useFormContext();
  const selectedTags = watch('tags') || [];

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    const currentTags = [...(selectedTags || [])];
    const tagIndex = currentTags.indexOf(tagId);
    
    if (tagIndex !== -1) {
      currentTags.splice(tagIndex, 1);
    } else {
      currentTags.push(tagId);
    }
    
    setValue('tags', currentTags);
  };

  return (
    <div className="space-y-6">
      {/* Jam Name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom de la confiture *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Confiture de Fraises de Gariguette" {...field} />
            </FormControl>
            <FormDescription>
              Donnez un nom attrayant qui décrit bien votre confiture.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Main Image */}
      <FormItem>
        <FormLabel>Photo principale</FormLabel>
        <FormControl>
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
        </FormControl>
      </FormItem>

      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Décrivez votre confiture en quelques lignes..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Une description attrayante qui donne envie de goûter votre confiture. Parlez du goût, de la texture, des occasions parfaites pour la déguster...
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category */}
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Catégorie *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
              </FormControl>
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
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Tags */}
      <FormItem>
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
      </FormItem>
    </div>
  );
};

export default BasicInfoForm;
