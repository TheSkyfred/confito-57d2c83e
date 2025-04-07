
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import JamCard from '@/components/JamCard'
import SeasonalFruit from '@/components/SeasonalFruit'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ChevronRight, Award, TrendingUp, Heart, Users } from 'lucide-react'
import { JamType } from '@/types/supabase'

const createMockJam = (data: any): JamType => ({
  id: data.id,
  name: data.name,
  description: data.description,
  creator_id: data.user?.name || "unknown",
  ingredients: data.tags || [],
  allergens: null,
  weight_grams: 250,
  sugar_content: null,
  price_credits: data.price,
  available_quantity: 10,
  recipe: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  jam_images: [
    {
      id: `img-${data.id}`,
      jam_id: data.id,
      url: data.imageUrl || '/placeholder.svg',
      is_primary: true,
      created_at: new Date().toISOString()
    }
  ],
  avgRating: data.rating,
  profiles: {
    id: "user-1",
    username: data.user?.name || "unknown",
    full_name: data.user?.name || null,
    avatar_url: data.user?.avatarUrl || null,
    bio: null,
    address: null,
    phone: null,
    website: null,
    credits: 100,
    role: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  reviews: []
});

const featuredJamData = [
  {
    id: "1",
    name: "Confiture de Fraises Basilic",
    description: "Une combinaison étonnante et rafraîchissante de fraises juteuses et de basilic frais.",
    imageUrl: "https://images.unsplash.com/photo-1623227866882-c005c26dfe41?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    price: 5,
    rating: 4.8,
    user: {
      name: "Marie D.",
      avatarUrl: "https://i.pravatar.cc/150?img=28",
      badgeCount: 3
    },
    tags: ["fraise", "basilic", "été"],
    isFavorite: false
  },
  {
    id: "2",
    name: "Gelée de Mûres Sauvages",
    description: "Récoltées à la main dans nos forêts locales, ces mûres sauvages offrent une gelée au goût intense et naturel.",
    imageUrl: "https://images.unsplash.com/photo-1600853225238-63d010a87b95?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    price: 7,
    rating: 4.5,
    user: {
      name: "Pierre L.",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      badgeCount: 1
    },
    tags: ["mûre", "sans pépins", "récolte sauvage"],
    isFavorite: true
  },
  {
    id: "3",
    name: "Confiture d'Abricots à la Lavande",
    description: "Les abricots du sud de la France rencontrent la lavande de Provence pour une expérience gustative unique.",
    imageUrl: "https://images.unsplash.com/photo-1621939261909-2b7f8980f200?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    price: 6,
    rating: 4.7,
    user: {
      name: "Sophie M.",
      avatarUrl: "https://i.pravatar.cc/150?img=23",
      badgeCount: 5
    },
    tags: ["abricot", "lavande", "Provence"],
    isFavorite: false
  },
  {
    id: "4",
    name: "Marmelade d'Orange Amère",
    description: "Une marmelade traditionnelle avec un équilibre parfait entre l'amertume des écorces et la douceur du fruit.",
    imageUrl: "https://images.unsplash.com/photo-1618591272043-bc91152d3ff0?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    price: 8,
    rating: 4.9,
    user: {
      name: "Thomas G.",
      avatarUrl: "https://i.pravatar.cc/150?img=15",
      badgeCount: 2
    },
    tags: ["orange", "agrume", "petit déjeuner"],
    isFavorite: false
  }
];

const popularJamData = [
  {
    id: "5",
    name: "Confiture de Pêches Blanches",
    description: "Des pêches blanches juteuses pour une confiture douce et parfumée qui ravira vos papilles.",
    imageUrl: "https://images.unsplash.com/photo-1601493700750-5b1b2a399d39?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    price: 6,
    rating: 4.6,
    user: {
      name: "Léa F.",
      avatarUrl: "https://i.pravatar.cc/150?img=5",
      badgeCount: 4
    },
    tags: ["pêche", "été", "dessert"],
    isFavorite: false
  },
  {
    id: "6",
    name: "Confiture de Figues au Vin Rouge",
    description: "Des figues mûres mijotées avec du vin rouge et des épices pour une confiture riche et festive.",
    imageUrl: "https://images.unsplash.com/photo-1515512713581-188c8fb34ae2?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    price: 9,
    rating: 4.8,
    user: {
      name: "Nicolas P.",
      avatarUrl: "https://i.pravatar.cc/150?img=18",
      badgeCount: 3
    },
    tags: ["figue", "vin rouge", "épices"],
    isFavorite: true
  },
  {
    id: "7",
    name: "Confiture de Rhubarbe Vanillée",
    description: "L'acidité de la rhubarbe adoucie par la vanille pour un équilibre parfait.",
    imageUrl: "https://images.unsplash.com/photo-1598120746311-69b0616fce52?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    price: 5,
    rating: 4.4,
    user: {
      name: "Claire B.",
      avatarUrl: "https://i.pravatar.cc/150?img=35",
      badgeCount: 1
    },
    tags: ["rhubarbe", "vanille", "printemps"],
    isFavorite: false
  },
  {
    id: "8",
    name: "Gelée de Pommes à la Cannelle",
    description: "Une gelée transparente aux pommes avec une touche de cannelle, parfaite sur une tartine ou avec du fromage.",
    imageUrl: "https://images.unsplash.com/photo-1557925923-cd4648e211a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
    price: 4,
    rating: 4.5,
    user: {
      name: "Antoine M.",
      avatarUrl: "https://i.pravatar.cc/150?img=10",
      badgeCount: 2
    },
    tags: ["pomme", "cannelle", "automne"],
    isFavorite: false
  }
];

const featuredJams = featuredJamData.map(createMockJam);
const popularJams = popularJamData.map(createMockJam);

const Index = () => {
  const handleAddToCart = (id: string) => {
    console.log(`Ajouter au panier: ${id}`);
  };

  const handleToggleFavorite = (id: string) => {
    console.log(`Toggle favori: ${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HeroSection />

        <section className="py-12 bg-white">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-center mb-10">
              Comment fonctionne <span className="text-jam-raspberry">Confito</span> ?
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
                Confitures en vedette
              </h2>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/explore">
                  Voir toutes
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredJams.map((jam) => (
                <Link to={`/jam/${jam.id}`} key={jam.id}>
                  <JamCard jam={jam} />
                </Link>
              ))}
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
                  {popularJams.map((jam) => (
                    <Link to={`/jam/${jam.id}`} key={jam.id}>
                      <JamCard jam={jam} />
                    </Link>
                  ))}
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
      </main>
    </div>
  )
}

export default Index
