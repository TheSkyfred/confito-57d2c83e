
import React, { useState, useEffect } from 'react';
import { useAdvice } from '@/hooks/useAdvice';
import { AdviceFilters } from '@/types/advice';
import AdviceHeader from '@/components/advice/AdviceHeader';
import AdviceCard from '@/components/advice/AdviceCard';
import AdviceFilterCard from '@/components/advice/AdviceFilterCard';
import AdviceSearch from '@/components/advice/AdviceSearch';
import { Skeleton } from "@/components/ui/skeleton";

const Conseils = () => {
  const [filters, setFilters] = useState<AdviceFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { advice, isLoading, error } = useAdvice({
    ...filters,
    searchTerm
  });

  const handleFilterChange = (newFilters: Partial<AdviceFilters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  return (
    <div className="container py-8">
      <AdviceHeader user={null} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
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
        </div>

        <div className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-40 w-full rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500">Error: {error.message}</p>
          ) : advice && advice.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advice.map(article => (
                <AdviceCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p>Aucun conseil trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conseils;
