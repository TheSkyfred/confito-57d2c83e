
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useProAccessories } from '@/hooks/useProAccessories';
import { ProAccessory } from '@/types/supabase';
import { Loader2, Upload, X } from 'lucide-react';

interface AccessoryFormProps {
  accessory?: ProAccessory;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AccessoryForm: React.FC<AccessoryFormProps> = ({ accessory, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { createAccessory, updateAccessory, uploadImage } = useProAccessories();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(accessory?.image_url || null);
  
  const [formData, setFormData] = useState({
    name: accessory?.name || '',
    brand: accessory?.brand || '',
    short_description: accessory?.short_description || '',
    external_url: accessory?.external_url || '',
    image_url: accessory?.image_url || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Vérifier le type et la taille du fichier
      if (!file.type.match(/image\/(jpeg|png|gif|webp)/)) {
        toast({
          title: "Format invalide",
          description: "Veuillez sélectionner une image (JPEG, PNG, GIF ou WEBP)",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Fichier trop volumineux",
          description: "La taille de l'image ne doit pas dépasser 5 Mo",
          variant: "destructive"
        });
        return;
      }
      
      // Créer un aperçu
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Upload sur Supabase
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      
      toast({
        title: "Image téléchargée",
        description: "L'image a été téléchargée avec succès"
      });
    } catch (error: any) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      toast({
        title: "Erreur",
        description: `Erreur lors du téléchargement de l'image: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeImage = () => {
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (accessory) {
        // Mise à jour d'un accessoire existant
        await updateAccessory.mutateAsync({
          id: accessory.id,
          updates: formData
        });
      } else {
        // Création d'un nouvel accessoire
        await createAccessory.mutateAsync({
          ...formData,
          created_by: user.id
        });
      }
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{accessory ? "Modifier un accessoire" : "Ajouter un accessoire"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marque *</Label>
              <Input 
                id="brand" 
                name="brand" 
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="short_description">Description courte *</Label>
            <Textarea 
              id="short_description" 
              name="short_description" 
              value={formData.short_description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="external_url">URL externe</Label>
            <Input 
              id="external_url" 
              name="external_url" 
              type="url"
              value={formData.external_url}
              onChange={handleChange}
              placeholder="https://"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image du produit</Label>
            {!previewUrl ? (
              <div className="border border-dashed rounded-md p-6 text-center">
                <label htmlFor="image" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Cliquez pour télécharger une image (max 5 Mo)
                    </span>
                  </div>
                  <Input 
                    id="image" 
                    name="image" 
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            ) : (
              <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Aperçu" 
                  className="w-full h-full object-contain"
                />
                <Button 
                  type="button"
                  variant="destructive" 
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isUploading || createAccessory.isPending || updateAccessory.isPending}
          >
            {(isUploading || createAccessory.isPending || updateAccessory.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {accessory ? "Mettre à jour" : "Ajouter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AccessoryForm;
