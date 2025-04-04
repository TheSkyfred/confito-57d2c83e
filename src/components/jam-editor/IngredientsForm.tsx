
import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, AlertCircle } from 'lucide-react';

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

// Common allergens
const commonAllergens = [
  'Fruits à coque', 'Sulfites', 'Lait', 'Œuf', 'Soja', 'Gluten'
];

const IngredientsForm = () => {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });
  
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [focusedIngredientIndex, setFocusedIngredientIndex] = React.useState<number | null>(null);
  
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
    setValue(`ingredients.${index}.name`, suggestion);
    setSuggestions([]);
  };

  // Add a common allergen as checked ingredient
  const addAllergen = (allergen: string) => {
    append({ 
      name: allergen, 
      quantity: '', 
      is_allergen: true 
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Allergens importants</h4>
            <p className="text-sm text-amber-700 mt-1">
              Pour la sécurité de tous, assurez-vous d'identifier correctement tous les allergènes potentiels dans votre confiture.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {commonAllergens.map((allergen) => (
                <Badge 
                  key={allergen} 
                  variant="outline"
                  className="cursor-pointer border-amber-300 text-amber-800 hover:bg-amber-100"
                  onClick={() => addAllergen(allergen)}
                >
                  + {allergen}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Liste des ingrédients</h3>
          <Button 
            type="button" 
            size="sm"
            onClick={() => append({ name: '', quantity: '', is_allergen: false })}
          >
            <Plus className="h-4 w-4 mr-1" /> Ajouter un ingrédient
          </Button>
        </div>
        
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-start p-4 border rounded-md bg-card">
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <FormField
                    control={control}
                    name={`ingredients.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>Ingrédient</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Nom de l'ingrédient" 
                            onChange={(e) => {
                              field.onChange(e);
                              handleIngredientSearch(e.target.value, index);
                            }}
                            onFocus={() => handleIngredientSearch(field.value, index)}
                            onBlur={() => {
                              // Delay hiding suggestions to allow clicking on them
                              setTimeout(() => setSuggestions([]), 200);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
                
                <FormField
                  control={control}
                  name={`ingredients.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={index !== 0 ? "sr-only" : undefined}>Quantité</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 250g, 3 pièces" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex items-center space-x-2 mt-2 sm:mt-8">
                <FormField
                  control={control}
                  name={`ingredients.${index}.is_allergen`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm cursor-pointer">
                        Allergène
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => fields.length > 1 && remove(index)}
                disabled={fields.length <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {fields.length === 0 && (
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
