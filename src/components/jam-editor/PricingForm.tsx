
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Lightbulb } from 'lucide-react';

interface PricingFormProps {
  suggestedPrice: number | null;
}

const PricingForm = ({ suggestedPrice }: PricingFormProps) => {
  const { control, setValue, watch } = useFormContext();
  const currentPrice = watch('price_credits');

  const handleSliderChange = (values: number[]) => {
    setValue('price_credits', values[0]);
  };

  return (
    <div className="space-y-6">
      {suggestedPrice && (
        <div className="bg-muted rounded-md p-4 flex items-start space-x-3">
          <Lightbulb className="h-5 w-5 text-jam-honey mt-0.5" />
          <div>
            <h4 className="font-medium">Prix suggéré</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Notre algorithme suggère un prix de {suggestedPrice} crédits pour cette confiture, 
              basé sur le poids, les ingrédients et d'autres facteurs.
            </p>
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
              onClick={() => setValue('price_credits', suggestedPrice)}
            >
              Appliquer cette suggestion
            </button>
          </div>
        </div>
      )}

      <FormField
        control={control}
        name="price_credits"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prix en crédits *</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[field.value]}
                  onValueChange={handleSliderChange}
                  className="py-4"
                />
                <div className="flex items-center gap-4">
                  <Input 
                    type="number"
                    min={1}
                    className="w-24"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  <span className="text-lg font-medium">crédits</span>
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Définissez le prix en crédits pour votre confiture. 
              Le prix minimum est de 1 crédit.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-slate-500 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-medium text-slate-700">Conseils pour fixer votre prix</h4>
            <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
              <li>Tenez compte du coût de vos ingrédients et du temps de préparation</li>
              <li>Les confitures avec des ingrédients rares ou biologiques peuvent justifier un prix plus élevé</li>
              <li>Les confitures en édition limitée ou saisonnière peuvent avoir une valeur ajoutée</li>
              <li>Comparez avec d'autres confitures similaires sur la plateforme</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingForm;
