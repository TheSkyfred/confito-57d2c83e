
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Edit, Trash2, Shield } from 'lucide-react';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AdminActionButtonsProps {
  itemId: string;
  itemType: 'jam' | 'recipe' | 'advice';
  status?: string;
  onStatusChange?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  editRoute?: string;
  redirectAfterDelete?: string;
}

const AdminActionButtons: React.FC<AdminActionButtonsProps> = ({ 
  itemId, 
  itemType, 
  status = 'pending',
  onStatusChange,
  canEdit = true,
  canDelete = false,
  editRoute,
  redirectAfterDelete
}) => {
  const { isAdmin, isModerator } = useUserRole();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  
  if (!isModerator) return null;
  
  // Map item type to table name
  const getTableName = () => {
    switch (itemType) {
      case 'jam': return 'jams';
      case 'recipe': return 'recipes';
      case 'advice': return 'advice_articles';
    }
  };
  
  const handleApprove = async () => {
    try {
      const tableName = getTableName();
      const { error } = await supabase
        .from(tableName)
        .update({ 
          status: 'approved',
          rejection_reason: null
        })
        .eq('id', itemId);
      
      if (error) throw error;
      
      toast({
        title: "Approuvé",
        description: `L'élément a été approuvé avec succès`,
      });
      
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      console.error(`Error approving ${itemType}:`, error);
      toast({
        title: "Erreur",
        description: error.message || `Une erreur est survenue lors de l'approbation`,
        variant: "destructive",
      });
    }
  };
  
  const handleReject = async () => {
    try {
      const tableName = getTableName();
      const { error } = await supabase
        .from(tableName)
        .update({ 
          status: 'rejected',
          rejection_reason: "Cet élément ne répond pas aux critères de qualité de notre plateforme."
        })
        .eq('id', itemId);
      
      if (error) throw error;
      
      toast({
        title: "Rejeté",
        description: `L'élément a été rejeté`,
      });
      
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      console.error(`Error rejecting ${itemType}:`, error);
      toast({
        title: "Erreur",
        description: error.message || `Une erreur est survenue lors du rejet`,
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      const tableName = getTableName();
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      toast({
        title: "Supprimé",
        description: `L'élément a été supprimé avec succès`,
      });
      
      if (redirectAfterDelete) {
        navigate(redirectAfterDelete);
      }
    } catch (error: any) {
      console.error(`Error deleting ${itemType}:`, error);
      toast({
        title: "Erreur lors de la suppression",
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };
  
  const handleEdit = () => {
    if (editRoute) {
      navigate(editRoute);
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
          {status === 'pending' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleApprove}
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approuver
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReject}
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Refuser
              </Button>
            </>
          )}
          
          {status === 'rejected' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleApprove}
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approuver malgré tout
            </Button>
          )}
          
          {canEdit && editRoute && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          )}
          
          {canDelete && isAdmin && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
              
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet élément ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. L'élément sera définitivement supprimé
                      de la base de données.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminActionButtons;
