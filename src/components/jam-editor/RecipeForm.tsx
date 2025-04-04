
import React, { useState } from "react";
import { Trash2, Plus, ArrowUp, ArrowDown, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface RecipeStep {
  id: string;
  description: string;
  duration?: string;
  image_url?: string;
}

interface RecipeFormProps {
  formData: {
    recipe_steps: RecipeStep[];
    [key: string]: any;
  };
  updateFormData: (key: string, value: any) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ formData, updateFormData }) => {
  const [imageFiles, setImageFiles] = useState<{[key: string]: File | null}>({});

  // Create a new step with a unique ID
  const addNewStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      description: "",
      duration: "",
    };
    updateFormData("recipe_steps", [...formData.recipe_steps, newStep]);
  };

  // Remove a step by ID
  const removeStep = (id: string) => {
    updateFormData(
      "recipe_steps",
      formData.recipe_steps.filter((step: RecipeStep) => step.id !== id)
    );
  };

  // Update a step property
  const updateStep = (id: string, field: string, value: string) => {
    updateFormData(
      "recipe_steps",
      formData.recipe_steps.map((step: RecipeStep) =>
        step.id === id ? { ...step, [field]: value } : step
      )
    );
  };

  // Move a step up or down
  const moveStep = (id: string, direction: "up" | "down") => {
    const currentIndex = formData.recipe_steps.findIndex(
      (step: RecipeStep) => step.id === id
    );
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === formData.recipe_steps.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newSteps = [...formData.recipe_steps];
    const [movedStep] = newSteps.splice(currentIndex, 1);
    newSteps.splice(newIndex, 0, movedStep);

    updateFormData("recipe_steps", newSteps);
  };

  // Handle image upload for a step
  const handleImageChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Store the file in local state
      setImageFiles({
        ...imageFiles,
        [id]: file
      });
      
      // Create a URL for preview
      const imageUrl = URL.createObjectURL(file);
      updateStep(id, "image_url", imageUrl);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Décrivez les étapes de préparation de votre confiture pour aider
        d'autres membres à reproduire votre recette.
      </p>

      {formData.recipe_steps.length === 0 ? (
        <div className="text-center p-6 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            Aucune étape de recette ajoutée
          </p>
          <Button onClick={addNewStep} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" /> Ajouter une étape
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {formData.recipe_steps.map((step: RecipeStep, index: number) => (
            <Card key={step.id} className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Étape {index + 1}</h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStep(step.id, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span className="sr-only">Monter</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStep(step.id, "down")}
                    disabled={index === formData.recipe_steps.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                    <span className="sr-only">Descendre</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(step.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor={`step-desc-${step.id}`}>Description</Label>
                  <Textarea
                    id={`step-desc-${step.id}`}
                    value={step.description}
                    onChange={(e) =>
                      updateStep(step.id, "description", e.target.value)
                    }
                    placeholder="Décrivez cette étape..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`step-duration-${step.id}`}>
                      Durée (optionnel)
                    </Label>
                    <Input
                      id={`step-duration-${step.id}`}
                      value={step.duration || ""}
                      onChange={(e) =>
                        updateStep(step.id, "duration", e.target.value)
                      }
                      placeholder="Ex: 15 minutes"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`step-image-${step.id}`}>
                      Image (optionnel)
                    </Label>
                    <div className="mt-1">
                      <Input
                        id={`step-image-${step.id}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(step.id, e)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          document
                            .getElementById(`step-image-${step.id}`)
                            ?.click();
                        }}
                      >
                        <Image className="w-4 h-4 mr-2" />
                        {step.image_url ? "Changer l'image" : "Ajouter une image"}
                      </Button>
                    </div>
                  </div>
                </div>

                {step.image_url && (
                  <div className="mt-2">
                    <div className="relative rounded-md overflow-hidden aspect-video w-full max-w-md mx-auto">
                      <img
                        src={step.image_url}
                        alt={`Étape ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}

          <div className="text-center">
            <Button onClick={addNewStep} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Ajouter une étape
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeForm;
