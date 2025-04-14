
import React, { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useRankingsData } from '@/hooks/useRankingsData';
import RankingsHeader from '@/components/rankings/RankingsHeader';
import RegularJamsRanking from '@/components/rankings/RegularJamsRanking';
import ProJamsRanking from '@/components/rankings/ProJamsRanking';
import TopUsersRanking from '@/components/rankings/TopUsersRanking';

const Rankings: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('regular-jams');
  
  const {
    topRegularJams,
    isLoadingRegularJams,
    topUsers,
    isLoadingUsers,
    topProJams,
    isLoadingProJams
  } = useRankingsData();

  return (
    <div className="container py-8">
      <RankingsHeader />

      <Tabs defaultValue="regular-jams" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="regular-jams" className="flex-1">Meilleures confitures</TabsTrigger>
          <TabsTrigger value="pro-jams" className="flex-1">Confitures professionnelles</TabsTrigger>
          <TabsTrigger value="users" className="flex-1">Meilleurs confituriers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regular-jams">
          <RegularJamsRanking 
            jams={topRegularJams} 
            isLoading={isLoadingRegularJams} 
          />
        </TabsContent>
        
        <TabsContent value="pro-jams">
          <ProJamsRanking 
            jams={topProJams} 
            isLoading={isLoadingProJams} 
          />
        </TabsContent>
        
        <TabsContent value="users">
          <TopUsersRanking 
            users={topUsers} 
            isLoading={isLoadingUsers} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rankings;
