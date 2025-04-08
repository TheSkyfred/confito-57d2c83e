
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash, Eye } from "lucide-react";
import FruitForm from '@/components/fruit/FruitForm';
import FruitDetail from '@/components/fruit/FruitDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminFruits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isModerator, isLoading: roleLoading } = useUserRole();
  const [selectedFruit, setSelectedFruit] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");

  // Fetch fruits
  const { data: fruits, isLoading, refetch } = useQuery({
    queryKey: ['adminFruits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fruits')
        .select(`
          *,
          fruit_tags(*)
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin && !isModerator) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        variant: "destructive",
      });
    }
  }, [isAdmin, isModerator, navigate, roleLoading, toast]);

  const handleEdit = (fruit: any) => {
    setSelectedFruit(fruit);
    setIsFormOpen(true);
    setActiveTab("edit");
  };

  const handleView = (fruit: any) => {
    setSelectedFruit(fruit);
    setIsViewOpen(true);
    setActiveTab("view");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('fruits')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer ce fruit.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Fruit supprimé",
      description: "Le fruit a été supprimé avec succès.",
    });
    refetch();
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedFruit(null);
    refetch();
    setActiveTab("list");
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedFruit(null);
    setActiveTab("list");
  };

  const handleBackToList = () => {
    setIsViewOpen(false);
    setSelectedFruit(null);
    setActiveTab("list");
  };

  const handleAddNew = () => {
    setSelectedFruit(null);
    setIsFormOpen(true);
    setActiveTab("add");
  };
  
  // Fix: Prevent rendering until role check is complete
  if (roleLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Fix: Return null early if not authorized
  if (!isAdmin && !isModerator) {
    return null;
  }

  return (
    <div className="container py-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-serif">Gestion des fruits saisonniers</CardTitle>
        <CardDescription>
          Administration du calendrier des fruits pour les confitures
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="list">Liste des fruits</TabsTrigger>
            <TabsTrigger value="add" disabled={activeTab !== "add" && !isFormOpen}>Ajouter</TabsTrigger>
            <TabsTrigger value="edit" disabled={activeTab !== "edit" || !selectedFruit}>Modifier</TabsTrigger>
            <TabsTrigger value="view" disabled={activeTab !== "view" || !selectedFruit}>Visualiser</TabsTrigger>
          </TabsList>

          {activeTab === "list" && (
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un fruit
            </Button>
          )}
        </div>

        <TabsContent value="list" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : fruits && fruits.length > 0 ? (
                <Table>
                  <TableCaption>Liste des fruits saisonniers</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Famille</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fruits.map((fruit: any) => (
                      <TableRow key={fruit.id}>
                        <TableCell className="font-medium">{fruit.name}</TableCell>
                        <TableCell>{fruit.family || "-"}</TableCell>
                        <TableCell>
                          {fruit.is_published ? (
                            <span className="text-green-600 font-medium">Publié</span>
                          ) : (
                            <span className="text-amber-600 font-medium">Brouillon</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleView(fruit)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(fruit)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(fruit.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <p>Aucun fruit trouvé. Commencez par en ajouter un.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un nouveau fruit</CardTitle>
              <CardDescription>Complétez les informations pour créer un nouveau fruit saisonnier</CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "add" && (
                <FruitForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="mt-0">
          {selectedFruit && activeTab === "edit" && (
            <Card>
              <CardHeader>
                <CardTitle>Modifier {selectedFruit.name}</CardTitle>
                <CardDescription>Modifiez les informations de ce fruit saisonnier</CardDescription>
              </CardHeader>
              <CardContent>
                <FruitForm fruit={selectedFruit} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="view" className="mt-0">
          {selectedFruit && activeTab === "view" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Détail du fruit: {selectedFruit.name}</CardTitle>
                  <CardDescription>Informations détaillées sur ce fruit</CardDescription>
                </div>
                <Button variant="outline" onClick={handleBackToList}>Retour à la liste</Button>
              </CardHeader>
              <CardContent>
                <FruitDetail fruit={selectedFruit} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleEdit(selectedFruit)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button variant="destructive" onClick={() => {
                  handleDelete(selectedFruit.id);
                  handleBackToList();
                }}>
                  <Trash className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFruits;
