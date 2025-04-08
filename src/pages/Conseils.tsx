
import React, { useState } from 'react';
import { useAdvice } from '@/hooks/useAdvice';
import { useAuth } from '@/contexts/AuthContext';
import { AdviceFilters } from '@/types/advice';
import AdviceHeader from '@/components/advice/AdviceHeader';
import AdviceSearch from '@/components/advice/AdviceSearch';
import AdviceFilterCard from '@/components/advice/AdviceFilterCard';
import AdviceCard from '@/components/advice/AdviceCard';
import { Skeleton } from '@/components/ui/skeleton';

const Conseils = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AdviceFilters>({
    type: [],
    hasVideo: false,
    hasProducts: false,
    sortBy: 'date',
    searchTerm: ''
  });

  // Mettre à jour le terme de recherche dans les filtres
  React.useEffect(() => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, [searchTerm]);

  const handleFilterChange = (newFilters: AdviceFilters) => {
    setFilters(newFilters);
  };

  const { advice, isLoading } = useAdvice(filters);

  return (
    <div className="container py-8">
      <AdviceHeader user={user} />
      
      <AdviceSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
      />
      
      {showFilters && (
        <AdviceFilterCard 
          filters={filters} 
          setFilters={setFilters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4 rounded-md" />
                <Skeleton className="h-4 w-1/4 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : advice && advice.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {advice.map(item => (
            <AdviceCard key={item.id} advice={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Aucun conseil trouvé</h3>
          <p className="text-muted-foreground">
            {searchTerm || Object.values(filters).some(f => 
              Array.isArray(f) ? f.length > 0 : Boolean(f)
            ) 
              ? "Essayez de modifier vos filtres ou votre recherche" 
              : "Des conseils seront ajoutés prochainement"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Conseils;
