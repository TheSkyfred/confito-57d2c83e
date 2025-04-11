
import React, { useState } from 'react';
import { useProAccessories } from '@/hooks/useProAccessories';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
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
import { Plus, Search } from 'lucide-react';
import AccessoryCard from '@/components/pro/AccessoryCard';
import AccessoryForm from '@/components/pro/AccessoryForm';
import { ProAccessory } from '@/types/supabase';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const AdminProAccessories = () => {
  const { accessories, isLoading, error, filter, setFilter, deleteAccessory } = useProAccessories();
  const { isAdmin, isPro } = useUserRole();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<ProAccessory | undefined>(undefined);
  const [accessoryToDelete, setAccessoryToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  if (!isAdmin && !isPro) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Accès refusé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }

  // Log the data we're working with
  console.log("Accessories data:", accessories);
  console.log("Loading state:", isLoading);
  console.log("Error:", error);

  const filteredAccessories = accessories?.filter(accessory => {
    if (activeTab === 'mine' && user?.id) {
      return accessory.created_by === user.id;
    }
    return true;
  });

  const handleOpenForm = (accessory?: ProAccessory) => {
    setSelectedAccessory(accessory);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedAccessory(undefined);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setAccessoryToDelete(id);
  };

  const confirmDelete = async () => {
    if (accessoryToDelete) {
      try {
        await deleteAccessory.mutateAsync(accessoryToDelete);
        setAccessoryToDelete(null);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: `Erreur lors de la suppression: ${error.message}`,
          variant: "destructive"
        });
      }
    }
  };

  // Function to render content based on loading state and data
  function renderContent(items?: ProAccessory[]) {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-destructive">Erreur de chargement</h3>
          <p className="text-muted-foreground">
            Une erreur s'est produite lors du chargement des accessoires: {error.message}
          </p>
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Aucun accessoire trouvé</h3>
          <p className="text-muted-foreground mb-6">
            {filter 
              ? "Aucun accessoire ne correspond à votre recherche" 
              : activeTab === 'mine' 
                ? "Vous n'avez pas encore ajouté d'accessoires" 
                : "Aucun accessoire n'a encore été ajouté"}
          </p>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter votre premier accessoire
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((accessory) => (
          <AccessoryCard
            key={accessory.id}
            accessory={accessory}
            onEdit={handleOpenForm}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Accessoires sponsorisés</h1>
          <p className="text-muted-foreground">
            Gérez les accessoires et produits recommandés
          </p>
        </div>
        
        <Button className="mt-4 md:mt-0" onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un accessoire
        </Button>
      </div>

      <div className="mb-6">
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">Tous les accessoires</TabsTrigger>
              {isPro && <TabsTrigger value="mine">Mes accessoires</TabsTrigger>}
            </TabsList>
            
            <div className="relative mt-4 md:mt-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un accessoire..."
                className="pl-9 w-full md:w-60"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {renderContent(filteredAccessories)}
          </TabsContent>
          
          {isPro && (
            <TabsContent value="mine" className="mt-0">
              {renderContent(filteredAccessories)}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Formulaire d'ajout/modification */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedAccessory ? "Modifier l'accessoire" : "Ajouter un accessoire"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <AccessoryForm
              accessory={selectedAccessory}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={!!accessoryToDelete} onOpenChange={() => setAccessoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement cet accessoire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProAccessories;
