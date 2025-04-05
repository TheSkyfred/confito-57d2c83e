import React, { useEffect, useState } from 'react'
import HeroSection from '@/components/HeroSection'
import JamCard from '@/components/JamCard'
import SeasonalFruit from '@/components/SeasonalFruit'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ChevronRight, Award, TrendingUp, Heart, Users } from 'lucide-react'
import { JamType, ProfileType } from '@/types/supabase'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

const Index = () => {
  const [featuredJams, setFeaturedJams] = useState<JamType[]>([]);
  const [popularJams, setPopularJams] = useState<JamType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJams = async () => {
      try {
        setLoading(true);
        
        // Fetch featured jams - newest jams
        const { data: featuredData, error: featuredError } = await supabase
          .from('jams')
          .select(`
            *,
            jam_images (*),
            profiles:creator_id (*),
            reviews (*)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(4);
          
        if (featuredError) throw featuredError;
        
        // Fetch popular jams - highest rated
        const { data: popularData, error: popularError } = await supabase
          .from('jams')
          .select(`
            *,
            jam_images (*),
            profiles:creator_id (*),
            reviews (*)
          `)
          .eq('is_active', true)
          .order('price_credits', { ascending: true }) // As a proxy for popularity
          .limit(4);
          
        if (popularError) throw popularError;

        // Process jam data to calculate average ratings
        const processJams = (jams: any[]): JamType[] => {
          return jams.map(jam => {
            const reviews = jam.reviews || [];
            const avgRating = reviews.length > 0
              ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
              : 0;
            
            return {
              ...jam,
              avgRating
            };
          });
        };
        
        setFeaturedJams(processJams(featuredData));
        setPopularJams(processJams(popularData));
      } catch (error) {
        console.error('Error fetching jams:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les confitures",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJams();
  }, [toast]);

  const handleAddToCart = (id: string) => {
    console.log(`Ajouter au panier: ${id}`);
  };

  const handleToggleFavorite = (id: string) => {
    console.log(`Toggle favori: ${id}`);
  };
  
  const createFakeUsers = async () => {
    try {
      toast({
        title: "Création en cours",
        description: "Création de 20 utilisateurs fictifs...",
      });
      
      const response = await fetch("https://vbjitiitrxbiyznrfvyx.functions.supabase.co/seed-users", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: 20 }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Succès",
          description: `${data.count} utilisateurs fictifs créés.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de la création des utilisateurs.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating fake users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer les utilisateurs fictifs.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <HeroSection />

      <section className="py-12 bg-white">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-center mb-10">
            Comment fonctionne <span className="text-jam-raspberry">Jam-Jar Jamboree</span> ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-jam-honey/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-serif font-bold text-jam-honey">1</span>
              </div>
              <h3 className="text-lg font-serif font-medium mb-2">Créez votre compte</h3>
              <p className="text-muted-foreground">Inscrivez-vous en quelques clics et présentez-vous à la communauté.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-jam-raspberry/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-serif font-bold text-jam-raspberry">2</span>
              </div>
              <h3 className="text-lg font-serif font-medium mb-2">Ajoutez vos confitures</h3>
              <p className="text-muted-foreground">Partagez vos créations avec photos, recettes et descriptions.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-jam-leaf/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-serif font-bold text-jam-leaf">3</span>
              </div>
              <h3 className="text-lg font-serif font-medium mb-2">Échangez des pots</h3>
              <p className="text-muted-foreground">Utilisez des crédits pour échanger vos confitures avec d'autres membres.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-jam-dark/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-serif font-bold text-jam-dark">4</span>
              </div>
              <h3 className="text-lg font-serif font-medium mb-2">Partagez vos avis</h3>
              <p className="text-muted-foreground">Notez les confitures reçues et participez à la vie de la communauté.</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="gap-1">
              <Link to="/how-it-works">
                En savoir plus
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
              <Award className="h-6 w-6 text-jam-honey" />
              Nouveautés
            </h2>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/explore">
                Voir toutes
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg border border-muted bg-background p-4 h-64 animate-pulse">
                  <div className="aspect-square bg-muted rounded-md mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))
            ) : featuredJams.length > 0 ? (
              featuredJams.map((jam) => (
                <Link to={`/jam/${jam.id}`} key={jam.id}>
                  <JamCard jam={jam} />
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center py-8">
                <p className="text-muted-foreground mb-4">Aucune confiture n'a été trouvée.</p>
                <Button variant="outline" onClick={createFakeUsers}>
                  Créer 20 utilisateurs fictifs
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <SeasonalFruit />
              
              <div className="mt-8">
                <h3 className="text-xl font-serif font-bold flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-jam-raspberry" />
                  Rejoignez la communauté
                </h3>
                
                <div className="bg-gradient-to-br from-jam-raspberry/10 to-jam-honey/10 rounded-lg p-6 text-center">
                  <p className="mb-4 font-medium">Déjà plus de 1200 confituriers passionnés !</p>
                  <div className="flex -space-x-4 mb-4 justify-center">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <img 
                        key={i}
                        className="w-10 h-10 border-2 border-white rounded-full"
                        src={`https://i.pravatar.cc/150?img=${20 + i}`}
                        alt={`Membre ${i}`} 
                      />
                    ))}
                    <div className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-jam-raspberry rounded-full border-2 border-white">
                      +99
                    </div>
                  </div>
                  
                  <Button className="w-full bg-jam-raspberry hover:bg-jam-raspberry/90" asChild>
                    <Link to="/register">Créer un compte</Link>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-jam-raspberry" />
                  Confitures populaires
                </h2>
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link to="/popular">
                    Voir toutes
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="rounded-lg border border-muted bg-background p-4 h-64 animate-pulse">
                      <div className="aspect-square bg-muted rounded-md mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))
                ) : popularJams.length > 0 ? (
                  popularJams.map((jam) => (
                    <Link to={`/jam/${jam.id}`} key={jam.id}>
                      <JamCard jam={jam} />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-muted-foreground">Aucune confiture populaire n'a été trouvée.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-jam-dark text-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Prêt à rejoindre la révolution des confitures ?
            </h2>
            <p className="text-lg mb-8 text-jam-cream/80">
              Inscrivez-vous dès aujourd'hui et recevez 10 crédits gratuits pour commencer à échanger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-jam-raspberry hover:bg-jam-raspberry/90" asChild>
                <Link to="/register">S'inscrire gratuitement</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-jam-cream/30 text-jam-cream hover:bg-white/10" asChild>
                <Link to="/explore">Explorer les confitures</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Index
