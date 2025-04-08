
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { AdviceType } from '@/types/advice';
import { toast } from '@/hooks/use-toast';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

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
  const { isAdmin, isModerator } = useUserRole();
  
  // Rediriger si l'utilisateur n'est pas admin ou modérateur
  React.useEffect(() => {
    if (user && !isAdmin && !isModerator) {
      navigate('/conseils');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour cette page",
        variant: "destructive"
      });
    } else if (!user) {
      navigate('/auth');
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder à cette page",
        variant: "destructive"
      });
    }
  }, [user, isAdmin, isModerator, navigate]);
  
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      cover_image_url: '',
      video_url: '',
      content: '',
      type: 'fruitee' as AdviceType,
      tags: '',
      visible: true,
    }
  });
  
  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    try {
      // Traiter les tags
      const tagsArray = data.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const { data: articleData, error } = await supabase
        .from('advice_articles')
        .insert({
          title: data.title,
          author_id: user.id,
          cover_image_url: data.cover_image_url || null,
          video_url: data.video_url || null,
          content: data.content,
          type: data.type,
          tags: tagsArray,
          visible: data.visible
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Conseil créé",
        description: "Votre conseil a été publié avec succès"
      });
      
      navigate(`/conseils/${articleData.id}`);
    } catch (error: any) {
      console.error('Erreur lors de la création du conseil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le conseil",
        variant: "destructive"
      });
    }
  };
  
  const typeOptions = [
    { label: 'Choix des fruits', value: 'fruits' },
    { label: 'Cuisson', value: 'cuisson' },
    { label: 'Recette', value: 'recette' },
    { label: 'Conditionnement', value: 'conditionnement' },
    { label: 'Stérilisation', value: 'sterilisation' },
    { label: 'Matériel', value: 'materiel' }
  ];
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/conseils')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux conseils
        </Button>
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
                    <FormLabel>Image de couverture (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL d'une image représentative pour votre conseil
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
                <Button type="submit">
                  Publier le conseil
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
