
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecipeTabContent from './RecipeTabContent';
import { RecipeType } from '@/types/recipes';

interface RecipeTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recipes: RecipeType[] | undefined;
  isLoading: boolean;
  searchTerm: string;
}

const RecipeTabs: React.FC<RecipeTabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  recipes, 
  isLoading,
  searchTerm
}) => {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="all">Toutes</TabsTrigger>
        <TabsTrigger value="seasonal">De saison</TabsTrigger>
        <TabsTrigger value="quick">Rapides</TabsTrigger>
        <TabsTrigger value="popular">Populaires</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <RecipeTabContent 
          recipes={recipes} 
          isLoading={isLoading} 
          searchTerm={searchTerm}
        />
      </TabsContent>
      
      <TabsContent value="seasonal" className="mt-0">
        <RecipeTabContent 
          recipes={recipes} 
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      </TabsContent>
      
      <TabsContent value="quick" className="mt-0">
        <RecipeTabContent 
          recipes={recipes} 
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      </TabsContent>
      
      <TabsContent value="popular" className="mt-0">
        <RecipeTabContent 
          recipes={recipes} 
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      </TabsContent>
    </Tabs>
  );
};

export default RecipeTabs;
