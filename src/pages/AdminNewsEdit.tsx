
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  Save,
  Image as ImageIcon,
  Loader2,
  Eye,
  EyeOff,
  Trash,
} from 'lucide-react';
import NewsImageUploader from '@/components/admin/NewsImageUploader';

// Fonction utilitaire pour valider le statut
const validateNewsStatus = (status: string): 'draft' | 'published' | 'archived' => {
  if (status === 'draft' || status === 'published' || status === 'archived') {
    return status;
  }
  return 'draft'; // Valeur par défaut si le statut n'est pas valide
};

const AdminNewsEdit = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin, isModerator, isLoading } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('content');
  const [submitting, setSubmitting] = useState(false);
  const [newsImages, setNewsImages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    cover_image_url: '',
    is_featured: false,
    status: 'draft' as 'draft' | 'published' | 'archived',
  });
  
  // Redirection si l'utilisateur n'est pas admin ou modérateur
  useEffect(() => {
    if (!isLoading && !isAdmin && !isModerator) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        variant: "destructive"
      });
    }
  }, [isAdmin, isModerator, navigate, isLoading, toast]);

  // Charger les données de l'actualité si en mode édition
  useEffect(() => {
    const fetchNewsData = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setFormData({
            title: data.title || '',
            summary: data.summary || '',
            content: data.content || '',
            cover_image_url: data.cover_image_url || '',
            is_featured: data.is_featured || false,
            status: validateNewsStatus(data.status),
          });
        }

        // Charger les images associées
        const { data: imagesData, error: imagesError } = await supabase
          .from('news_images')
          .select('*')
          .eq('news_id', id)
          .order('created_at');

        if (imagesError) {
          console.error('Erreur lors du chargement des images:', imagesError);
        } else {
          setNewsImages(imagesData || []);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement de l\'actualité:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de l'actualité",
          variant: "destructive"
        });
        navigate('/admin/news');
      }
    };

    if (!isLoading && (isAdmin || isModerator)) {
      fetchNewsData();
    }
  }, [id, isLoading, isAdmin, isModerator, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_featured: checked }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: validateNewsStatus(value) }));
  };

  const handleCoverImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, cover_image_url: url }));
  };

  const handleAddNewsImage = async (url: string, caption: string = '') => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('news_images')
        .insert({
          news_id: id,
          image_url: url,
          caption: caption,
          created_by: user?.id
        })
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setNewsImages(prev => [...prev, data[0]]);
        toast({
          title: "Image ajoutée",
          description: "L'image a été ajoutée avec succès à l'actualité.",
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'image:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'image",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNewsImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('news_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        throw error;
      }

      setNewsImages(prev => prev.filter(img => img.id !== imageId));
      toast({
        title: "Image supprimée",
        description: "L'image a été supprimée avec succès.",
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // S'assurer que l'utilisateur est connecté
      if (!user || !user.id) {
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }

      const newsData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        // Mise à jour d'une actualité existante
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Actualité mise à jour",
          description: "L'actualité a été mise à jour avec succès.",
        });
      } else {
        // Création d'une nouvelle actualité
        const { data, error } = await supabase
          .from('news')
          .insert({
            ...newsData,
            created_by: user.id,
          })
          .select();

        if (error) throw error;

        toast({
          title: "Actualité créée",
          description: "L'actualité a été créée avec succès.",
        });
        
        // Rediriger vers l'édition de l'actualité nouvellement créée
        if (data && data[0]) {
          navigate(`/admin/news/edit/${data[0].id}`);
          return;
        }
      }

      navigate('/admin/news');
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de l\'actualité:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'actualité",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    // Implémenter la prévisualisation si nécessaire
    toast({
      title: "Prévisualisation",
      description: "Fonctionnalité de prévisualisation à implémenter.",
    });
  };

  if (isLoading || (!isAdmin && !isModerator)) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/news')}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-3xl font-serif font-bold tracking-tight">
            {isEditing ? "Modifier l'actualité" : "Créer une actualité"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={submitting}
          >
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !formData.title || !formData.content}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Contenu de l'actualité</CardTitle>
              <CardDescription>
                Créez le contenu de votre actualité avec un titre accrocheur et un contenu détaillé.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Titre de l'actualité"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">Résumé</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  placeholder="Courte description de l'actualité (facultatif)"
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Contenu détaillé de l'actualité"
                  required
                  rows={12}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Images de l'actualité</CardTitle>
                <CardDescription>
                  Ajoutez des images à votre actualité pour l'illustrer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsImageUploader
                  newsId={id || ''}
                  onImageUploaded={handleAddNewsImage}
                />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Images existantes</h3>
                  {newsImages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune image supplémentaire ajoutée à cette actualité.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {newsImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img 
                            src={image.image_url}
                            alt={image.caption || "Image d'actualité"}
                            className="w-full h-48 object-cover rounded-md border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteNewsImage(image.id)}
                            >
                              <Trash className="h-4 w-4 mr-1" /> Supprimer
                            </Button>
                          </div>
                          {image.caption && (
                            <p className="text-sm mt-1 text-muted-foreground truncate">
                              {image.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de publication</CardTitle>
              <CardDescription>
                Configurez les paramètres de publication de votre actualité.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured">Mettre en avant</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="cover_image">Image de couverture</Label>
                {formData.cover_image_url && (
                  <div className="mb-4">
                    <img
                      src={formData.cover_image_url}
                      alt="Image de couverture"
                      className="w-full h-40 object-cover rounded-md border"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => setFormData(prev => ({ ...prev, cover_image_url: '' }))}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Supprimer
                    </Button>
                  </div>
                )}
                <NewsImageUploader
                  newsId={id || 'temp'}
                  onImageUploaded={handleCoverImageUpload}
                  label={formData.cover_image_url ? "Changer l'image de couverture" : "Ajouter une image de couverture"}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsEdit;
