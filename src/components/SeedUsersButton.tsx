
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SeedUsersButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const seedUsers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('seed-users', {
        body: JSON.stringify({ count: 20 }),
      });
      
      if (error) {
        console.error('Erreur lors de la création des utilisateurs :', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de créer les utilisateurs. Vérifiez la console pour plus de détails.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Utilisateurs créés :', data);
      toast({
        title: 'Succès',
        description: `${data.users.length} utilisateurs ont été ajoutés à la base de données.`,
      });
    } catch (err: any) {
      console.error('Erreur lors de la création des utilisateurs :', err);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création des utilisateurs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={seedUsers} 
      disabled={isLoading} 
      className="w-full md:w-auto"
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Création en cours...
        </>
      ) : (
        'Créer 20 utilisateurs fictifs'
      )}
    </Button>
  );
};

export default SeedUsersButton;
