
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const proFormSchema = z.object({
  company_name: z.string().min(2, 'Le nom de l\'entreprise est requis'),
  business_email: z.string().email('Email professionnel invalide'),
  phone: z.string().optional(),
  description: z.string().optional(),
  story: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  billing_address: z.string().optional(),
  vat_number: z.string().optional()
});

const ProRegistration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof proFormSchema>>({
    resolver: zodResolver(proFormSchema),
    defaultValues: {
      company_name: '',
      business_email: '',
      phone: '',
      description: '',
      story: '',
      website: '',
      facebook_url: '',
      instagram_url: '',
      linkedin_url: '',
      billing_address: '',
      vat_number: ''
    }
  });
  
  const onSubmit = async (values: z.infer<typeof proFormSchema>) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour compléter votre profil professionnel",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Créer le profil pro
      const { error: profileError } = await supabase
        .from('pro_profiles')
        .insert({
          id: user.id,
          ...values
        });
      
      if (profileError) throw profileError;
      
      // Mettre à jour le rôle utilisateur en "pro"
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'pro' })
        .eq('id', user.id);
      
      if (roleError) throw roleError;
      
      toast({
        title: "Profil professionnel créé",
        description: "Votre compte a été mis à jour en tant que professionnel",
      });
      
      // Redirection vers la page d'accueil ou le tableau de bord pro
      navigate('/user/profile');
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || 'Une erreur est survenue lors de la création du profil professionnel',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Créer un compte professionnel</h1>
            <p className="mb-6">Vous devez être connecté pour accéder à cette page</p>
            <Button onClick={() => navigate('/auth')}>
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-bold">Créer un compte professionnel</h1>
          <p className="text-muted-foreground mt-2">
            Complétez les informations ci-dessous pour créer votre profil professionnel
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">Informations essentielles</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="business_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email professionnel *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site web</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description de l'entreprise</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Une brève description de votre entreprise..." 
                        className="min-h-[80px]" 
                      />
                    </FormControl>
                    <FormDescription>
                      Cette description apparaîtra sur votre profil public
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="story"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Histoire de l'entreprise</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Racontez l'histoire de votre entreprise..." 
                        className="min-h-[120px]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h2 className="text-xl font-semibold border-b pb-2 pt-4">Réseaux sociaux</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="facebook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://facebook.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instagram_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://instagram.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://linkedin.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <h2 className="text-xl font-semibold border-b pb-2 pt-4">Informations de facturation</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="billing_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse de facturation</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vat_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de TVA</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Création en cours...' : 'Créer mon profil professionnel'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ProRegistration;
