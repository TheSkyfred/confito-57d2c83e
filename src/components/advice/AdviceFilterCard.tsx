
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdviceType, AdviceFilters } from "@/types/advice";
import { Filter, X } from 'lucide-react';

interface AdviceFilterCardProps {
  filters: AdviceFilters;
  setFilters: React.Dispatch<React.SetStateAction<AdviceFilters>>;
  onFilterChange: (newFilters: Partial<AdviceFilters>) => void;
  onClose: () => void;
}

const AdviceFilterCard: React.FC<AdviceFilterCardProps> = ({
  filters,
  setFilters,
  onFilterChange,
  onClose
}) => {
  const handleTypeChange = (type: AdviceType) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setFilters(prev => ({ ...prev, type: newTypes }));
    onFilterChange({ type: newTypes });
  };
  
  const handleVideoFilterChange = (checked: boolean) => {
    setFilters(prev => ({ ...prev, hasVideo: checked }));
    onFilterChange({ hasVideo: checked });
  };
  
  const handleProductFilterChange = (checked: boolean) => {
    setFilters(prev => ({ ...prev, hasProducts: checked }));
    onFilterChange({ hasProducts: checked });
  };
  
  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value as 'date' | 'popularity' | 'clicks' }));
    onFilterChange({ sortBy: value as 'date' | 'popularity' | 'clicks' });
  };
  
  const resetFilters = () => {
    setFilters({});
    onFilterChange({
      type: undefined,
      hasVideo: undefined,
      hasProducts: undefined,
      sortBy: undefined,
      searchTerm: undefined
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtrer les conseils
            </CardTitle>
            <CardDescription>
              Affinez votre recherche selon vos critères
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Type de conseil</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="fruits-filter"
                checked={(filters.type || []).includes('fruits')}
                onCheckedChange={() => handleTypeChange('fruits')}
              />
              <label htmlFor="fruits-filter" className="text-sm">Fruits</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cuisson-filter"
                checked={(filters.type || []).includes('cuisson')}
                onCheckedChange={() => handleTypeChange('cuisson')}
              />
              <label htmlFor="cuisson-filter" className="text-sm">Cuisson</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="recette-filter"
                checked={(filters.type || []).includes('recette')}
                onCheckedChange={() => handleTypeChange('recette')}
              />
              <label htmlFor="recette-filter" className="text-sm">Recette</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="conditionnement-filter"
                checked={(filters.type || []).includes('conditionnement')}
                onCheckedChange={() => handleTypeChange('conditionnement')}
              />
              <label htmlFor="conditionnement-filter" className="text-sm">Conditionnement</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sterilisation-filter"
                checked={(filters.type || []).includes('sterilisation')}
                onCheckedChange={() => handleTypeChange('sterilisation')}
              />
              <label htmlFor="sterilisation-filter" className="text-sm">Stérilisation</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="materiel-filter"
                checked={(filters.type || []).includes('materiel')}
                onCheckedChange={() => handleTypeChange('materiel')}
              />
              <label htmlFor="materiel-filter" className="text-sm">Matériel</label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Fonctionnalités</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="video-filter"
                checked={!!filters.hasVideo}
                onCheckedChange={(checked) => handleVideoFilterChange(!!checked)}
              />
              <label htmlFor="video-filter" className="text-sm">Avec vidéo</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="products-filter"
                checked={!!filters.hasProducts}
                onCheckedChange={(checked) => handleProductFilterChange(!!checked)}
              />
              <label htmlFor="products-filter" className="text-sm">Avec produits recommandés</label>
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="sort">Trier par</Label>
          <Select
            value={filters.sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger id="sort" className="w-full mt-1">
              <SelectValue placeholder="Choisir un tri" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Plus récents</SelectItem>
              <SelectItem value="popularity">Plus populaires</SelectItem>
              <SelectItem value="clicks">Plus consultés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="outline" 
          onClick={resetFilters}
          className="w-full md:w-auto"
        >
          Réinitialiser les filtres
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdviceFilterCard;
