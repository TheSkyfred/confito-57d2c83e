
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { addMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

const ManufacturingForm = () => {
  const { control, watch, setValue } = useFormContext();
  
  // Calculate expiration date based on packaging date and preservation months
  const packagingDate = watch('packaging_date');
  const preservationMonths = watch('preservation_months') || 12;
  
  const expirationDate = React.useMemo(() => {
    if (packagingDate) {
      return addMonths(new Date(packagingDate), preservationMonths);
    }
    return addMonths(new Date(), preservationMonths);
  }, [packagingDate, preservationMonths]);

  return (
    <div className="space-y-6">
      {/* Packaging Date */}
      <FormField
        control={control}
        name="packaging_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date de mise en bocal</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "d MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Choisir une date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
            <FormDescription>
              Date à laquelle vous avez préparé cette confiture.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Weight */}
      <FormField
        control={control}
        name="weight_grams"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Poids moyen par pot (en grammes) *</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={1}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Le poids net moyen de confiture par pot, en grammes.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Available Quantity */}
      <FormField
        control={control}
        name="available_quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de pots disponibles *</FormLabel>
            <FormControl>
              <Input 
                type="number"
                min={0}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Combien de pots avez-vous actuellement en stock ?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Preservation Duration */}
      <FormField
        control={control}
        name="preservation_months"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Durée de conservation (en mois)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                min={1}
                max={36}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Durée de conservation recommandée en mois.
              <br />
              Date limite de consommation calculée : <strong>{format(expirationDate, "d MMMM yyyy", { locale: fr })}</strong>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Special Jar */}
      <FormField
        control={control}
        name="special_jar"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Bocal spécial ou édition limitée
              </FormLabel>
              <FormDescription>
                Cochez cette case si vous utilisez un contenant spécial ou si c'est une édition limitée.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ManufacturingForm;
