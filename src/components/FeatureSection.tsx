
import React from 'react';
import { CheckCircle, Star, ShieldCheck, Medal } from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      icon: <CheckCircle className="h-10 w-10 text-jam-raspberry" />,
      title: "Qualité garantie",
      description: "Toutes nos confitures sont produites artisanalement avec des ingrédients sélectionnés."
    },
    {
      icon: <Star className="h-10 w-10 text-jam-honey" />,
      title: "Saveurs uniques",
      description: "Découvrez des recettes originales et des associations de goûts surprenantes."
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-jam-leaf" />,
      title: "Communauté vérifiée",
      description: "Tous nos producteurs sont vérifiés et respectent une charte de qualité stricte."
    },
    {
      icon: <Medal className="h-10 w-10 text-jam-raspberry" />,
      title: "Battles exclusifs",
      description: "Participez à nos compétitions et faites juger vos confitures par la communauté."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <h2 className="text-3xl font-serif font-bold text-center mb-12">Pourquoi rejoindre notre communauté ?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
