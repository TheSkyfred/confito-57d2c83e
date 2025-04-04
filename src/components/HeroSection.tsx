
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Coffee } from "lucide-react"

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-jam-honey/20 via-white to-jam-raspberry/10 overflow-hidden">
      {/* Formes décoratives */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-jam-raspberry/10 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 -left-20 w-80 h-80 rounded-full bg-jam-honey/10 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-40 right-20 w-96 h-96 rounded-full bg-jam-leaf/5 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container relative z-10 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center md:gap-8 lg:gap-16">
          <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
            <div className="inline-flex items-center gap-1.5 bg-jam-raspberry/10 text-jam-raspberry rounded-full px-3 py-1 text-sm font-medium mb-4">
              <Coffee className="h-4 w-4" />
              Communauté de passionnés
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-jam-dark">
              Échangez vos <span className="text-jam-raspberry">confitures</span> artisanales
            </h1>
            
            <p className="text-lg md:text-xl mb-6 text-jam-dark/80 max-w-2xl">
              Rejoignez notre communauté pour découvrir, partager et échanger des confitures uniques faites avec passion.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button asChild size="lg" className="bg-jam-raspberry hover:bg-jam-raspberry/90">
                <Link to="/explore">Découvrir les confitures</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/register">Créer un compte</Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-2 mt-8">
              <p className="text-sm font-medium">Déjà plus de 500 confitures échangées !</p>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="relative bg-white p-3 rounded-lg shadow-lg rotate-3 transform">
              <img 
                src="https://images.unsplash.com/photo-1623227866882-c005c26dfe41?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80" 
                alt="Assortiment de confitures" 
                className="w-full h-auto rounded"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white p-2 rounded-lg shadow-lg -rotate-6 transform hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1600853225238-63d010a87b95?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                alt="Pot de confiture" 
                className="w-32 h-32 object-cover rounded"
              />
            </div>
            <div className="absolute -top-6 -right-2 bg-white p-2 rounded-lg shadow-lg rotate-12 transform hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1621939261909-2b7f8980f200?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
                alt="Fraises fraîches" 
                className="w-24 h-24 object-cover rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
