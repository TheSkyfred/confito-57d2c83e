import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditBadge } from "@/components/ui/credit-badge";
import {
  LayoutDashboard,
  CreditCard,
  ShoppingCart,
  Star,
  Award,
  PlusCircle,
  Heart,
  BarChart3,
  Loader2,
} from "lucide-react";
import { OrderType, ProfileType, JamType } from "@/types/supabase";
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { getProfileUsername, isProfileType } from '@/utils/profileTypeGuards';

interface Jam {
  id: string;
  name: string;
  description: string;
  price_credits: number;
  created_at: string;
  is_active: boolean;
  cover_image_url?: string | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(0);
  const [userJams, setUserJams] = useState<Jam[]>([]);
  const [purchases, setPurchases] = useState<OrderType[]>([]);
  const [sales, setSales] = useState<OrderType[]>([]);
  const [favorites, setFavorites] = useState<Jam[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile including credits
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;
      setUserCredits(profileData?.credits || 0);

      // Fetch user's jams
      const { data: jamsData, error: jamsError } = await supabase
        .from("jams")
        .select("id, name, description, price_credits, created_at, is_active, cover_image_url")
        .eq("creator_id", user?.id)
        .order("created_at", { ascending: false });

      if (jamsError) throw jamsError;
      setUserJams(jamsData || []);

      // Fetch user's purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("orders")
        .select("*, jams(*), seller:profiles!seller_id(*)")
        .eq("buyer_id", user?.id)
        .order("created_at", { ascending: false });

      if (purchasesError) throw purchasesError;
      setPurchases(purchasesData || []);

      // Fetch user's sales
      const { data: salesData, error: salesError } = await supabase
        .from("orders")
        .select("*, jams(*), buyer:profiles!buyer_id(*)")
        .eq("seller_id", user?.id)
        .order("created_at", { ascending: false });

      if (salesError) throw salesError;
      setSales(salesData || []);

      // Fetch user's favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from("favorites")
        .select("jams(id, name, description, price_credits, created_at, is_active, cover_image_url)")
        .eq("user_id", user?.id);

      if (favoritesError) throw favoritesError;
      
      const formattedFavorites = favoritesData?.map(fav => fav.jams as Jam) || [];
      setFavorites(formattedFavorites);

      // Fetch user's badges
      const { data: badgesData, error: badgesError } = await supabase
        .from("user_badges")
        .select("badges(*)")
        .eq("user_id", user?.id);

      if (badgesError) throw badgesError;
      
      const formattedBadges = badgesData?.map(item => item.badges) || [];
      setBadges(formattedBadges);
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-jam-raspberry" />
          <p>Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={user?.user_metadata?.avatar_url as string}
            alt={user?.user_metadata?.full_name as string}
          />
          <AvatarFallback>
            {user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">
            Bienvenue, {user?.user_metadata?.full_name}
          </h1>
          <p className="text-muted-foreground">
            Gérez vos confitures, suivez vos transactions et explorez vos statistiques.
          </p>
        </div>

        <div className="flex flex-col items-end justify-center space-y-2">
          <div className="flex items-center gap-2">
            <CreditBadge amount={profile?.credits || 0} size="large" />
            <Button variant="outline" size="sm" asChild>
              <Link to="/credits">
                <CreditCard className="h-4 w-4 mr-2" />
                Gérer les crédits
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-jam-raspberry data-[state=active]:text-white">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden md:inline">Aperçu</span>
            <span className="md:hidden">Aperçu</span>
          </TabsTrigger>
          <TabsTrigger value="myjams" className="flex items-center gap-2 data-[state=active]:bg-jam-raspberry data-[state=active]:text-white">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden md:inline">Mes confitures</span>
            <span className="md:hidden">Confitures</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-jam-raspberry data-[state=active]:text-white">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden md:inline">Commandes</span>
            <span className="md:hidden">Commandes</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2 data-[state=active]:bg-jam-raspberry data-[state=active]:text-white">
            <Star className="h-4 w-4" />
            <span className="hidden md:inline">Favoris</span>
            <span className="md:hidden">Favoris</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2 data-[state=active]:bg-jam-raspberry data-[state=active]:text-white">
            <Award className="h-4 w-4" />
            <span className="hidden md:inline">Badges</span>
            <span className="md:hidden">Badges</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="flex justify-between">
                  <span>Mes confitures</span>
                  <span className="text-jam-raspberry">{userJams.length}</span>
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-2 pb-4">
                <Button asChild>
                  <Link to="/jam/create">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Créer une confiture
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="flex justify-between">
                  <span>Commandes</span>
                  <span className="text-jam-raspberry">{purchases.length}</span>
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-2 pb-4">
                <Button variant="outline" onClick={() => setActiveTab("orders")}>
                  Voir les détails
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="flex justify-between">
                  <span>Ventes</span>
                  <span className="text-jam-raspberry">{sales.length}</span>
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-2 pb-4">
                <Button variant="outline" onClick={() => setActiveTab("orders")}>
                  Voir les détails
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Confitures récentes</CardTitle>
                <CardDescription>
                  Vos dernières créations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userJams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userJams.slice(0, 3).map((jam) => (
                      <Link to={`/jam/${jam.id}`} key={jam.id} className="block">
                        <div className="border rounded-md overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-[4/3] bg-muted overflow-hidden">
                            {jam.cover_image_url ? (
                              <img
                                src={jam.cover_image_url || '/placeholder.svg'}
                                alt={jam.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-jam-honey/20">
                                <span className="text-jam-honey">Aucune image</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium line-clamp-1">{jam.name}</h3>
                              <Badge variant={jam.is_active ? "default" : "outline"}>
                                {jam.is_active ? "Publié" : "Brouillon"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{jam.description}</p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-sm">
                                {format(new Date(jam.created_at), 'dd MMM yyyy', { locale: fr })}
                              </span>
                              <span className="font-medium text-jam-raspberry">
                                {jam.price_credits} crédits
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Vous n'avez pas encore créé de confiture</p>
                    <Button asChild>
                      <Link to="/jam/create">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Créer ma première confiture
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              {userJams.length > 3 && (
                <CardFooter>
                  <Button variant="outline" onClick={() => setActiveTab("myjams")} className="w-full">
                    Voir toutes mes confitures
                  </Button>
                </CardFooter>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                  <CardDescription>
                    Analyse de votre activité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-jam-raspberry" />
                        Total des ventes
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {sales.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-jam-raspberry" />
                        Confitures en favoris
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {favorites.length}
                      </Badge>
                    </div>
                    {/* Add more statistics here */}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transactions récentes</CardTitle>
                  <CardDescription>
                    Derniers échanges de confitures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(purchases.length > 0 || sales.length > 0) ? (
                    <div className="space-y-3">
                      {[...purchases, ...sales]
                        .sort((a, b) => 
                          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        )
                        .slice(0, 3)
                        .map(order => {
                          const isPurchase = order.buyer_id === user?.id;
                          const otherParty = isPurchase 
                            ? (order.seller || {})
                            : (order.buyer || {});
                          
                          // Handle possible null values
                          const jamName = order.jam?.name || "Confiture";
                          const username = getProfileUsername(otherParty);
                          
                          return (
                            <div key={order.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ProfileDisplay profile={otherParty} showName={false} size="sm" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {isPurchase ? "Achat à" : "Vente à"} {username}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {jamName} - {format(new Date(order.created_at), 'dd MMM', { locale: fr })}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={isPurchase ? "outline" : "default"}>
                                {isPurchase ? "-" : "+"}{order.total_credits} crédits
                              </Badge>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      Aucune transaction récente
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => setActiveTab("orders")} className="w-full">
                    Voir toutes les transactions
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="myjams">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mes confitures</CardTitle>
                <CardDescription>
                  Gérez vos créations et suivez leur popularité
                </CardDescription>
              </div>
              <Button asChild>
                <Link to="/jam/create">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nouvelle confiture
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {userJams.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore créé de confiture
                  </p>
                  <Button asChild>
                    <Link to="/jam/create">
                      Créer ma première confiture
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userJams.map(jam => {
                    return (
                      <Link to={`/jam/${jam.id}`} key={jam.id} className="block">
                        <div className="border rounded-md overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-[4/3] bg-muted overflow-hidden">
                            {jam.cover_image_url ? (
                              <img
                                src={jam.cover_image_url || '/placeholder.svg'}
                                alt={jam.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-jam-honey/20">
                                <span className="text-jam-honey">Aucune image</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium line-clamp-1">{jam.name}</h3>
                              <Badge variant={jam.is_active ? "default" : "outline"}>
                                {jam.is_active ? "Publié" : "Brouillon"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{jam.description}</p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-sm">
                                {format(new Date(jam.created_at), 'dd MMM yyyy', { locale: fr })}
                              </span>
                              <span className="font-medium text-jam-raspberry">
                                {jam.price_credits} crédits
                              </span>
                            </div>
                            <div className="mt-3 flex gap-2 justify-end">
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/jam/${jam.id}`}>
                                  Voir
                                </Link>
                              </Button>
                              <Button size="sm" variant="default" asChild>
                                <Link to={`/jam/edit/${jam.id}`}>
                                  Éditer
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Mes commandes et ventes</CardTitle>
              <CardDescription>
                Suivez l'état de vos achats et ventes de confitures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(purchases.length === 0 && sales.length === 0) ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Aucune transaction pour le moment
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Purchases */}
                  {purchases.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">Mes achats</h4>
                      <div className="space-y-3">
                        {purchases.map(order => (
                          <div key={order.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={order.seller?.avatar_url || ''}
                                  alt={order.seller?.username || 'Vendeur'}
                                />
                                <AvatarFallback>
                                  {(order.seller?.username || 'V').substring(0, 1).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  Achat à {order.seller?.username || "un vendeur"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {order.jam?.name || "Confiture"} - {format(new Date(order.created_at), 'dd MMM', { locale: fr })}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              -{order.total_credits} crédits
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sales */}
                  {sales.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">Mes ventes</h4>
                      <div className="space-y-3">
                        {sales.map(order => (
                          <div key={order.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={order.buyer?.avatar_url || ''}
                                  alt={order.buyer?.username || 'Acheteur'}
                                />
                                <AvatarFallback>
                                  {(order.buyer?.username || 'A').substring(0, 1).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  Vente à {order.buyer?.username || "un acheteur"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {order.jam?.name || "Confiture"} - {format(new Date(order.created_at), 'dd MMM', { locale: fr })}
                                </p>
                              </div>
                            </div>
                            <Badge variant="default">
                              +{order.total_credits} crédits
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Mes confitures favorites</CardTitle>
              <CardDescription>
                Retrouvez toutes les confitures que vous avez aimé
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore ajouté de confiture à vos favoris
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map(jam => {
                    return (
                      <Link to={`/jam/${jam.id}`} key={jam.id} className="block">
                        <div className="border rounded-md overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-[4/3] bg-muted overflow-hidden">
                            {jam.cover_image_url ? (
                              <img
                                src={jam.cover_image_url || '/placeholder.svg'}
                                alt={jam.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-jam-honey/20">
                                <span className="text-jam-honey">Aucune image</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium line-clamp-1">{jam.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{jam.description}</p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-sm">
                                {format(new Date(jam.created_at), 'dd MMM yyyy', { locale: fr })}
                              </span>
                              <span className="font-medium text-jam-raspberry">
                                {jam.price_credits} crédits
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Mes Badges</CardTitle>
              <CardDescription>
                Collectionnez des badges en participant à la communauté
              </CardDescription>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore débloqué de badge
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {badges.map(badge => (
                    <div key={badge?.id} className="flex flex-col items-center justify-center p-4 border rounded-md">
                      <div className="h-16 w-16 rounded-full overflow-hidden mb-2">
                        <img src={badge?.image_url || '/placeholder.svg'} alt={badge?.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-sm font-medium">{badge?.name}</h4>
                      <p className="text-xs text-muted-foreground text-center">{badge?.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
