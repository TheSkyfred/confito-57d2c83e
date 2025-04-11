import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdviceType } from '@/types/advice';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Upload,
} from 'lucide-react';

interface FormData {
  title: string;
  cover_image_url: string;
  video_url: string;
  content: string;
  type: AdviceType;
  tags: string;
  visible: boolean;
}

const ConseilCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      cover_image_url: '',
      video_url: '',
      content: '',
      type: 'fruits',
      tags: '',
      visible: true,
    }
  });
  
  const typeOptions = [
    { label: 'Choix des fruits', value: 'fruits' },
    { label: 'Cuisson', value: 'cuisson' },
    { label: 'Recette', value: 'recette' },
    { label: 'Conditionnement', value: 'conditionnement' },
    { label: 'Stérilisation', value: 'sterilisation' },
    { label: 'Matériel', value: 'materiel' }
  ];
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `cover_images/${fileName}`;
    
    setUploadingImage(true);
    
    try {
      console.log("Uploading to bucket: advice_images, path:", filePath);
      
      const { error: uploadError, data } = await supabase.storage
        .from('advice_images')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('advice_images')
        .getPublicUrl(filePath);
      
      console.log("File uploaded successfully, public URL:", publicUrl);
      
      form.setValue('cover_image_url', publicUrl);
      setImagePreview(publicUrl);
      
      toast({
        title: "Image téléchargée",
        description: "L'image de couverture a été téléchargée avec succès"
      });
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast({
        title: "Erreur",
        description: `Impossible de télécharger l'image: ${error.message || error}`,
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour créer un conseil",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tagsArray = data.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const { data: insertedData, error } = await supabase
        .from('advice_articles')
        .insert({
          title: data.title,
          author_id: user.id,
          cover_image_url: data.cover_image_url || null,
          video_url: data.video_url || null,
          content: data.content,
          type: data.type,
          tags: tagsArray,
          visible: data.visible,
          status: 'pending',
          published_at: new Date().toISOString()
        })
        .select('id');
      
      if (error) throw error;
      
      toast({
        title: "Conseil créé",
        description: "Votre conseil a été créé avec succès"
      });
      
      if (insertedData && insertedData.length > 0 && insertedData[0]) {
        navigate(`/conseils/edit/${insertedData[0].id}`);
      } else {
        navigate('/conseils');
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du conseil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le conseil",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/conseils')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux conseils
        </Button>
        <h1 className="text-2xl font-bold ml-2">Créer un nouveau conseil</h1>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Créer un nouveau conseil</CardTitle>
          <CardDescription>
            Partagez vos connaissances et astuces sur la fabrication de confitures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                rules={{ required: "Le titre est requis" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre du conseil" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choisissez un titre clair et informatif
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                rules={{ required: "Le type est requis" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de conseil</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Catégorisez votre conseil pour faciliter la recherche
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cover_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image de couverture</FormLabel>
                    <div className="space-y-4">
                      {(imagePreview || field.value) && (
                        <div className="relative w-full max-w-md h-48 overflow-hidden rounded-md border">
                          <img 
                            src={imagePreview || field.value} 
                            alt="Aperçu de l'image de couverture" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-start">
                        <div className="relative">
                          <Input
                            type="file"
                            id="cover-image-upload"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 w-full cursor-pointer"
                            accept="image/*"
                            disabled={uploadingImage}
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            disabled={uploadingImage}
                            className="w-full"
                          >
                            {uploadingImage ? (
                              "Téléchargement..."
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                {(imagePreview || field.value) ? "Changer l'image" : "Télécharger une image"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <FormDescription>
                      Téléchargez une image représentative pour votre conseil
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vidéo YouTube (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Lien vers une vidéo YouTube (optionnel)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                rules={{ required: "Le contenu est requis" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Écrivez votre conseil ici..." 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Détaillez votre conseil avec des étapes claires
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="fraises, été, conservation..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Séparez les tags par des virgules
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="visible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Publier immédiatement
                      </FormLabel>
                      <FormDescription>
                        Si désactivé, le conseil sera enregistré comme brouillon
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/conseils')}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Publication en cours..." : "Publier le conseil"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConseilCreate;
