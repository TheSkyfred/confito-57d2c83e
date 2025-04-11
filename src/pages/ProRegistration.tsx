
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      
      const { error: proProfileError } = await supabase
        .from('pro_profiles')
        .insert(proProfileData);
      
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
        <Card>
          <CardHeader>
            <CardTitle>Informations professionnelles</CardTitle>
            <CardDescription>Remplissez ce formulaire pour demander un compte professionnel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium">Nom de l'entreprise</label>
                  <Input 
                    id="companyName"
                    placeholder="Nom de votre entreprise" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="businessEmail" className="text-sm font-medium">Email professionnel</label>
                  <Input 
                    id="businessEmail"
                    type="email" 
                    placeholder="Email de contact" 
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description de l'entreprise</label>
                <Textarea 
                  id="description"
                  placeholder="Décrivez votre entreprise en quelques mots" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="story" className="text-sm font-medium">Notre histoire</label>
                <Textarea 
                  id="story"
                  placeholder="Racontez l'histoire de votre entreprise" 
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Téléphone</label>
                  <Input 
                    id="phone"
                    type="tel" 
                    placeholder="Numéro de téléphone" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">Site web</label>
                  <Input 
                    id="website"
                    type="url" 
                    placeholder="URL de votre site web" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="facebookUrl" className="text-sm font-medium">Facebook</label>
                  <Input 
                    id="facebookUrl"
                    type="url" 
                    placeholder="URL Facebook" 
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="instagramUrl" className="text-sm font-medium">Instagram</label>
                  <Input 
                    id="instagramUrl"
                    type="url" 
                    placeholder="URL Instagram" 
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="linkedinUrl" className="text-sm font-medium">LinkedIn</label>
                  <Input 
                    id="linkedinUrl"
                    type="url" 
                    placeholder="URL LinkedIn" 
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="billingAddress" className="text-sm font-medium">Adresse de facturation</label>
                <Input 
                  id="billingAddress"
                  placeholder="Adresse de facturation" 
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="vatNumber" className="text-sm font-medium">Numéro de TVA</label>
                <Input 
                  id="vatNumber"
                  placeholder="Numéro de TVA" 
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                />
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProRegistration;
