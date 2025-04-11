
import React, { useState } from 'react';
import { useProAccessories } from '@/hooks/useProAccessories';
import { useAdviceAccessories } from '@/hooks/useAdviceAccessories';
import { useAuth } from '@/contexts/AuthContext';
import { ProAccessory } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search, Plus, Trash2, ExternalLink, Link2, Link2Off, Tag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AccessoriesSelectorProps {
  adviceId: string;
}

const AccessoriesSelector: React.FC<AccessoriesSelectorProps> = ({ adviceId }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { accessories, setFilter, isLoading: loadingAccessories } = useProAccessories();
  const { linkedAccessories, linkAccessory, unlinkAccessory, isLoading: loadingLinked } = useAdviceAccessories(adviceId);

  // Afficher les données pour le débogage
  console.log("Accessories data:", accessories);
  console.log("Loading state:", loadingAccessories);
  console.log("Error:", error);

  // Filtrer les accessoires qui ne sont pas déjà liés au conseil
  const filteredAccessories = accessories?.filter(accessory => {
    const isAlreadyLinked = linkedAccessories?.some(
      link => link.accessory_id === accessory.id
    );
    return !isAlreadyLinked;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFilter(e.target.value);
  };

  const handleLinkAccessory = (accessoryId: string) => {
    linkAccessory.mutate({
      adviceId,
      accessoryId,
      userId: user?.id
    });
  };

  const handleUnlinkAccessory = (linkId: string) => {
    unlinkAccessory.mutate(linkId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Accessoires associés</h3>
        {loadingLinked ? (
          <p className="text-muted-foreground">Chargement des accessoires associés...</p>
        ) : linkedAccessories?.length === 0 ? (
          <p className="text-muted-foreground">Aucun accessoire n'est associé à ce conseil</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedAccessories?.map((link) => (
              <Card key={link.id} className="relative">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {link.accessory?.image_url ? (
                      <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                        <img 
                          src={link.accessory.image_url} 
                          alt={link.accessory.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <Tag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="font-medium">{link.accessory?.name}</p>
                      <p className="text-sm text-muted-foreground">{link.accessory?.brand}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {link.accessory?.external_url && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(link.accessory?.external_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUnlinkAccessory(link.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-3">Ajouter des accessoires</h3>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un accessoire..." 
              className="pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {loadingAccessories ? (
          <p className="text-muted-foreground">Chargement des accessoires...</p>
        ) : filteredAccessories && filteredAccessories.length > 0 ? (
          <ScrollArea className="h-64 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAccessories.map((accessory) => (
                <Card key={accessory.id} className="relative">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {accessory.image_url ? (
                        <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                          <img 
                            src={accessory.image_url} 
                            alt={accessory.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                          <Tag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-medium">{accessory.name}</p>
                        <p className="text-sm text-muted-foreground">{accessory.brand}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleLinkAccessory(accessory.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 bg-muted/50 rounded-md">
            <p className="text-muted-foreground">
              {searchTerm ? "Aucun accessoire trouvé" : "Aucun accessoire disponible"}
            </p>
            <Button 
              variant="link" 
              onClick={() => window.open('/admin/pro-accessories', '_blank')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Gérer les accessoires
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessoriesSelector;
