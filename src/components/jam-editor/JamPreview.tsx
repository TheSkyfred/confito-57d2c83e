
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { 
  Tag, 
  Info, 
  ShoppingCart,
  Clock, 
  AlertCircle,
  Star, 
  FileDown
} from 'lucide-react';

// Map category values to readable labels
const categoryLabels: Record<string, string> = {
  'classic': 'Classique (fruits)',
  'vegetable': 'Légumes',
  'floral': 'Florale',
  'spicy': 'Épicée',
  'exotic': 'Exotique',
  'mixed': 'Mixte (fruits et légumes)'
};

// Map tag IDs to readable labels
const tagLabels: Record<string, string> = {
  'bio': 'Bio',
  'vegan': 'Végan',
  'sans-sucre': 'Sans sucre ajouté',
  'local': 'Produits locaux',
  'edition-limitee': 'Édition limitée',
  'artisanal': 'Artisanal'
};

interface JamPreviewProps {
  data: any;
  imageUrl: string | null;
}

const JamPreview = ({ data, imageUrl }: JamPreviewProps) => {
  if (!data) return null;
  
  // Extract allergens from ingredients
  const allergens = data.ingredients
    .filter((ing: any) => ing.is_allergen)
    .map((ing: any) => ing.name);
    
  // Format expiration date if we have packaging date and preservation months
  let expirationDate = null;
  if (data.packaging_date && data.preservation_months) {
    const packagingDate = new Date(data.packaging_date);
    expirationDate = new Date(packagingDate);
    expirationDate.setMonth(expirationDate.getMonth() + data.preservation_months);
  }
  
  const generateLabel = () => {
    // This would be replaced by real label generation logic
    return (
      <div className="border border-dashed border-gray-300 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Fonctionnalité d'aperçu d'étiquette disponible après publication
        </p>
        <Button variant="outline" size="sm" className="mt-3">
          <FileDown className="h-4 w-4 mr-2" />
          Générer l'étiquette
        </Button>
      </div>
    );
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={data.name}
                className="w-full h-full object-cover aspect-square"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center min-h-[200px]">
                <span className="text-muted-foreground">Pas d'image disponible</span>
              </div>
            )}
          </div>
          
          <div className="p-6 md:w-2/3">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className="bg-muted/50">
                {categoryLabels[data.category] || data.category}
              </Badge>
              
              {data.special_jar && (
                <Badge className="bg-jam-honey text-jam-dark">Bocal spécial</Badge>
              )}
              
              {data.tags && data.tags.map((tag: string) => (
                <Badge key={tag} className="bg-jam-raspberry">
                  {tagLabels[tag] || tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-2xl font-serif font-bold mb-2">{data.name}</h1>
            
            {data.description && (
              <p className="text-gray-600 mb-4">{data.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mt-4">
              <div className="text-sm text-gray-600 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                <span>{data.weight_grams}g</span>
              </div>
              
              {data.packaging_date && (
                <div className="text-sm text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Mise en bocal: {format(new Date(data.packaging_date), 'PP', { locale: fr })}</span>
                </div>
              )}
              
              <div className="text-sm text-gray-600 flex items-center">
                <ShoppingCart className="h-4 w-4 mr-1" />
                <span>{data.available_quantity} pot{data.available_quantity > 1 ? 's' : ''} disponible{data.available_quantity > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center">
              <span className="text-2xl font-bold text-jam-raspberry">
                {data.price_credits} crédit{data.price_credits > 1 ? 's' : ''}
              </span>
              
              <Button className="ml-auto bg-jam-raspberry hover:bg-jam-raspberry/90">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter au panier
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ingredients">
              <AccordionTrigger>Ingrédients</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <ul className="list-disc pl-5 space-y-2">
                    {data.ingredients.map((ing: any, i: number) => (
                      <li key={i} className="text-gray-700">
                        <span className="font-medium">{ing.name}</span>
                        {ing.quantity && <span className="text-gray-500 ml-1">({ing.quantity})</span>}
                      </li>
                    ))}
                  </ul>
                  
                  {allergens.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-3">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-sm font-medium text-amber-800">Contient des allergènes:</span>
                      </div>
                      <p className="text-sm text-amber-700 mt-1">
                        {allergens.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {data.recipe_steps && data.recipe_steps.length > 0 && (
              <AccordionItem value="recipe">
                <AccordionTrigger>Recette</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    {data.recipe_steps.map((step: any, i: number) => (
                      <div key={i} className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="rounded-full w-8 h-8 bg-jam-raspberry flex items-center justify-center text-white font-bold">
                            {i + 1}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-700">{step.description}</p>
                          {step.duration_minutes > 0 && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {step.duration_minutes} minute{step.duration_minutes > 1 ? 's' : ''}
                            </p>
                          )}
                          
                          {step.image_url && (
                            <img 
                              src={step.image_url} 
                              alt={`Étape ${i + 1}`} 
                              className="mt-2 rounded-md max-w-[200px] max-h-[150px] object-cover"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            
            <AccordionItem value="info">
              <AccordionTrigger>Informations</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Détails produit</h4>
                    <dl className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Poids</dt>
                        <dd className="text-sm font-medium">{data.weight_grams}g</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Type</dt>
                        <dd className="text-sm font-medium">{categoryLabels[data.category] || data.category}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Pot spécial</dt>
                        <dd className="text-sm font-medium">{data.special_jar ? 'Oui' : 'Non'}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Conservation</h4>
                    <dl className="mt-2 space-y-1">
                      {data.packaging_date && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Mise en bocal</dt>
                          <dd className="text-sm font-medium">
                            {format(new Date(data.packaging_date), 'PP', { locale: fr })}
                          </dd>
                        </div>
                      )}
                      {data.preservation_months && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Durée de conservation</dt>
                          <dd className="text-sm font-medium">{data.preservation_months} mois</dd>
                        </div>
                      )}
                      {expirationDate && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">À consommer avant</dt>
                          <dd className="text-sm font-medium">
                            {format(expirationDate, 'PP', { locale: fr })}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="label">
              <AccordionTrigger>Étiquette</AccordionTrigger>
              <AccordionContent>
                {generateLabel()}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      
      {data.is_draft && (
        <div className="bg-muted p-4 rounded-md text-center mb-8">
          <Info className="inline-block h-5 w-5 text-muted-foreground mb-2" />
          <h4 className="font-medium">Aperçu en mode brouillon</h4>
          <p className="text-sm text-muted-foreground">
            Ce que vous voyez est un aperçu de votre confiture en mode brouillon.
            Elle ne sera visible par d'autres utilisateurs qu'une fois publiée.
          </p>
        </div>
      )}
    </div>
  );
};

export default JamPreview;
