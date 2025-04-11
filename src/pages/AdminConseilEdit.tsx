
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdviceArticle } from '@/hooks/useAdvice';
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
import { ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface FormData {
  title: string;
  cover_image_url: string;
  video_url: string;
  content: string;
  type: AdviceType;
  tags: string;
  visible: boolean;
  status: string;
}

const AdminConseilEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isModerator } = useUserRole();
  const { data: advice, isLoading, error, refetch } = useAdviceArticle(id || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      cover_image_url: '',
      video_url: '',
      content: '',
      type: 'fruits' as AdviceType,
      tags: '',
      visible: true,
      status: 'pending'
    }
  });
  
  // Redirect non-admin users
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
  
  // Initialize form with advice data
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
  
  const handleApprove = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('advice_articles')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Conseil approuvé",
        description: "Le conseil a été approuvé et est maintenant visible publiquement"
      });
      
      setShowApproveDialog(false);
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation du conseil:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le conseil",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('advice_articles')
        .update({
          status: 'rejected',
          visible: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Conseil rejeté",
        description: "Le conseil a été rejeté et n'est pas visible publiquement"
      });
      
      setShowRejectDialog(false);
      refetch();
    } catch (error: any) {
      console.error('Erreur lors du rejet du conseil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le conseil",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
      
      {/* Boîte de dialogue de confirmation pour l'approbation */}
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
      
      {/* Boîte de dialogue de confirmation pour le rejet */}
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
