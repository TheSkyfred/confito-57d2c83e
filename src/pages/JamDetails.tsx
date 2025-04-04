
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreditBadge } from '@/components/ui/credit-badge';
import { Heart, Package, Star, Weight, Clock, AlarmClock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function JamDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { data: jam, isLoading, isError } = useQuery({
    queryKey: ['jam', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jams')
        .select(`
          *,
          profiles:creator_id (id, username, avatar_url, full_name),
          jam_images (*),
          reviews (*, reviewer:reviewer_id(username, avatar_url))
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Vous devez être connecté pour commander", {
        action: {
          label: "Se connecter",
          onClick: () => window.location.href = "/auth",
        },
      });
      return;
    }
    
    toast.success("Confiture ajoutée au panier !");
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast("Vous devez être connecté pour ajouter aux favoris");
      return;
    }
    
    toast.success("Confiture ajoutée aux favoris !");
  };

  if (isLoading) {
    return (
      <div className="container py-12 text-center">
        Chargement des détails de la confiture...
      </div>
    );
  }

  if (isError || !jam) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Confiture non trouvée</h2>
        <p>La confiture que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button className="mt-6" asChild>
          <Link to="/explore">Voir toutes les confitures</Link>
        </Button>
      </div>
    );
  }

  // Trouver l'image principale ou prendre la première
  const primaryImage = jam.jam_images.find(img => img.is_primary)?.url || 
                       jam.jam_images[0]?.url || 
                       'https://images.unsplash.com/photo-1600853225238-63d010a87b95?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80';
  
  // Calculer la note moyenne
  const reviews = jam.reviews || [];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link to="/explore" className="text-jam-raspberry hover:underline flex items-center gap-2">
          ← Retour aux confitures
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="rounded-lg overflow-hidden mb-4">
            <img 
              src={primaryImage} 
              alt={jam.name} 
              className="w-full h-auto object-cover" 
            />
          </div>
          
          {jam.jam_images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {jam.jam_images.slice(0, 4).map((image) => (
                <div key={image.id} className="rounded-md overflow-hidden cursor-pointer">
                  <img 
                    src={image.url} 
                    alt={jam.name} 
                    className="w-full h-20 object-cover" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Détails */}
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">{jam.name}</h1>
          
          <div className="flex items-center gap-6 mb-4">
            <Link to={`/profile/${jam.profiles.id}`} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={jam.profiles.avatar_url || undefined} />
                <AvatarFallback>{jam.profiles.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{jam.profiles.username}</span>
            </Link>
            
            {averageRating !== null && (
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-jam-honey text-jam-honey" />
                <span>{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews.length} avis)</span>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <p className="text-lg mb-4">{jam.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {jam.ingredients.map((ingredient, i) => (
                <Badge key={i} variant="secondary">{ingredient}</Badge>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Weight className="h-4 w-4 text-jam-raspberry" />
                <span>{jam.weight_grams}g</span>
              </div>
              {jam.sugar_content && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-jam-raspberry" />
                  <span>{jam.sugar_content}% de sucre</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-jam-raspberry" />
                <span>{jam.available_quantity} disponibles</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-jam-raspberry" />
                <span>Créée le {new Date(jam.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {jam.allergens && jam.allergens.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Allergènes:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jam.allergens.map((allergen, i) => (
                    <Badge key={i} variant="outline" className="text-orange-500 border-orange-500">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between py-4">
              <CreditBadge amount={jam.price_credits} size="lg" />
              
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={handleToggleFavorite}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                
                <Button 
                  className="bg-jam-raspberry hover:bg-jam-raspberry/90 gap-2"
                  onClick={handleAddToCart}
                >
                  <Package className="h-4 w-4" />
                  Commander
                </Button>
              </div>
            </div>
          </div>
          
          {jam.recipe && (
            <>
              <Separator className="my-6" />
              
              <div>
                <h2 className="font-serif text-xl font-bold mb-4">Recette</h2>
                <p className="whitespace-pre-line">{jam.recipe}</p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Avis */}
      <Separator className="my-8" />
      
      <h2 className="font-serif text-2xl font-bold mb-6">Avis et commentaires</h2>
      
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">Cette confiture n'a pas encore d'avis.</p>
            {user && (
              <Button className="mt-4 bg-jam-honey hover:bg-jam-honey/90">
                Laisser un avis
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewer.avatar_url || undefined} />
                      <AvatarFallback>{review.reviewer.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.reviewer.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < review.rating ? 'fill-jam-honey text-jam-honey' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                
                {review.comment && (
                  <div className="mt-4">
                    <p>{review.comment}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {user && (
            <Button className="mt-4 bg-jam-honey hover:bg-jam-honey/90">
              Laisser un avis
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
