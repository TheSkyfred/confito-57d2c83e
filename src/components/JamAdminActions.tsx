
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface JamAdminActionsProps {
  jamId: string;
}

const JamAdminActions: React.FC<JamAdminActionsProps> = ({ jamId }) => {
  const { isAdmin, isModerator } = useUserRole();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  if (!isModerator) return null;
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('jams')
        .delete()
        .eq('id', jamId);
      
      if (error) throw error;
      
      toast({
        title: "Confiture supprimée",
        description: "La confiture a été supprimée avec succès.",
      });
      
      navigate('/explore');
    } catch (error: any) {
      toast({
        title: "Erreur lors de la suppression",
        description: error.message || "Une erreur est survenue lors de la suppression de la confiture.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="bg-muted rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Actions administratives</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/jam/edit/${jamId}`)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Modifier
          </Button>
          
          {isAdmin && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          )}
        </div>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette confiture ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. La confiture sera définitivement supprimée
              de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JamAdminActions;
