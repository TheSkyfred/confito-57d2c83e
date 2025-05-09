
import React from 'react';
import { ShoppingBag, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HowItWorks: React.FC = () => {
  return (
    <Card className="bg-muted/40">
      <CardHeader>
        <CardTitle>Comment ça marche ?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="bg-jam-raspberry/10 p-2 rounded-full">
            <ShoppingBag className="h-5 w-5 text-jam-raspberry" />
          </div>
          <div>
            <p className="font-medium">Achetez des crédits</p>
            <p className="text-sm text-muted-foreground">
              Choisissez un pack adapté à vos besoins
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="bg-jam-raspberry/10 p-2 rounded-full">
            <ArrowRight className="h-5 w-5 text-jam-raspberry" />
          </div>
          <div>
            <p className="font-medium">Échangez des confitures</p>
            <p className="text-sm text-muted-foreground">
              Utilisez vos crédits pour commander des confitures
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="bg-jam-raspberry/10 p-2 rounded-full">
            <RefreshCw className="h-5 w-5 text-jam-raspberry" />
          </div>
          <div>
            <p className="font-medium">Gagnez des crédits</p>
            <p className="text-sm text-muted-foreground">
              Vendez vos confitures pour gagner des crédits
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-1" />
          <p className="text-sm text-muted-foreground">
            Les crédits achetés ne sont pas remboursables et sont uniquement utilisables sur Confito.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
