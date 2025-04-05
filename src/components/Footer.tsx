
import { Link } from "react-router-dom"
import { Coffee } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-jam-dark text-jam-cream">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-jam-honey" />
              <span className="font-serif text-xl font-bold text-jam-cream">
                Con<span className="text-jam-raspberry">fito</span>
              </span>
            </div>
            <p className="mt-4 text-sm">
              La communauté des passionnés de confitures artisanales.
              Échangez, partagez et découvrez des saveurs uniques.
            </p>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-serif text-lg mb-3">Explorer</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-sm hover:text-jam-honey transition-colors">
                  Découvrir des confitures
                </Link>
              </li>
              <li>
                <Link to="/battles" className="text-sm hover:text-jam-honey transition-colors">
                  Battles de confitures
                </Link>
              </li>
              <li>
                <Link to="/seasonal" className="text-sm hover:text-jam-honey transition-colors">
                  Fruits de saison
                </Link>
              </li>
              <li>
                <Link to="/rankings" className="text-sm hover:text-jam-honey transition-colors">
                  Classements
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-serif text-lg mb-3">Communauté</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auth" className="text-sm hover:text-jam-honey transition-colors">
                  Se connecter / S'inscrire
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm hover:text-jam-honey transition-colors">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link to="/credits" className="text-sm hover:text-jam-honey transition-colors">
                  Système de crédits
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm hover:text-jam-honey transition-colors">
                  Foire aux questions
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-serif text-lg mb-3">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm hover:text-jam-honey transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-jam-honey transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm hover:text-jam-honey transition-colors">
                  Gestion des cookies
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-jam-honey transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-jam-cream/70">
          <p>© {new Date().getFullYear()} Confito. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
