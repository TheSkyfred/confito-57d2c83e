import React, { useState } from 'react';
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
  FileDown,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import { RecipeStep } from './RecipeForm';
import { CreditBadge } from '@/components/ui/credit-badge';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/stores/useCartStore';

const categoryLabels: Record<string, string> = {
  'classic': 'Classique (fruits)',
  'vegetable': 'Légumes',
  'floral': 'Florale',
  'spicy': 'Épicée',
  'exotic': 'Exotique',
  'mixed': 'Mixte (fruits et légumes)'
};

const tagLabels: Record<string, string> = {
  'bio': 'Bio',
  'vegan': 'Végan',
  'sans-sucre': 'Sans sucre ajouté',
  'local': 'Produits locaux',
  'edition-limitee': 'Édition limitée',
  'artisanal': 'Artisanal'
};

export interface JamPreviewProps {
  formData: {
    name: string;
    description: string;
    type?: string;
    badges?: string[];
    ingredients: Array<{name: string; quantity: string}>;
    allergens: string[];
    production_date?: string;
    weight_grams: number;
    available_quantity: number;
    shelf_life_months?: number;
    special_edition?: boolean;
    price_credits: number;
    recipe_steps: RecipeStep[];
    is_active: boolean;
    images?: File[];
    main_image_index?: number;
    [key: string]: any;
  };
  fullPreview?: boolean;
}

const JamPreview = ({ formData, fullPreview = false }: JamPreviewProps) => {
  const [quantity, setQuantity] = useState(1);
  
  if (!formData) return null;
  
  const imageUrl = formData.images && formData.images.length > 0 && formData.main_image_index !== undefined
    ? URL.createObjectURL(formData.images[formData.main_image_index])
    : null;
    
  let expirationDate = null;
  if (formData.production_date && formData.shelf_life_months) {
    const productionDate = new Date(formData.production_date);
    expirationDate = new Date(productionDate);
    expirationDate.setMonth(expirationDate.getMonth() + formData.shelf_life_months);
  }
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= formData.available_quantity) {
      setQuantity(newQuantity);
    }
  };
  
  const generateLabel = () => {
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
                alt={formData.name}
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
              {formData.type && (
                <Badge variant="outline" className="bg-muted/50">
                  {categoryLabels[formData.type] || formData.type}
                </Badge>
              )}
              
              {formData.special_edition && (
                <Badge className="bg-jam-honey text-jam-dark">Bocal spécial</Badge>
              )}
              
              {formData.badges && formData.badges.map((tag: string) => (
                <Badge key={tag} className="bg-jam-raspberry">
                  {tagLabels[tag] || tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-2xl font-serif font-bold mb-2">{formData.name || 'Sans titre'}</h1>
            
            {formData.description && (
              <p className="text-gray-600 mb-4">{formData.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mt-4">
              <div className="text-sm text-gray-600 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                <span>{formData.weight_grams}g</span>
              </div>
              
              {formData.production_date && (
                <div className="text-sm text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Mise en bocal: {format(new Date(formData.production_date), 'PP', { locale: fr })}</span>
                </div>
              )}
              
              <div className="text-sm text-gray-600 flex items-center">
                <ShoppingCart className="h-4 w-4 mr-1" />
                <span>{formData.available_quantity} pot{formData.available_quantity > 1 ? 's' : ''} disponible{formData.available_quantity > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center">
              <CreditBadge amount={formData.price_credits} size="lg" />
              
              <div className="ml-auto flex items-center space-x-2">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    min={1} 
                    max={formData.available_quantity}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                  />
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= formData.available_quantity}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button className="bg-jam-raspberry hover:bg-jam-raspberry/90">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ajouter au panier
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {fullPreview && (
          <div className="p-6 border-t">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ingredients">
                <AccordionTrigger>Ingrédients</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2">
                      {formData.ingredients.map((ing, i) => (
                        <li key={i} className="text-gray-700">
                          <span className="font-medium">{ing.name}</span>
                          {ing.quantity && <span className="text-gray-500 ml-1">({ing.quantity})</span>}
                        </li>
                      ))}
                    </ul>
                    
                    {formData.allergens?.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-3">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-sm font-medium text-amber-800">Contient des allergènes:</span>
                        </div>
                        <p className="text-sm text-amber-700 mt-1">
                          {formData.allergens.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {formData.recipe_steps && formData.recipe_steps.length > 0 && (
                <AccordionItem value="recipe">
                  <AccordionTrigger>Recette</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      {formData.recipe_steps.map((step, i) => (
                        <div key={i} className="flex">
                          <div className="flex-shrink-0 mr-4">
                            <div className="rounded-full w-8 h-8 bg-jam-raspberry flex items-center justify-center text-white font-bold">
                              {i + 1}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-700">{step.description}</p>
                            {step.duration && (
                              <p className="text-sm text-gray-500 mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {step.duration}
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
                          <dd className="text-sm font-medium">{formData.weight_grams}g</dd>
                        </div>
                        {formData.type && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Type</dt>
                            <dd className="text-sm font-medium">{categoryLabels[formData.type] || formData.type}</dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Pot spécial</dt>
                          <dd className="text-sm font-medium">{formData.special_edition ? 'Oui' : 'Non'}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Conservation</h4>
                      <dl className="mt-2 space-y-1">
                        {formData.production_date && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Mise en bocal</dt>
                            <dd className="text-sm font-medium">
                              {format(new Date(formData.production_date), 'PP', { locale: fr })}
                            </dd>
                          </div>
                        )}
                        {formData.shelf_life_months && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Durée de conservation</dt>
                            <dd className="text-sm font-medium">{formData.shelf_life_months} mois</dd>
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
        )}
      </div>
      
      {!formData.is_active && (
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
