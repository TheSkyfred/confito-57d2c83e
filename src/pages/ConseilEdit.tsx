import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdviceArticle } from '@/hooks/useAdvice';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { AdviceArticle, AdviceType, AdviceProduct } from '@/types/advice';
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
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ImagePlus,
  ExternalLink,
  Upload
} from 'lucide-react';
import AccessoriesSelector from '@/components/admin/AccessoriesSelector';

interface FormData {
  title: string;
  cover_image_url: string;
  video_url: string;
  content: string;
  type: AdviceType;
  tags: string;
  visible: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  image_url: string;
  external_url: string;
  is_sponsored: boolean;
}

const ConseilEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const { data: advice, isLoading: isLoadingAdvice, error: adviceError, refetch } = useAdviceArticle(id || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [products, setProducts] = useState<AdviceProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      cover_image_url: '',
      video_url: '',
      content: '',
      type: 'fruits' as AdviceType,
      tags: '',
      visible: true,
    }
  });
  
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '',
    description: '',
    image_url: '',
    external_url: '',
    is_sponsored: false
  });

  useEffect(() => {
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

  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('advice_products')
          .select('*')
          .eq('article_id', id);
          
        if (error) throw error;
        
        setProducts(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les produits associés",
          variant: "destructive"
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, [id]);

  useEffect(() => {
    if (advice) {
      form.reset({
        title: advice.title,
        cover_image_url: advice.cover_image_url || '',
        video_url: advice.video_url || '',
        content: advice.content || '',
        type: advice.type,
        tags: advice.tags ? advice.tags.join(', ') : '',
        visible: advice.visible
      });
      
      // Set cover image preview if available
      if (advice.cover_image_url) {
        setCoverImagePreview(advice.cover_image_url);
      }
    }
  }, [advice, form]);

  const typeOptions = [
    { label: 'Choix des fruits', value: 'fruits' },
    { label: 'Cuisson', value: 'cuisson' },
    { label: 'Recette', value: 'recette' },
    { label: 'Conditionnement', value: 'conditionnement' },
    { label: 'Stérilisation', value: 'sterilisation' },
    { label: 'Matériel', value: 'materiel' }
  ];
  
  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `cover_images/${fileName}`;
    
    setUploadingCoverImage(true);
    
    try {
      console.log("Uploading to bucket: advice_images, path:", filePath);
      
      const { error: uploadError, data } = await supabase.storage
        .from('advice_images')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('advice_images')
        .getPublicUrl(filePath);
      
      console.log("File uploaded successfully, public URL:", publicUrl);
      
      // Update the form and preview
      form.setValue('cover_image_url', publicUrl);
      setCoverImagePreview(publicUrl);
      
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
      setUploadingCoverImage(false);
    }
  };

  const handleProductImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `product_images/${fileName}`;
    
    setUploadingProductImage(true);
    
    try {
      console.log("Uploading product image to bucket: advice_images, path:", filePath);
      
      const { error: uploadError, data } = await supabase.storage
        .from('advice_images')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error("Product image upload error:", uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('advice_images')
        .getPublicUrl(filePath);
      
      console.log("Product image uploaded successfully, public URL:", publicUrl);
      
      setProductForm(prev => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: "Image téléchargée",
        description: "L'image du produit a été téléchargée avec succès"
      });
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de l\'image du produit:', error);
      toast({
        title: "Erreur",
        description: `Impossible de télécharger l'image du produit: ${error.message || error}`,
        variant: "destructive"
      });
    } finally {
      setUploadingProductImage(false);
    }
  };

  const handleProductInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  };

  const addProduct = async () => {
    if (!id) return;
    if (!productForm.name) {
      toast({
        title: "Erreur",
        description: "Le nom du produit est requis",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabaseDirect.insertAndReturn('advice_products', {
        article_id: id,
        name: productForm.name,
        description: productForm.description,
        image_url: productForm.image_url,
        external_url: productForm.external_url,
        is_sponsored: productForm.is_sponsored
      });
      
      if (error) throw error;
      
      setProducts(prev => [...prev, data[0]]);
      
      setProductForm({
        name: '',
        description: '',
        image_url: '',
        external_url: '',
        is_sponsored: false
      });
      
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès"
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('advice_products')
        .delete()
        .eq('id', productId);
        
      if (error) throw error;
      
      setProducts(prev => prev.filter(product => product.id !== productId));
      
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès"
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user || !id) return;
    
    setIsSubmitting(true);
    
    try {
      const tagsArray = data.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const { error } = await supabase
        .from('advice_articles')
        .update({
          title: data.title,
          cover_image_url: data.cover_image_url || null,
          video_url: data.video_url || null,
          content: data.content,
          type: data.type,
          tags: tagsArray,
          visible: data.visible,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Conseil mis à jour",
        description: "Votre conseil a été mis à jour avec succès"
      });
      
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du conseil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le conseil",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAdvice) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Chargement du conseil...</p>
        </div>
      </div>
    );
  }

  if (adviceError || !advice) {
    return (
      <div className="container py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p>Erreur lors du chargement du conseil</p>
          <p className="text-sm">{(adviceError as Error)?.message || "Conseil non trouvé"}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/conseils')}>
            Retour aux conseils
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/conseils')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux conseils
        </Button>
        <h1 className="text-2xl font-bold ml-2">Modifier un conseil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{advice?.title}</CardTitle>
          <CardDescription>
            Modifiez les informations de votre conseil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="products">Produits associés</TabsTrigger>
              <TabsTrigger value="accessories">Accessoires associés</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
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
                          value={field.value}
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
                          {(coverImagePreview || field.value) && (
                            <div className="relative w-full max-w-md h-48 overflow-hidden rounded-md border">
                              <img 
                                src={coverImagePreview || field.value} 
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
                                onChange={handleCoverImageUpload}
                                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                                accept="image/*"
                                disabled={uploadingCoverImage}
                              />
                              <Button 
                                type="button" 
                                variant="outline"
                                disabled={uploadingCoverImage}
                                className="w-full"
                              >
                                {uploadingCoverImage ? (
                                  "Téléchargement..."
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {(coverImagePreview || field.value) ? "Changer l'image" : "Télécharger une image"}
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
                            Publier
                          </FormLabel>
                          <FormDescription>
                            Si désactivé, le conseil ne sera pas visible par les utilisateurs
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
                      {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="products">
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Ajouter un produit</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom du produit *</label>
                      <Input 
                        placeholder="Ex: Bocaux en verre" 
                        value={productForm.name} 
                        onChange={(e) => handleProductInputChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Image du produit</label>
                      <div className="flex flex-col space-y-2">
                        {productForm.image_url && (
                          <div className="w-full h-32 overflow-hidden rounded-md border">
                            <img 
                              src={productForm.image_url} 
                              alt="Aperçu de l'image du produit" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="relative">
                          <Input
                            type="file"
                            id="product-image-upload"
                            onChange={handleProductImageUpload}
                            className="absolute inset-0 opacity-0 w-full cursor-pointer"
                            accept="image/*"
                            disabled={uploadingProductImage}
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            disabled={uploadingProductImage}
                            className="w-full"
                          >
                            {uploadingProductImage ? (
                              "Téléchargement..."
                            ) : (
                              <>
                                <ImagePlus className="h-4 w-4 mr-2" />
                                {productForm.image_url ? "Changer l'image" : "Télécharger une image"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Lien externe</label>
                      <Input 
                        placeholder="https://example.com/produit" 
                        value={productForm.external_url} 
                        onChange={(e) => handleProductInputChange('external_url', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea 
                        placeholder="Description du produit" 
                        value={productForm.description} 
                        onChange={(e) => handleProductInputChange('description', e.target.value)}
                        className="h-20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="is-sponsored" 
                      checked={productForm.is_sponsored}
                      onCheckedChange={(checked) => handleProductInputChange('is_sponsored', checked === true)}
                    />
                    <label htmlFor="is-sponsored" className="text-sm">
                      Produit sponsorisé
                    </label>
                  </div>
                  <Button onClick={addProduct} className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter le produit
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Produits associés ({products.length})</h3>
                  
                  {isLoadingProducts ? (
                    <p className="text-muted-foreground">Chargement des produits...</p>
                  ) : products.length === 0 ? (
                    <p className="text-muted-foreground">Aucun produit associé à ce conseil</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.map((product) => (
                        <Card key={product.id}>
                          <div className="flex flex-col h-full">
                            {product.image_url && (
                              <div className="aspect-video w-full overflow-hidden">
                                <img 
                                  src={product.image_url} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <CardContent className="flex-grow p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{product.name}</h4>
                                  {product.is_sponsored && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                      Sponsorisé
                                    </span>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteProduct(product.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {product.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {product.description}
                                </p>
                              )}
                              {product.external_url && (
                                <a 
                                  href={product.external_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline mt-2 inline-flex items-center"
                                >
                                  Voir le produit
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              )}
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="accessories">
              {id && <AccessoriesSelector adviceId={id} />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConseilEdit;
