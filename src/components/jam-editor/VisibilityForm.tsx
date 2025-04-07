
import React from 'react';
import { 
  StandaloneFormLabel, 
  StandaloneFormDescription 
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
  Eye, 
  EyeOff, 
  Clock, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';

interface VisibilityFormProps {
  saving: boolean;
  handleSubmit: (publish?: boolean) => Promise<void>;
  isEditMode: boolean;
}

const VisibilityForm: React.FC<VisibilityFormProps> = ({ saving, handleSubmit, isEditMode }) => {
  return (
    <div className="space-y-6">
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
      
      <div className="flex flex-wrap gap-3 justify-end">
        <Button 
          variant="outline" 
          disabled={saving} 
          onClick={() => handleSubmit(false)}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer en brouillon
        </Button>
        <Button 
          variant="default" 
          disabled={saving} 
          onClick={() => handleSubmit(true)}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Mettre à jour' : 'Publier'}
        </Button>
      </div>
    </div>
  );
};

export default VisibilityForm;
