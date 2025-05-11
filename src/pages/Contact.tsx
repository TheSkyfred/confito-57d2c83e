
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  AlertCircle,
  Mail,
  Building,
  Globe,
  Newspaper,
  User,
  CheckCircle2,
  Loader2
} from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Définition du schéma de validation avec Zod
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Adresse email invalide" }),
  contactType: z.enum(['user', 'press', 'partner'], {
    required_error: "Veuillez sélectionner un type de contact",
  }),
  subject: z.string().min(3, { message: "Le sujet doit contenir au moins 3 caractères" }),
  message: z.string().min(20, { message: "Le message doit contenir au moins 20 caractères" }),
  company: z.string().optional(),
  website: z.string().url({ message: "URL invalide" }).optional().or(z.literal('')),
  media: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Initialisation du formulaire avec React Hook Form et Zod
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      contactType: undefined,
      subject: "",
      message: "",
      company: "",
      website: "",
      media: "",
    },
  });

  // Récupérer le type de contact pour affichage conditionnel de champs
  const contactType = form.watch("contactType");

  // Fonction pour soumettre le formulaire
  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      // Insérer le message dans la base de données
      const { error } = await supabase.from('contact_messages').insert({
        name: data.name,
        email: data.email,
        contact_type: data.contactType,
        subject: data.subject,
        message: data.message,
        company: data.company || null,
        website: data.website || null,
        media: data.media || null,
      });

      if (error) throw error;

      // Afficher un message de succès
      toast({
        title: "Message envoyé",
        description: "Nous avons bien reçu votre message et vous répondrons rapidement.",
        variant: "default",
      });

      // Réinitialiser le formulaire et marquer comme soumis
      form.reset();
      setSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="h-6 w-6 text-jam-raspberry" />
          <h1 className="font-serif text-3xl font-bold">Contact</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contactez-nous</CardTitle>
            <CardDescription>
              Une question, une demande presse, une proposition de partenariat ? Contactez-nous via ce formulaire, nous vous répondrons rapidement.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Merci pour votre message !</h2>
                <p className="text-muted-foreground mb-6">
                  Nous l'avons bien reçu et vous répondrons dans les plus brefs délais.
                </p>
                <Button onClick={() => setSubmitted(false)}>
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom <span className="text-jam-raspberry">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email <span className="text-jam-raspberry">*</span></FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="votre.email@exemple.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="contactType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de contact <span className="text-jam-raspberry">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un type de contact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>Utilisateur / Membre</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="press">
                              <div className="flex items-center gap-2">
                                <Newspaper className="h-4 w-4" />
                                <span>Presse / Journaliste</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="partner">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                <span>Partenaire / Marque</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Champs conditionnels selon le type de contact */}
                  {contactType === 'partner' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l'entreprise</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom de votre entreprise" {...field} />
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
                              <Input placeholder="https://www.votresite.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {contactType === 'press' && (
                    <FormField
                      control={form.control}
                      name="media"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Média ou publication</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom de votre média" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sujet <span className="text-jam-raspberry">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Sujet de votre message" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message <span className="text-jam-raspberry">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Votre message (minimum 20 caractères)"
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Votre message doit contenir au moins 20 caractères.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <p>Les champs marqués d'un <span className="text-jam-raspberry">*</span> sont obligatoires</p>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-jam-raspberry hover:bg-jam-raspberry/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        'Envoyer le message'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Adresse email</h3>
                  <p className="text-muted-foreground">contact@confito.com</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium">Siège social</h3>
                  <p className="text-muted-foreground">123 Rue des Confitures<br />75001 Paris, France</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Réponse</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Notre équipe s'engage à vous répondre dans un délai de 48 heures ouvrées.
                Merci de votre patience et de votre intérêt pour Confito.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
