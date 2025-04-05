
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from 'lucide-react';

type FilterSheetProps = {
  fruitOptions: string[];
  allergenOptions: string[];
  filters: {
    fruit?: string[];
    allergens?: string[];
    maxSugar?: number;
    minRating?: number;
    maxPrice?: number;
  };
  activeFilterCount: number;
  toggleFruitFilter: (fruit: string) => void;
  toggleAllergenFilter: (allergen: string) => void;
  updateMaxSugar: (value: number[]) => void;
  updateMinRating: (value: number[]) => void;
  updateMaxPrice: (value: number[]) => void;
  resetFilters: () => void;
};

const FilterSheet: React.FC<FilterSheetProps> = ({
  fruitOptions,
  allergenOptions,
  filters,
  activeFilterCount,
  toggleFruitFilter,
  toggleAllergenFilter,
  updateMaxSugar,
  updateMinRating,
  updateMaxPrice,
  resetFilters,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-jam-raspberry text-white text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtres</SheetTitle>
          <SheetDescription>
            Affinez votre recherche avec nos filtres
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="fruit">
              <AccordionTrigger>Fruits</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2">
                  {fruitOptions.map(fruit => (
                    <div key={fruit} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`fruit-${fruit}`} 
                        checked={filters.fruit?.includes(fruit)}
                        onCheckedChange={() => toggleFruitFilter(fruit)}
                      />
                      <label htmlFor={`fruit-${fruit}`} className="text-sm cursor-pointer">
                        {fruit}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="allergens">
              <AccordionTrigger>Allergènes (exclure)</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2">
                  {allergenOptions.map(allergen => (
                    <div key={allergen} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`allergen-${allergen}`} 
                        checked={filters.allergens?.includes(allergen)}
                        onCheckedChange={() => toggleAllergenFilter(allergen)}
                      />
                      <label htmlFor={`allergen-${allergen}`} className="text-sm cursor-pointer">
                        {allergen}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sugar">
              <AccordionTrigger>Teneur en sucre max</AccordionTrigger>
              <AccordionContent>
                <div className="px-1">
                  <Slider
                    defaultValue={[100]}
                    max={100}
                    step={5}
                    value={[filters.maxSugar || 100]}
                    onValueChange={updateMaxSugar}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">{filters.maxSugar}% max</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rating">
              <AccordionTrigger>Note minimale</AccordionTrigger>
              <AccordionContent>
                <div className="px-1">
                  <Slider
                    defaultValue={[0]}
                    max={5}
                    step={0.5}
                    value={[filters.minRating || 0]}
                    onValueChange={updateMinRating}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">Min: {filters.minRating} étoiles</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price">
              <AccordionTrigger>Prix maximum</AccordionTrigger>
              <AccordionContent>
                <div className="px-1">
                  <Slider
                    defaultValue={[50]}
                    max={50}
                    step={1}
                    value={[filters.maxPrice || 50]}
                    onValueChange={updateMaxPrice}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">Max: {filters.maxPrice} crédits</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="secondary" onClick={resetFilters}>Réinitialiser les filtres</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button className="bg-jam-raspberry hover:bg-jam-raspberry/90">
              Appliquer les filtres
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
