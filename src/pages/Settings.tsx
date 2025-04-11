
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, AtSign, MapPin, Globe, Phone, FileText } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { getProfileInitials } from '@/utils/supabaseHelpers';

// Profile form validation schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Le nom d'utilisateur doit contenir au moins 3 caractères",
  }),
  full_name: z.string().optional(),
  bio: z.string().max(240, {
    message: "La bio ne peut pas dépasser 240 caractères",
  }).optional(),
  website: z.string().url({
    message: "Veuillez entrer une URL valide",
  }).or(z.literal('')).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Settings = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      full_name: '',
      bio: '',
      website: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Load profile data
    if (profile) {
      form.reset({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [user, profile, form, navigate]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    setLoading(true);
    try {
      let newAvatarUrl = avatarUrl;

      // Upload new avatar if changed
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        }
      }

      // Update profile
      const profileData = {
        ...data,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      };

      await updateProfile(profileData);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations de profil ont été mises à jour avec succès.",
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du profil.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-serif font-bold">Paramètres du profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Votre profil public</CardTitle>
                <CardDescription>
                  Ces informations seront affichées publiquement sur votre profil.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar section */}
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                        <AvatarFallback className="text-2xl">
                          {getProfileInitials(profile?.username || '')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex flex-col items-center">
                        <Label htmlFor="avatar" className="cursor-pointer text-sm text-blue-500 hover:text-blue-600">
                          Changer d'avatar
                        </Label>
                        <Input 
                          id="avatar" 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>

                    {/* Form fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">
                          <AtSign className="h-4 w-4 inline mr-1" />
                          Nom d'utilisateur
                        </Label>
                        <Input
                          id="username"
                          {...form.register('username')}
                          placeholder="votre_nom_utilisateur"
                          className="w-full"
                        />
                        {form.formState.errors.username && (
                          <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          <User className="h-4 w-4 inline mr-1" />
                          Nom complet
                        </Label>
                        <Input
                          id="fullName"
                          {...form.register('full_name')}
                          placeholder="Prénom Nom"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">
                          <FileText className="h-4 w-4 inline mr-1" />
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          {...form.register('bio')}
                          placeholder="Quelques mots à propos de vous..."
                          className="w-full min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground">
                          {form.watch('bio')?.length || 0}/240 caractères
                        </p>
                        {form.formState.errors.bio && (
                          <p className="text-sm text-red-500">{form.formState.errors.bio.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Coordonnées</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">
                          <Globe className="h-4 w-4 inline mr-1" />
                          Site web
                        </Label>
                        <Input
                          id="website"
                          {...form.register('website')}
                          placeholder="https://votre-site.com"
                          className="w-full"
                        />
                        {form.formState.errors.website && (
                          <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          <Phone className="h-4 w-4 inline mr-1" />
                          Téléphone
                        </Label>
                        <Input
                          id="phone"
                          {...form.register('phone')}
                          placeholder="+33 6 12 34 56 78"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          Adresse
                        </Label>
                        <Input
                          id="address"
                          {...form.register('address')}
                          placeholder="Votre adresse"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading || !form.formState.isDirty}
                    >
                      {loading ? "Sauvegarde..." : "Sauvegarder le profil"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du compte</CardTitle>
                <CardDescription>
                  Gérez vos informations de connexion et autres paramètres de compte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Adresse e-mail</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" disabled>Changer</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mot de passe</h4>
                      <p className="text-sm text-muted-foreground">••••••••</p>
                    </div>
                    <Button variant="outline" disabled>Changer</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <p className="text-sm text-muted-foreground mb-2">
                  Compte créé le {new Date(user.created_at || '').toLocaleDateString('fr-FR')}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  disabled
                >
                  Supprimer mon compte
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
