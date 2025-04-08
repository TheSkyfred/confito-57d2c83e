
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { RecipeIngredient } from '@/types/recipes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface IngredientCalculatorProps {
  ingredients: RecipeIngredient[];
  baseQuantity?: number; // Base quantity (like total weight)
}

const IngredientCalculator: React.FC<IngredientCalculatorProps> = ({ ingredients, baseQuantity = 1 }) => {
  const [multiplier, setMultiplier] = useState(1);
  const [calculatedIngredients, setCalculatedIngredients] = useState<RecipeIngredient[]>(ingredients);
  
  useEffect(() => {
    const newCalculatedIngredients = ingredients.map(ingredient => ({
      ...ingredient,
      base_quantity: ingredient.base_quantity * multiplier
    }));
    
    setCalculatedIngredients(newCalculatedIngredients);
  }, [ingredients, multiplier]);
  
  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setMultiplier(value);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div>
          <label htmlFor="multiplier" className="block text-sm font-medium text-gray-700 mb-1">
            Quantité désirée
          </label>
          <div className="flex items-center">
            <Input
              id="multiplier"
              type="number"
              min="0.1"
              step="0.1"
              value={multiplier}
              onChange={handleMultiplierChange}
              className="w-24"
            />
            <span className="ml-2 text-sm text-gray-500">× recette originale</span>
          </div>
        </div>
        
        {baseQuantity && (
          <div className="text-sm text-gray-700">
            <span className="block font-medium mb-1">Production estimée</span>
            <span>{(baseQuantity * multiplier).toFixed(2)} grammes</span>
          </div>
        )}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Ingrédient</TableHead>
            <TableHead>Recette originale</TableHead>
            <TableHead>Quantité ajustée</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <TableRow key={ingredient.id} className={ingredient.is_allergen ? "bg-red-50" : ""}>
              <TableCell className="font-medium">
                {ingredient.name}
                {ingredient.is_allergen && (
                  <span className="ml-1 text-xs text-red-500">(allergène)</span>
                )}
              </TableCell>
              <TableCell>{ingredient.base_quantity} {ingredient.unit}</TableCell>
              <TableCell>
                {(ingredient.base_quantity * multiplier).toFixed(1)} {ingredient.unit}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default IngredientCalculator;
