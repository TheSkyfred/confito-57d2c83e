
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import HeroSection from '@/components/HeroSection';
import SeasonalFruit from '@/components/SeasonalFruit';
import JamCard from '@/components/JamCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function Index() {
  // Récupération des confitures en vedette
  const { data: featuredJams, isLoading } = useQuery({
    queryKey: ['featured_jams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jams')
        .select(`
          *,
          profiles:creator_id (username, avatar_url),
          jam_images (*),
          reviews:reviews (rating)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (error) throw error;

      // Transformer les données pour calculer la note moyenne
      return data.map((jam: any) => {
        const ratings = jam.reviews.map((r: any) => r.rating);
        const average_rating = ratings.length > 0 
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length 
          : null;
        
        // Simuler le nombre de badges pour l'utilisateur
        const badge_count = Math.floor(Math.random() * 5);
        
        return {
          ...jam,
          average_rating,
          badge_count
        };
      });
    },
  });
  
  const handleAddToCart = () => {
    toast.success("Confiture ajoutée au panier !");
  };

  const handleToggleFavorite = () => {
    toast.success("Confiture ajoutée aux favoris !");
  };
  
  // Témoignages
  const testimonials = [
    {
      id: 1,
      text: "J'ai découvert des confitures incroyables que je n'aurais jamais pu trouver en magasin. La qualité et les saveurs sont incomparables !",
      author: "Sophie L.",
      role: "Gourmande passionnée",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop"
    },
    {
      id: 2,
      text: "Grâce à JamJam, j'ai pu partager mes créations avec d'autres passionnés et recevoir des retours constructifs pour améliorer mes recettes.",
      author: "Michel P.",
      role: "Confiturier amateur",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&auto=format&fit=crop"
    },
    {
      id: 3,
      text: "La communauté est bienveillante et les échanges de confitures m'ont permis de découvrir des combinaisons de saveurs étonnantes.",
      author: "Camille D.",
      role: "Chef cuisinière",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&auto=format&fit=crop"
    }
  ];

  return (
    <>
      <HeroSection />
      
      {/* Confitures en vedette */}
      <div className="container py-16">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Confitures <span className="text-jam-raspberry">en vedette</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les confitures les plus appréciées par notre communauté, 
            préparées avec passion par nos confituriers artisanaux.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 h-80 flex items-center justify-center">
                  <div className="animate-pulse text-center">
                    <div className="h-40 w-full bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 w-3/4 bg-slate-200 rounded mb-2 mx-auto"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded mx-auto"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : featuredJams && featuredJams.length > 0 ? (
            featuredJams.map((jam: any) => {
              // Trouver l'image principale ou prendre la première
              const primaryImage = jam.jam_images.find((img: any) => img.is_primary)?.url || 
                                 jam.jam_images[0]?.url || 
                                 'https://images.unsplash.com/photo-1600853225238-63d010a87b95?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80';
              
              return (
                <JamCard
                  key={jam.id}
                  id={jam.id}
                  name={jam.name}
                  description={jam.description}
                  imageUrl={primaryImage}
                  price={jam.price_credits}
                  rating={jam.average_rating || undefined}
                  user={{
                    name: jam.profiles.username,
                    avatarUrl: jam.profiles.avatar_url || undefined,
                    badgeCount: jam.badge_count
                  }}
                  tags={jam.ingredients.slice(0, 3)}
                  onAddToCart={() => handleAddToCart()}
                  onToggleFavorite={() => handleToggleFavorite()}
                />
              );
            })
          ) : (
            <p className="col-span-full text-center">Aucune confiture disponible pour le moment.</p>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Button size="lg" asChild>
            <Link to="/explore">Voir toutes les confitures</Link>
          </Button>
        </div>
      </div>
      
      {/* Fruits de saison */}
      <div className="bg-gradient-to-r from-jam-honey/10 to-jam-raspberry/10 py-16">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold mb-4">
              Fruits de saison : <span className="text-jam-raspberry">c'est le moment !</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Préparez vos confitures avec les meilleurs fruits du moment pour des saveurs incomparables.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <SeasonalFruit />
          </div>
          
          <div className="text-center">
            <Button asChild>
              <Link to="/seasonal-calendar">Voir le calendrier complet</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Témoignages */}
      <div className="container py-16">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ce que disent <span className="text-jam-raspberry">nos membres</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les expériences partagées par notre communauté de confituriers et gourmands passionnés.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-jam-raspberry to-jam-honey" />
                <div className="flex flex-col h-full">
                  <div className="flex-grow">
                    <p className="text-lg italic mb-6">"{testimonial.text}"</p>
                  </div>
                  <Separator className="mb-4" />
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-gradient-to-br from-jam-raspberry/90 to-jam-dark py-16 text-white">
        <div className="container text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            Prêt à rejoindre la communauté JamJam ?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Inscrivez-vous dès maintenant pour échanger vos confitures, 
            partager vos recettes et découvrir de nouvelles saveurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default" className="bg-white text-jam-raspberry hover:bg-white/90">
              <Link to="/auth">Créer un compte</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/explore">Explorer les confitures</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
