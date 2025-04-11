
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AdviceFilters, AdviceType } from '@/types/advice';

interface AdviceFilterCardProps {
  filters: AdviceFilters;
  setFilters: React.Dispatch<React.SetStateAction<AdviceFilters>>;
  onFilterChange: (filters: AdviceFilters) => void;
  onClose: () => void;
}

const AdviceFilterCard: React.FC<AdviceFilterCardProps> = ({ 
  filters, 
  setFilters, 
  onFilterChange,
  onClose
}) => {
  const typeOptions: {label: string, value: AdviceType}[] = [
    { label: 'Choix des fruits', value: 'fruits' },
    { label: 'Cuisson', value: 'cuisson' },
    { label: 'Recette', value: 'recette' },
    { label: 'Conditionnement', value: 'conditionnement' },
    { label: 'Stérilisation', value: 'sterilisation' },
    { label: 'Matériel', value: 'materiel' }
  ];

  const handleTypeChange = (type: AdviceType) => {
    setFilters(prev => {
      const currentTypes = prev.type || [];
      const updatedTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
      
      return {
        ...prev,
        type: updatedTypes
      };
    });
  };

  const resetFilters = () => {
    const resetValues: AdviceFilters = {
      type: [],
      hasVideo: false,
      hasProducts: false,
      sortBy: 'date'
    };
    
    setFilters(resetValues);
    onFilterChange(resetValues);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filtres</CardTitle>
        <CardDescription>
          Affinez votre recherche de conseils
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Type de conseil</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {typeOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={option.value}
                  checked={(filters.type || []).includes(option.value)}
                  onCheckedChange={() => handleTypeChange(option.value)}
                />
                <label 
                  htmlFor={option.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Contenu</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasVideo"
                checked={filters.hasVideo || false}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, hasVideo: !!checked }))
                }
              />
              <label 
                htmlFor="hasVideo"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Avec vidéo uniquement
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasProducts"
                checked={filters.hasProducts || false}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, hasProducts: !!checked }))
                }
              />
              <label 
                htmlFor="hasProducts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Avec produits recommandés
              </label>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="sortBy">Trier par</Label>
            <Select
              value={filters.sortBy || 'date'}
              onValueChange={(value: 'date' | 'popularity' | 'clicks') => 
                setFilters(prev => ({ ...prev, sortBy: value }))
              }
            >
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date de publication</SelectItem>
                <SelectItem value="popularity">Popularité</SelectItem>
                <SelectItem value="clicks">Nombre de clics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetFilters}
        >
          Réinitialiser
        </Button>
        <Button onClick={onClose}>
          Appliquer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdviceFilterCard;
