
import React from 'react';
import { addMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  StandaloneFormLabel as FormLabel, 
  StandaloneFormDescription as FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface ManufacturingFormProps {
  formData: {
    production_date?: string;
    weight_grams: number;
    available_quantity: number;
    shelf_life_months?: number;
    special_edition?: boolean;
    [key: string]: any;
  };
  updateFormData: (key: string, value: any) => void;
}

const ManufacturingForm: React.FC<ManufacturingFormProps> = ({ formData, updateFormData }) => {
  // Calculate expiration date based on packaging date and preservation months
  const packagingDate = formData.production_date;
  const preservationMonths = formData.shelf_life_months || 12;
  
  const expirationDate = React.useMemo(() => {
    if (packagingDate) {
      return addMonths(new Date(packagingDate), preservationMonths);
    }
    return addMonths(new Date(), preservationMonths);
  }, [packagingDate, preservationMonths]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      updateFormData('production_date', date.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Packaging Date */}
      <div>
        <FormLabel>Date de mise en bocal</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !formData.production_date && "text-muted-foreground"
              )}
            >
              {formData.production_date ? (
                format(new Date(formData.production_date), "d MMMM yyyy", { locale: fr })
              ) : (
                <span>Choisir une date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.production_date ? new Date(formData.production_date) : undefined}
              onSelect={handleDateChange}
              disabled={(date) => date > new Date()}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
        <FormDescription>
          Date à laquelle vous avez préparé cette confiture.
        </FormDescription>
      </div>

      {/* Weight */}
      <div>
        <FormLabel>Poids moyen par pot (en grammes) *</FormLabel>
        <Input 
          type="number" 
          min={1}
          value={formData.weight_grams}
          onChange={(e) => updateFormData('weight_grams', Number(e.target.value))}
        />
        <FormDescription>
          Le poids net moyen de confiture par pot, en grammes.
        </FormDescription>
      </div>

      {/* Available Quantity */}
      <div>
        <FormLabel>Nombre de pots disponibles *</FormLabel>
        <Input 
          type="number"
          min={0}
          value={formData.available_quantity}
          onChange={(e) => updateFormData('available_quantity', Number(e.target.value))}
        />
        <FormDescription>
          Combien de pots avez-vous actuellement en stock ?
        </FormDescription>
      </div>

      {/* Preservation Duration */}
      <div>
        <FormLabel>Durée de conservation (en mois)</FormLabel>
        <Input 
          type="number"
          min={1}
          max={36}
          value={formData.shelf_life_months || 12}
          onChange={(e) => updateFormData('shelf_life_months', Number(e.target.value))}
        />
        <FormDescription>
          Durée de conservation recommandée en mois.
          <br />
          Date limite de consommation calculée : <strong>{format(expirationDate, "d MMMM yyyy", { locale: fr })}</strong>
        </FormDescription>
      </div>

      {/* Special Jar */}
      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox
          checked={formData.special_edition || false}
          onCheckedChange={(checked) => updateFormData('special_edition', checked)}
          id="special-jar"
        />
        <div className="space-y-1 leading-none">
          <Label htmlFor="special-jar">
            Bocal spécial ou édition limitée
          </Label>
          <FormDescription>
            Cochez cette case si vous utilisez un contenant spécial ou si c'est une édition limitée.
          </FormDescription>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingForm;
