
import React, { useState, useEffect } from 'react';
import { 
  StandaloneFormLabel as FormLabel, 
  StandaloneFormDescription as FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, AlertCircle, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabaseDirect } from '@/utils/supabaseAdapter';
import { AllergenType } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

// Common ingredients for autocomplete
const commonIngredients = [
  'Fraise', 'Framboise', 'Abricot', 'Pêche', 'Pomme', 
  'Poire', 'Rhubarbe', 'Myrtille', 'Cassis', 'Cerise',
  'Orange', 'Citron', 'Mandarine', 'Figue', 'Prune',
  'Mangue', 'Ananas', 'Banane', 'Kiwi', 'Melon',
  'Carotte', 'Poivron', 'Tomate', 'Potimarron', 'Oignon',
  'Sucre', 'Pectine', 'Agar-agar', 'Miel', 'Sirop d\'érable',
  'Vanille', 'Cannelle', 'Gingembre', 'Cardamome', 'Anis étoilé'
];

interface Ingredient {
  name: string;
  quantity: string;
  is_allergen?: boolean;
}

interface IngredientsFormProps {
  formData: {
    ingredients: Ingredient[];
    allergens: string[];
    [key: string]: any;
  };
  updateFormData: (key: string, value: any) => void;
}

const IngredientsForm: React.FC<IngredientsFormProps> = ({ formData, updateFormData }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focusedIngredientIndex, setFocusedIngredientIndex] = useState<number | null>(null);
  const [detectedAllergens, setDetectedAllergens] = useState<string[]>([]);
  
  // Fetch all allergens from database
  const { data: allergens, isLoading: loadingAllergens } = useQuery({
    queryKey: ['allergens'],
    queryFn: async () => {
      const { data, error } = await supabaseDirect.select(
        'allergens',
        '*'
      );
      
      if (error) {
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les allergènes",
          variant: "destructive",
        });
        throw error;
      }
      return data as AllergenType[];
    },
  });
  
  // Add a new ingredient
  const addIngredient = () => {
    const updatedIngredients = [...formData.ingredients, { name: '', quantity: '', is_allergen: false }];
    updateFormData('ingredients', updatedIngredients);
  };
  
  // Remove an ingredient by index
  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const updatedIngredients = [...formData.ingredients];
      updatedIngredients.splice(index, 1);
      updateFormData('ingredients', updatedIngredients);
    }
  };
  
  // Update ingredient data
  const updateIngredient = (index: number, field: 'name' | 'quantity' | 'is_allergen', value: any) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    updateFormData('ingredients', updatedIngredients);
  };
  
  // Filtered suggestions based on input
  const handleIngredientSearch = (value: string, index: number) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    
    const filtered = commonIngredients.filter(ing => 
      ing.toLowerCase().includes(value.toLowerCase())
    );
    
    setSuggestions(filtered);
    setFocusedIngredientIndex(index);
  };
  
  // Select suggestion and clear suggestions
  const selectSuggestion = (suggestion: string, index: number) => {
    updateIngredient(index, 'name', suggestion);
    setSuggestions([]);
  };

  // Add a common allergen as checked ingredient
  const addAllergen = (allergenName: string) => {
    // Check if allergen is already in the ingredients list
    const exists = formData.ingredients.some(ing => 
      ing.name.toLowerCase() === allergenName.toLowerCase()
    );

    if (!exists) {
      updateFormData('ingredients', [
        ...formData.ingredients, 
        { name: allergenName, quantity: '', is_allergen: true }
      ]);
    }
  };
  
  // Check for allergens in ingredients and update detected allergens
  useEffect(() => {
    if (!allergens || allergens.length === 0) return;
    
    const detected: string[] = [];
    
    formData.ingredients.forEach(ingredient => {
      if (!ingredient.name) return;
      
      // Check if ingredient name matches any known allergen
      const matchingAllergen = allergens.find(allergen => 
        ingredient.name.toLowerCase().includes(allergen.name.toLowerCase()) ||
        allergen.name.toLowerCase().includes(ingredient.name.toLowerCase())
      );
      
      if (matchingAllergen && !detected.includes(matchingAllergen.name)) {
        detected.push(matchingAllergen.name);
      }
    });
    
    setDetectedAllergens(detected);
    updateFormData('allergens', detected);
  }, [formData.ingredients, allergens]);
  
  // Common allergens badges to display
  const commonAllergensToShow = allergens?.filter(a => a.severity >= 4)
    .slice(0, 10)
    .sort(() => 0.5 - Math.random()) || [];
  
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Allergènes importants</h4>
            <p className="text-sm text-amber-700 mt-1">
              Pour la sécurité de tous, assurez-vous d'identifier correctement tous les allergènes potentiels dans votre confiture.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {loadingAllergens ? (
                <p className="text-sm text-amber-700">Chargement des allergènes...</p>
              ) : commonAllergensToShow.map((allergen) => (
                <Badge 
                  key={allergen.id} 
                  variant="outline"
                  className="cursor-pointer border-amber-300 text-amber-800 hover:bg-amber-100"
                  onClick={() => addAllergen(allergen.name)}
                >
                  + {allergen.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {detectedAllergens.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Allergènes détectés</h4>
              <p className="text-sm text-red-700 mt-1">
                Les allergènes suivants ont été détectés dans votre liste d'ingrédients :
              </p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {detectedAllergens.map((allergen) => (
                  <Badge 
                    key={allergen} 
                    variant="outline"
                    className="border-red-300 bg-red-100 text-red-800"
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Liste des ingrédients</h3>
          <Button 
            type="button" 
            size="sm"
            onClick={addIngredient}
          >
            <Plus className="h-4 w-4 mr-1" /> Ajouter un ingrédient
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 items-start p-4 border rounded-md bg-card">
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <FormLabel className={index !== 0 ? "sr-only" : undefined}>Ingrédient</FormLabel>
                  <Input 
                    value={ingredient.name}
                    placeholder="Nom de l'ingrédient" 
                    onChange={(e) => {
                      updateIngredient(index, 'name', e.target.value);
                      handleIngredientSearch(e.target.value, index);
                    }}
                    onFocus={() => handleIngredientSearch(ingredient.name, index)}
                    onBlur={() => {
                      setTimeout(() => setSuggestions([]), 200);
                    }}
                    className={ingredient.is_allergen ? "border-red-300" : ""}
                  />
                  
                  {suggestions.length > 0 && focusedIngredientIndex === index && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion}
                          className="px-4 py-2 hover:bg-muted cursor-pointer"
                          onClick={() => selectSuggestion(suggestion, index)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <FormLabel className={index !== 0 ? "sr-only" : undefined}>Quantité</FormLabel>
                  <Input 
                    value={ingredient.quantity} 
                    placeholder="Ex: 250g, 3 pièces"
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-2 sm:mt-8">
                <div className="flex items-center space-x-2 space-y-0">
                  <Checkbox
                    checked={ingredient.is_allergen || false}
                    onCheckedChange={(checked) => 
                      updateIngredient(index, 'is_allergen', !!checked)
                    }
                    id={`allergen-${index}`}
                  />
                  <Label htmlFor={`allergen-${index}`} className="text-sm cursor-pointer">
                    Allergène
                  </Label>
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeIngredient(index)}
                disabled={formData.ingredients.length <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {formData.ingredients.length === 0 && (
          <div className="text-center py-8 border rounded-md bg-muted/40">
            <p className="text-muted-foreground">
              Aucun ingrédient ajouté. Cliquez sur "Ajouter un ingrédient" pour commencer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientsForm;
