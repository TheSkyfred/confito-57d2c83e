
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { 
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from '@/hooks/useUserRole';

interface UserAdminActionsProps {
  userId: string;
  isActive?: boolean;
  onActiveChange?: () => void;
}

const UserAdminActions: React.FC<UserAdminActionsProps> = ({ 
  userId,
  isActive = true,
  onActiveChange
}) => {
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      // Here you would call the delete API
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
      navigate('/admin/users');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async () => {
    try {
      // Here you would call the API to toggle active state
      if (onActiveChange) {
        onActiveChange();
      }
      toast({
        title: isActive ? "Utilisateur désactivé" : "Utilisateur activé",
        description: `L'utilisateur a été ${isActive ? 'désactivé' : 'activé'} avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Impossible de ${isActive ? 'désactiver' : 'activer'} l'utilisateur.`,
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col space-y-4 p-4 bg-muted rounded-lg">
      <h3 className="text-lg font-medium flex items-center">
        <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
        Actions administratives
      </h3>

      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/admin/users/edit/${userId}`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>

        <Button
          variant={isActive ? "destructive" : "outline"}
          size="sm"
          onClick={handleToggleActive}
        >
          {isActive ? (
            <XCircle className="mr-2 h-4 w-4" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          {isActive ? "Désactiver" : "Activer"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. L'utilisateur sera supprimé définitivement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UserAdminActions;
