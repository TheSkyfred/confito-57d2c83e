
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Grip, Plus, Trash2, MoveUp, MoveDown, Clock, Upload } from 'lucide-react';

const RecipeForm = () => {
  const { control } = useFormContext();
  const { fields, append, remove, swap, update } = useFieldArray({
    control,
    name: 'recipe_steps',
  });

  // Handle image selection for a step
  const handleStepImageChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      update(index, {
        ...fields[index],
        image_url: imageUrl
      });
    }
  };

  // Move step up in the list
  const moveStepUp = (index: number) => {
    if (index > 0) {
      swap(index, index - 1);
    }
  };

  // Move step down in the list
  const moveStepDown = (index: number) => {
    if (index < fields.length - 1) {
      swap(index, index + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Étapes de la recette</h3>
        <Button 
          type="button" 
          size="sm" 
          onClick={() => append({ description: '', duration_minutes: 0, image_url: '' })}
        >
          <Plus className="h-4 w-4 mr-1" /> Ajouter une étape
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div 
            key={field.id} 
            className="p-4 border rounded-md bg-card relative"
          >
            <div className="absolute top-2 right-2 text-sm font-medium text-muted-foreground">
              Étape {index + 1}
            </div>
            
            <div className="space-y-4">
              {/* Step description */}
              <FormField
                control={control}
                name={`recipe_steps.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description de l'étape</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Décrivez cette étape de préparation..." 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step duration */}
                <FormField
                  control={control}
                  name={`recipe_steps.${index}.duration_minutes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (minutes)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Step image */}
                <FormItem>
                  <FormLabel>Image de l'étape (optionnelle)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      {field.image_url ? (
                        <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                          <img 
                            src={field.image_url} 
                            alt={`Étape ${index + 1}`}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Aucune</span>
                        </div>
                      )}
                      
                      <label htmlFor={`step-image-${index}`} className="cursor-pointer">
                        <div className="bg-muted hover:bg-muted/80 flex items-center gap-2 px-3 py-1.5 rounded-md text-sm">
                          <Upload className="h-3 w-3" />
                          <span>Image</span>
                        </div>
                        <input
                          id={`step-image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleStepImageChange(e, index)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveStepUp(index)}
                disabled={index === 0}
              >
                <MoveUp className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveStepDown(index)}
                disabled={index === fields.length - 1}
              >
                <MoveDown className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 border rounded-md bg-muted/40">
          <p className="text-muted-foreground">
            Aucune étape ajoutée. Cliquez sur "Ajouter une étape" pour commencer à documenter votre recette.
          </p>
        </div>
      )}

      <FormDescription className="text-sm text-muted-foreground italic">
        La section recette est optionnelle, mais elle peut aider d'autres utilisateurs à reproduire votre confiture ou simplement à comprendre comment vous l'avez préparée.
      </FormDescription>
    </div>
  );
};

export default RecipeForm;
