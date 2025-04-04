
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SeasonalFruit } from '@/types/database.types';

const months = [
  { value: 'jan', name: 'Janvier', season: 'Hiver' },
  { value: 'feb', name: 'Février', season: 'Hiver' },
  { value: 'mar', name: 'Mars', season: 'Printemps' },
  { value: 'apr', name: 'Avril', season: 'Printemps' },
  { value: 'may', name: 'Mai', season: 'Printemps' },
  { value: 'jun', name: 'Juin', season: 'Été' },
  { value: 'jul', name: 'Juillet', season: 'Été' },
  { value: 'aug', name: 'Août', season: 'Été' },
  { value: 'sep', name: 'Septembre', season: 'Automne' },
  { value: 'oct', name: 'Octobre', season: 'Automne' },
  { value: 'nov', name: 'Novembre', season: 'Automne' },
  { value: 'dec', name: 'Décembre', season: 'Hiver' }
];

const currentMonthValue = months[new Date().getMonth()].value;

export default function SeasonalCalendar() {
  const [activeMonth, setActiveMonth] = useState(currentMonthValue);
  const [searchQuery, setSearchQuery] = useState("");

  // Récupérer les fruits de saison depuis Supabase
  const { data: fruits, isLoading, isError } = useQuery({
    queryKey: ['seasonal_fruits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasonal_fruits')
        .select('*');
        
      if (error) throw error;
      return data;
    },
  });

  // Filtrer les fruits selon le mois sélectionné et la recherche
  const filteredFruits = useMemo(() => {
    if (!fruits) return [];
    
    return fruits.filter(fruit => {
      const matchesMonth = fruit[activeMonth as keyof SeasonalFruit];
      const matchesSearch = searchQuery === "" || 
        fruit.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesMonth && matchesSearch;
    });
  }, [fruits, activeMonth, searchQuery]);

  return (
    <div className="container py-8">
      <h1 className="font-serif text-3xl font-bold mb-4 text-center">
        Calendrier des <span className="text-jam-raspberry">fruits de saison</span>
      </h1>
      
      <p className="text-center mb-8 max-w-2xl mx-auto">
        Découvrez quels fruits sont de saison chaque mois pour préparer vos confitures
        avec les meilleurs ingrédients frais du moment.
      </p>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Fruits disponibles</CardTitle>
            <Input
              placeholder="Rechercher un fruit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <CardDescription>
            {months.find(m => m.value === activeMonth)?.name} - {filteredFruits.length} fruits de saison
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          <Tabs defaultValue={currentMonthValue} value={activeMonth} onValueChange={setActiveMonth}>
            <div className="px-6 overflow-auto">
              <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1">
                {months.map(month => (
                  <TabsTrigger key={month.value} value={month.value} className="text-xs sm:text-sm">
                    {month.name.substring(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {months.map(month => (
              <TabsContent key={month.value} value={month.value} className="p-6 pt-4">
                {isLoading ? (
                  <div className="text-center py-12">Chargement des fruits de saison...</div>
                ) : isError ? (
                  <div className="text-center py-12 text-red-500">
                    Erreur lors du chargement des fruits de saison.
                  </div>
                ) : filteredFruits.length === 0 ? (
                  <div className="text-center py-12">
                    Aucun fruit trouvé pour ce mois ou cette recherche.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredFruits.map(fruit => (
                      <div key={fruit.id} className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          {fruit.image_url ? (
                            <AvatarImage src={fruit.image_url} alt={fruit.name} />
                          ) : (
                            <AvatarFallback className="bg-jam-leaf/10 text-jam-leaf">
                              {fruit.name[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{fruit.name}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {months.filter(m => fruit[m.value as keyof SeasonalFruit]).map(m => (
                              <Badge 
                                key={m.value} 
                                variant={m.value === activeMonth ? "default" : "outline"}
                                className="text-xs"
                              >
                                {m.name.substring(0, 3)}
                              </Badge>
                            ))}
                          </div>
                          {fruit.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {fruit.description}
                            </p>
                          )}
                          {fruit.conservation_tips && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="font-semibold">Conservation:</span> {fruit.conservation_tips}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
