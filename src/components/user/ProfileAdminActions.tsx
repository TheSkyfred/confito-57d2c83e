
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, CheckCircle, XCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { supabaseDirect } from '@/utils/supabaseAdapter';

interface ProfileAdminActionsProps {
  userId: string;
  isActive?: boolean;
  onActiveChange?: () => void;
}

const ProfileAdminActions: React.FC<ProfileAdminActionsProps> = ({ 
  userId,
  isActive = true,
  onActiveChange
}) => {
  const { isAdmin, isModerator } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  
  if (!isAdmin) return null;
  
  const handleToggleActive = async () => {
    try {
      // Instead of using is_active which doesn't exist in profiles table,
      // we'll use the role field to effectively activate/deactivate users
      // by setting their role to 'user' for active or to a temporary value for inactive
      const newRole = isActive ? 'inactive' : 'user';
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: isActive ? "Utilisateur désactivé" : "Utilisateur activé",
        description: `L'utilisateur a été ${isActive ? 'désactivé' : 'activé'} avec succès`,
      });
      
      if (onActiveChange) onActiveChange();
    } catch (error: any) {
      console.error(`Error toggling active state for user:`, error);
      toast({
        title: "Erreur",
        description: error.message || `Une erreur est survenue lors du changement d'état`,
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      // Here we would call the delete API for users
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
      
      navigate('/admin/users');
    } catch (error: any) {
      console.error(`Error deleting user:`, error);
      toast({
        title: "Erreur lors de la suppression",
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };
  
  const handleEdit = () => {
    navigate(`/admin/users/edit/${userId}`);
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
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToggleActive}
            className={isActive ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"}
          >
            {isActive ? (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Désactiver
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Activer
              </>
            )}
          </Button>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action ne peut pas être annulée. L'utilisateur sera définitivement supprimé
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
      </div>
    </div>
  );
};

export default ProfileAdminActions;
