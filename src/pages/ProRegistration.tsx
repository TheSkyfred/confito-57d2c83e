import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ProRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [companyName, setCompanyName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour continuer",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create pro profile
      const proProfileData = {
        id: user.id,
        company_name: companyName,
        business_email: businessEmail,
        description,
        story,
        phone,
        website,
        facebook_url: facebookUrl,
        instagram_url: instagramUrl,
        linkedin_url: linkedinUrl,
        billing_address: billingAddress,
        vat_number: vatNumber,
      };
      
      const { error: proProfileError } = await supabaseDirect.insertAndReturn('pro_profiles', proProfileData);
      
      if (proProfileError) throw proProfileError;
      
      // Update user role
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'pro' })
        .eq('id', user.id);
      
      if (roleError) throw roleError;
      
      setSuccessMessage("Votre demande a été soumise avec succès.");
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Inscription Compte Professionnel</h1>
      
      {successMessage ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Succès!</strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={{}}
              name="companyName"
              render={() => (
                <FormItem>
                  <FormLabel>Nom de l'entreprise</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nom de votre entreprise" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={{}}
              name="businessEmail"
              render={() => (
                <FormItem>
                  <FormLabel>Email professionnel</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Email de contact" 
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={{}}
            name="description"
            render={() => (
              <FormItem>
                <FormLabel>Description de l'entreprise</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Décrivez votre entreprise en quelques mots" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={{}}
            name="story"
            render={() => (
              <FormItem>
                <FormLabel>Notre histoire</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Racontez l'histoire de votre entreprise" 
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={{}}
              name="phone"
              render={() => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="Numéro de téléphone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={{}}
              name="website"
              render={() => (
                <FormItem>
                  <FormLabel>Site web</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="URL de votre site web" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={{}}
              name="facebookUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="URL Facebook" 
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={{}}
              name="instagramUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="URL Instagram" 
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={{}}
              name="linkedinUrl"
              render={() => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="URL LinkedIn" 
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={{}}
            name="billingAddress"
            render={() => (
              <FormItem>
                <FormLabel>Adresse de facturation</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Adresse de facturation" 
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={{}}
            name="vatNumber"
            render={() => (
              <FormItem>
                <FormLabel>Numéro de TVA</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Numéro de TVA" 
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande'}
          </Button>
        </Form>
      )}
    </div>
  );
};

export default ProRegistration;
