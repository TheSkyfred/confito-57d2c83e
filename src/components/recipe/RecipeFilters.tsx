import React, { useState } from 'react';
import { Search, Filter, Tag, AlertTriangle, Clock, ChefHat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from '@/components/ui/accordion';
import { RecipeFilters as RecipeFiltersType } from '@/types/recipes';

interface RecipeFiltersProps {
  onFilterChange: (filters: RecipeFiltersType) => void;
  filters?: RecipeFiltersType;
  setFilters?: React.Dispatch<React.SetStateAction<RecipeFiltersType>>;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({ onFilterChange, filters: externalFilters, setFilters: externalSetFilters }) => {
  const [internalFilters, setInternalFilters] = useState<RecipeFiltersType>({
    ingredients: [],
    allergens: false,
    minRating: 0,
    maxPrepTime: 120,
    difficulty: [],
    season: [],
    style: []
  });
  
  const filters = externalFilters || internalFilters;
  const setFilters = externalSetFilters || setInternalFilters;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  
  const commonIngredients = [
    'Fraises', 'Framboises', 'Abricots', 'Pêches',
    'Pommes', 'Poires', 'Cerises', 'Rhubarbe'
  ];
  
  const handleAddIngredient = (ingredient: string) => {
    if (ingredient.trim() && !filters.ingredients?.includes(ingredient.trim())) {
      const newIngredients = [...(filters.ingredients || []), ingredient.trim()];
      updateFilters('ingredients', newIngredients);
      setIngredientInput('');
    }
  };
  
  const handleRemoveIngredient = (ingredient: string) => {
    const newIngredients = filters.ingredients?.filter(i => i !== ingredient) || [];
    updateFilters('ingredients', newIngredients);
  };
  
  const updateFilters = (key: keyof RecipeFiltersType, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    if (externalSetFilters) {
      externalSetFilters(prevFilters => ({
        ...prevFilters,
        [key]: value
      }));
    } else {
      setInternalFilters(newFilters);
    }
    
    onFilterChange(newFilters);
  };
  
  const handleSearch = () => {
    updateFilters('search', searchTerm);
  };
  
  const clearFilters = () => {
    const resetFilters: RecipeFiltersType = {
      ingredients: [],
      allergens: false,
      minRating: 0,
      maxPrepTime: 120,
      difficulty: [],
      season: [],
      style: [],
      search: ''
    };
    
    if (externalSetFilters) {
      externalSetFilters(resetFilters);
    } else {
      setInternalFilters(resetFilters);
    }
    
    setSearchTerm('');
    onFilterChange(resetFilters);
  };
  
  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une recette..." 
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">Rechercher</Button>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger className="text-sm font-medium">
            <span className="flex items-center">
              <Filter className="h-4 w-4 mr-2" /> 
              Filtres avancés
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Ingrédients */}
              <div>
                <label className="text-sm font-medium flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Ingrédients
                </label>
                <div className="flex mt-2">
                  <Input
                    placeholder="Ajouter un ingrédient"
                    value={ingredientInput}
                    onChange={e => setIngredientInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddIngredient(ingredientInput)}
                    className="mr-2"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => handleAddIngredient(ingredientInput)}
                  >
                    Ajouter
                  </Button>
                </div>
                
                {/* Suggestions */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {commonIngredients.map(ingredient => (
                    <Badge 
                      key={ingredient} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => handleAddIngredient(ingredient)}
                    >
                      + {ingredient}
                    </Badge>
                  ))}
                </div>
                
                {/* Selected ingredients */}
                {filters.ingredients && filters.ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.ingredients.map(ingredient => (
                      <Badge key={ingredient} variant="secondary" className="gap-1">
                        {ingredient}
                        <button 
                          className="ml-1 rounded-full w-4 h-4 flex items-center justify-center hover:bg-secondary-foreground hover:text-secondary"
                          onClick={() => handleRemoveIngredient(ingredient)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Allergènes */}
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="allergens" 
                  checked={filters.allergens}
                  onCheckedChange={(checked) => updateFilters('allergens', checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label 
                    htmlFor="allergens" 
                    className="text-sm font-medium leading-none flex items-center cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Exclure les recettes contenant des allergènes
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Ne pas afficher les recettes qui contiennent des ingrédients marqués comme allergènes.
                  </p>
                </div>
              </div>
              
              {/* Temps de préparation */}
              <div>
                <label className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Temps de préparation maximum: {filters.maxPrepTime} min
                </label>
                <Slider
                  className="mt-2"
                  value={[filters.maxPrepTime || 120]}
                  min={10}
                  max={180}
                  step={5}
                  onValueChange={(value) => updateFilters('maxPrepTime', value[0])}
                />
              </div>
              
              {/* Difficulté */}
              <div>
                <label className="text-sm font-medium flex items-center">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Difficulté
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['facile', 'moyen', 'avancé'].map(level => {
                    const isSelected = filters.difficulty?.includes(level as any);
                    return (
                      <Badge
                        key={level}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const currentDifficulties = filters.difficulty || [];
                          const updatedDifficulties = isSelected
                            ? currentDifficulties.filter(d => d !== level)
                            : [...currentDifficulties, level];
                          updateFilters('difficulty', updatedDifficulties);
                        }}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              
              {/* Style */}
              <div>
                <label className="text-sm font-medium">Style</label>
                <Select
                  onValueChange={(value) => {
                    const currentStyles = filters.style || [];
                    const updatedStyles = currentStyles.includes(value as any)
                      ? currentStyles.filter(s => s !== value)
                      : [...currentStyles, value];
                    updateFilters('style', updatedStyles);
                  }}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Sélectionner un style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="fruitée">Fruitée</SelectItem>
                      <SelectItem value="épicée">Épicée</SelectItem>
                      <SelectItem value="sans_sucre">Sans sucre</SelectItem>
                      <SelectItem value="traditionnelle">Traditionnelle</SelectItem>
                      <SelectItem value="exotique">Exotique</SelectItem>
                      <SelectItem value="bio">Bio</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                {/* Selected styles */}
                {filters.style && filters.style.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.style.map(style => (
                      <Badge key={style} variant="secondary" className="gap-1">
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                        <button 
                          className="ml-1 rounded-full w-4 h-4 flex items-center justify-center hover:bg-secondary-foreground hover:text-secondary"
                          onClick={() => {
                            const updatedStyles = filters.style?.filter(s => s !== style) || [];
                            updateFilters('style', updatedStyles);
                          }}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Clear filters button */}
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Réinitialiser les filtres
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default RecipeFilters;
