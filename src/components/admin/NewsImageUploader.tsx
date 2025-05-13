
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface NewsImageUploaderProps {
  newsId: string;
  onImageUploaded: (url: string, caption?: string) => void;
  label?: string;
  showCaption?: boolean;
}

const NewsImageUploader: React.FC<NewsImageUploaderProps> = ({
  newsId,
  onImageUploaded,
  label = "Ajouter une image",
  showCaption = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${newsId ? newsId + '/' : ''}${fileName}`;

    setUploading(true);

    try {
      // Télécharger le fichier dans le bucket
      const { error: uploadError } = await supabase.storage
        .from('news_images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('news_images')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error("Impossible d'obtenir l'URL publique");
      }

      // Passer l'URL au parent
      onImageUploaded(urlData.publicUrl, caption);
      setCaption('');
      toast({
        title: "Image téléchargée",
        description: "L'image a été téléchargée avec succès.",
      });

      // Réinitialiser l'input de fichier
      if (e.target.form) {
        e.target.form.reset();
      }
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de télécharger l'image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {showCaption && (
        <div className="mb-3">
          <Label htmlFor="image-caption">Légende de l'image (facultatif)</Label>
          <Input
            id="image-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Décrivez cette image"
            disabled={uploading}
          />
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={uploading}
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement en cours...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              {label}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NewsImageUploader;
