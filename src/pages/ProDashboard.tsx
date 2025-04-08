
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3,
  Package,
  PieChart,
  Newspaper,
  Megaphone,
  ShoppingBag,
  PlusCircle,
  TrendingUp
} from "lucide-react";

const ProDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Rediriger si l'utilisateur n'est pas connecté ou n'est pas un professionnel
  if (!user || profile?.role !== "pro") {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Accès non autorisé</CardTitle>
            <CardDescription>
              Cette page est réservée aux utilisateurs professionnels.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="mb-4">Vous devez être connecté en tant que professionnel pour accéder à cette page.</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/auth")}>
                Se connecter
              </Button>
              <Button onClick={() => navigate("/")}>
                Retourner à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Données fictives pour la démonstration
  const recentSalesData = [
    { id: 1, product: "Confiture de Fraises", date: "Aujourd'hui", amount: "42€", status: "Complétée" },
    { id: 2, product: "Confiture de Myrtilles", date: "Hier", amount: "36€", status: "En cours" },
    { id: 3, product: "Confiture d'Abricots", date: "12/04/2025", amount: "28€", status: "Complétée" },
    { id: 4, product: "Confiture de Framboises", date: "10/04/2025", amount: "54€", status: "Complétée" },
  ];

  const lowStockProducts = [
    { id: 1, name: "Confiture de Fraises", stock: 2 },
    { id: 2, name: "Confiture de Myrtilles", stock: 3 },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Professionnel</h1>
          <p className="text-muted-foreground">
            Gérez vos confitures, stocks, prix, campagnes et ventes
          </p>
        </div>
        <Button onClick={() => navigate("/jam/create")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouvelle Confiture
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="products">Mes Confitures</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="campaigns">Publicités</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        {/* Onglet Vue d'ensemble */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Ventes Totales</CardTitle>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,543€</div>
                <p className="text-xs text-muted-foreground">+12.5% par rapport au mois dernier</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                </div>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">46</div>
                <p className="text-xs text-muted-foreground">+8% par rapport au mois dernier</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Produits</CardTitle>
                </div>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">3 produits en stock faible</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">Campagnes</CardTitle>
                </div>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">1 campagne active</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Ventes récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSalesData.map((sale) => (
                    <div key={sale.id} className="flex items-center">
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">{sale.product}</p>
                        <p className="text-xs text-muted-foreground">{sale.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{sale.amount}</p>
                        <p className={`text-xs ${sale.status === "Complétée" ? "text-green-500" : "text-amber-500"}`}>
                          {sale.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Stock faible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-500">
                          {product.stock} en stock
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Gérer les stocks
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance des produits</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mt-2">Graphiques détaillés disponibles dans l'onglet "Analyses"</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Mes Confitures */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mes Confitures</CardTitle>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Ajouter une confiture
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-10">
                La liste complète de vos confitures et leur gestion de stock sera disponible ici.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Commandes */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Suivi des commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-10">
                Le suivi détaillé de vos commandes sera disponible ici.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Campagnes publicitaires */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campagnes publicitaires</CardTitle>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nouvelle campagne
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-10">
                La gestion de vos campagnes publicitaires sera disponible ici.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Analyses */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analyses et rapports</CardTitle>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <PieChart className="h-16 w-16 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mt-2">Des graphiques détaillés de vos ventes et performances seront disponibles ici.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProDashboard;
