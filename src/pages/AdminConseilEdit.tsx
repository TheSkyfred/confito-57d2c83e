import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AdviceArticle } from '@/types/advice';
import { Plus } from 'lucide-react';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { ImagePlus, Trash2, ExternalLink } from 'lucide-react';

interface FormData {
  title: string;
  cover_image_url: string;
  video_url: string;
  content: string;
  type: AdviceArticle['type'];
  tags: string;
  visible: boolean;
  status: string;
}

const AdminConseilEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const { data: advice, isLoading, error, refetch } = useAdviceArticle(id || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    image_url: '',
    external_url: '',
    is_sponsored: false,
    promo_code: ''
  });
  const [uploadingProductImage, setUploadingProductImage] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      cover_image_url: '',
      video_url: '',
      content: '',
      type: 'fruits' as AdviceArticle['type'],
      tags: '',
      visible: true,
      status: 'pending'
    }
  });

  useEffect(() => {
    if (user && !isAdmin && !isModerator) {
      navigate('/admin');
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
    if (advice) {
      form.reset({
        title: advice.title,
        cover_image_url: advice.cover_image_url || '',
        video_url: advice.video_url || '',
        content: advice.content || '',
        type: advice.type,
        tags: advice.tags ? advice.tags.join(', ') : '',
        visible: advice.visible,
        status: advice.status || 'pending'
      });
    }
  }, [advice, form]);

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
    
    if (id) {
      fetchProducts();
    }
  }, [id]);

  const handleProductImageUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `product_images/${fileName}`;
    
    setUploadingProductImage(true);
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('advice_images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('advice_images')
        .getPublicUrl(filePath);
      
      setNewProduct(prev => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: "Image téléchargée",
        description: "L'image du produit a été téléchargée avec succès"
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image du produit",
        variant: "destructive"
      });
    } finally {
      setUploadingProductImage(false);
    }
  };

  const handleAddProduct = async () => {
    if (!id || !newProduct.name) {
      toast({
        title: "Champ requis",
        description: "Le nom du produit est requis",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabaseDirect.insertAndReturn('advice_products', {
        article_id: id,
        name: newProduct.name,
        description: newProduct.description,
        image_url: newProduct.image_url,
        external_url: newProduct.external_url,
        is_sponsored: newProduct.is_sponsored,
        promo_code: newProduct.promo_code
      });
      
      if (error) throw error;
      
      setProducts(prev => [...prev, data[0]]);
      
      setNewProduct({
        name: '',
        description: '',
        image_url: '',
        external_url: '',
        is_sponsored: false,
        promo_code: ''
      });
      
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
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
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
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

  const statusOptions = [
    { label: 'En attente', value: 'pending' },
    { label: 'Approuvé', value: 'approved' },
    { label: 'Rejeté', value: 'rejected' }
  ];

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
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Conseil mis à jour",
        description: "Le conseil a été mis à jour avec succès"
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

  const handleApprove = async () => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('advice_articles')
        .update({
          status: 'approved',
          visible: true
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Conseil approuvé",
        description: "Le conseil est maintenant visible"
      });
      
      refetch && refetch();
    } catch (error) {
      console.error('Error approving conseil:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'approbation du conseil",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (reason: string) => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('advice_articles')
        .update({
          status: 'rejected',
          visible: false,
          rejection_reason: reason
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Conseil rejeté",
        description: "Le conseil a été rejeté"
      });
      
      refetch && refetch();
    } catch (error) {
      console.error('Error rejecting conseil:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du rejet du conseil",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Chargement du conseil...</p>
        </div>
      </div>
    );
  }

  if (error || !advice) {
    console.error("Error loading advice:", error);
    return (
      <div className="container py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p>Erreur lors du chargement du conseil</p>
          <p className="text-sm">{(error as Error)?.message || "Conseil non trouvé"}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/conseils')}>
            Retour à la liste des conseils
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/conseils')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à la liste des conseils
        </Button>
        <h1 className="text-2xl font-bold ml-2">Administration - Modifier un conseil</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations du conseil</CardTitle>
              <CardDescription>
                Modifiez les détails du conseil
              </CardDescription>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="general">Général</TabsTrigger>
                  <TabsTrigger value="products">Produits</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <TabsContent value="general" className="mt-0">
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        rules={{ required: "Le statut est requis" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statut</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="cover_image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de l'image de couverture</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL de l'image de couverture
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
                          <FormLabel>URL de la vidéo</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Lien YouTube (optionnel)
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
                              placeholder="Contenu du conseil..." 
                              className="min-h-[200px]" 
                              {...field} 
                            />
                          </FormControl>
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
                              Visible
                            </FormLabel>
                            <FormDescription>
                              Si désactivé, le conseil ne sera pas visible même s'il est approuvé
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate('/admin/conseils')}
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
              
              <TabsContent value="products" className="mt-0">
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Ajouter un produit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nom du produit *</label>
                        <Input 
                          placeholder="Ex: Bocaux en verre" 
                          value={newProduct.name} 
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Image du produit</label>
                        <div className="flex flex-col space-y-2">
                          {newProduct.image_url && (
                            <div className="w-full h-32 overflow-hidden rounded-md border">
                              <img 
                                src={newProduct.image_url} 
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
                                  {newProduct.image_url ? "Changer l'image" : "Télécharger une image"}
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
                          value={newProduct.external_url} 
                          onChange={(e) => setNewProduct({ ...newProduct, external_url: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea 
                          placeholder="Description du produit" 
                          value={newProduct.description} 
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Code promo</label>
                        <Input
                          placeholder="CODE10"
                          value={newProduct.promo_code}
                          onChange={(e) => setNewProduct({ ...newProduct, promo_code: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox 
                        id="is-sponsored" 
                        checked={newProduct.is_sponsored} 
                        onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_sponsored: !!checked })} 
                      />
                      <label htmlFor="is-sponsored" className="text-sm">
                        Produit sponsorisé
                      </label>
                    </div>
                    <Button onClick={handleAddProduct} type="button">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter le produit
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Produits associés ({products.length})</h3>
                    {isLoadingProducts ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Chargement des produits...</p>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Aucun produit associé</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((product) => (
                          <Card key={product.id} className="overflow-hidden">
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
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{product.name}</h4>
                                    {product.is_sponsored && (
                                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                        Sponsorisé
                                      </span>
                                    )}
                                    {product.click_count > 0 && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                        {product.click_count} clics
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                {product.description && (
                                  <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
                                )}
                                {product.promo_code && (
                                  <div className="mt-2 p-1.5 bg-blue-50 rounded border border-blue-200 inline-flex items-center">
                                    <span className="text-xs font-semibold text-blue-700">PROMO: {product.promo_code}</span>
                                  </div>
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
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID:</p>
                <p className="text-sm font-mono">{advice.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auteur:</p>
                <p className="text-sm">{advice.author?.username || "Inconnu"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de création:</p>
                <p className="text-sm">{new Date(advice.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour:</p>
                <p className="text-sm">{new Date(advice.updated_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statut actuel:</p>
                <div className="flex items-center mt-1">
                  {advice.status === 'approved' ? (
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approuvé
                    </div>
                  ) : advice.status === 'rejected' ? (
                    <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      Rejeté
                    </div>
                  ) : (
                    <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      En attente
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visibilité:</p>
                <p className="text-sm">{advice.visible ? "Visible" : "Non visible"}</p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setShowApproveDialog(true)}
                  disabled={advice.status === 'approved'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={advice.status === 'rejected'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.open(`/conseils/${id}`, '_blank')}
                >
                  Voir le conseil
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver ce conseil ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action rendra le conseil visible publiquement sur le site.
              Êtes-vous sûr de vouloir continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? "Approbation..." : "Approuver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter ce conseil ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action rendra le conseil invisible et marqué comme rejeté.
              Êtes-vous sûr de vouloir continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? "Rejet..." : "Rejeter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminConseilEdit;
