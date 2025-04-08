
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { RecipeType } from '@/types/recipes';

interface RecipePDFGeneratorProps {
  recipe: RecipeType;
  multiplier?: number;
}

const RecipePDFGenerator: React.FC<RecipePDFGeneratorProps> = ({ recipe, multiplier = 1 }) => {
  const generatePDF = () => {
    // This is a placeholder function that would generate a PDF
    // In a real implementation, you could use libraries like jsPDF or pdfmake
    // Or send data to a server-side PDF generation service
    
    const recipeData = {
      ...recipe,
      ingredients: recipe.ingredients?.map(ingredient => ({
        ...ingredient,
        base_quantity: ingredient.base_quantity * multiplier
      }))
    };
    
    // For now, let's just open a new window with the recipe data as text
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Recette: ${recipe.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
              h1 { color: #333; }
              .ingredients { margin: 20px 0; }
              .ingredient { margin: 5px 0; }
              .step { margin: 10px 0; }
              .meta { color: #666; margin-bottom: 20px; }
              @media print {
                body { margin: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>${recipe.title}</h1>
            <div class="meta">
              <p>Temps de préparation: ${recipe.prep_time_minutes} minutes</p>
              <p>Difficulté: ${recipe.difficulty}</p>
              <p>Saison: ${recipe.season}</p>
              <p>Style: ${recipe.style}</p>
            </div>
            
            <h2>Ingrédients</h2>
            <div class="ingredients">
              ${recipe.ingredients?.map(i => 
                `<div class="ingredient">${i.name}: ${(i.base_quantity * multiplier).toFixed(1)} ${i.unit}${i.is_allergen ? ' (allergène)' : ''}</div>`
              ).join('') || 'Aucun ingrédient'}
            </div>
            
            <h2>Instructions</h2>
            ${recipe.instructions?.map((instruction, index) => 
              `<div class="step"><strong>${index + 1}.</strong> ${instruction.description}</div>`
            ).join('') || 'Aucune instruction'}
            
            <div style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 0.8em;">
              <p>Recette générée depuis Confito - ${new Date().toLocaleDateString()}</p>
            </div>
            
            <button onclick="window.print()">Imprimer cette recette</button>
          </body>
        </html>
      `);
    }
  };
  
  return (
    <Button onClick={generatePDF} variant="outline" className="flex items-center space-x-2">
      <Download className="h-4 w-4" />
      <span>Télécharger en PDF</span>
    </Button>
  );
};

export default RecipePDFGenerator;
