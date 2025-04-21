
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface CoverImageUploadProps {
  currentImageUrl: string | null;
  onImageUploaded: (url: string) => void;
  className?: string;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded,
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;
      
      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('jam-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('jam-images')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      onImageUploaded(publicUrlData.publicUrl);
      
      toast({
        title: "Image téléchargée",
        description: "L'image de couverture a été mise à jour",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du téléchargement",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      {currentImageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
          <img
            src={currentImageUrl}
            alt="Image de couverture"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div>
        <input
          type="file"
          id="cover-image"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={uploading}
          onClick={() => document.getElementById('cover-image')?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              {currentImageUrl ? "Changer l'image de couverture" : "Ajouter une image de couverture"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CoverImageUpload;
