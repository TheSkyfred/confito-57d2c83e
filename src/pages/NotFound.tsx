import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bottle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-muted/30 py-12">
        <div className="container max-w-md text-center">
          <div className="mb-8">
            <Bottle className="h-20 w-20 mx-auto text-jam-raspberry" />
          </div>
          
          <h1 className="text-4xl font-serif font-bold mb-4 text-jam-dark">Oups ! Page introuvable</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            La confiture que vous recherchez semble avoir disparu de nos étagères. 
            Peut-être a-t-elle déjà été dégustée ?
          </p>
          
          <div className="space-y-4">
            <Button asChild className="bg-jam-raspberry hover:bg-jam-raspberry/90 w-full">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/explore">Explorer nos confitures</Link>
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-muted-foreground">
            Erreur 404 : Page non trouvée - {location.pathname}
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
