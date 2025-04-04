
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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  EyeOff, 
  Clock, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';

const VisibilityForm = () => {
  const { control, watch } = useFormContext();
  
  const isDraft = watch('is_draft');
  const isActive = watch('is_active');
  
  return (
    <div className="space-y-6">
      {/* Publication Status */}
      <FormField
        control={control}
        name="is_draft"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Statut de publication</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === 'draft')}
                defaultValue={field.value ? 'draft' : 'published'}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft" className="flex items-center cursor-pointer">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    Brouillon
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="published" id="published" />
                  <Label htmlFor="published" className="flex items-center cursor-pointer">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    Publié
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormDescription>
              {field.value ? (
                "Votre confiture sera enregistrée en tant que brouillon. Seul vous pourrez la voir."
              ) : (
                "Votre confiture sera visible par tous les utilisateurs de la plateforme."
              )}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Visibility toggle for published jams */}
      {!isDraft && (
        <FormField
          control={control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  {field.value ? (
                    <>
                      <Eye className="mr-2 h-4 w-4 text-green-500" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4 text-muted-foreground" />
                      Masquée temporairement
                    </>
                  )}
                </FormLabel>
                <FormDescription>
                  {field.value ? (
                    "Votre confiture est visible dans les recherches et peut être achetée."
                  ) : (
                    "Votre confiture est temporairement masquée et n'apparaît pas dans les recherches."
                  )}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      <div className="bg-muted rounded-md p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h4 className="font-medium">À noter</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Seules les confitures complètement renseignées seront visibles par les autres utilisateurs.
              Assurez-vous d'avoir ajouté toutes les informations nécessaires avant de publier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisibilityForm;
