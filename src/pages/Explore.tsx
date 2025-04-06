
import React, { useEffect } from 'react';
import SearchBar from '@/components/explore/SearchBar';
import ActiveFilters from '@/components/explore/ActiveFilters';
import JamsGrid from '@/components/explore/JamsGrid';
import { useJamsFiltering } from '@/hooks/useJamsFiltering';
import { toast } from '@/hooks/use-toast';

const Explore = () => {
  const {
    jams,
    isLoading,
    error,
    filters,
    activeFilterCount,
    updateSearchTerm,
    updateSortBy,
    toggleFruitFilter,
    toggleAllergenFilter,
    updateMaxSugar,
    updateMinRating,
    updateMaxPrice,
    resetFilters,
    refreshData
  } = useJamsFiltering();

  // Afficher les erreurs et créer une notification pour l'utilisateur
  useEffect(() => {
    if (error) {
      console.error("Erreur dans Explore.tsx:", error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les confitures. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  }, [error]);

  // Logging détaillé pour débogage
  useEffect(() => {
    console.log("Explore - État de chargement:", isLoading);
    console.log("Explore - Confitures chargées:", jams);
    console.log("Explore - Nombre de confitures:", jams ? jams.length : 0);
    console.log("Explore - Erreur:", error);
  }, [isLoading, jams, error]);

  return (
    <div className="container py-8">
      <div className="flex flex-col mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2">
          Découvrir les confitures
        </h1>
        <p className="text-muted-foreground">
          Explorez notre collection de confitures artisanales et trouvez votre prochain coup de cœur
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <SearchBar 
        filters={filters}
        updateSearchTerm={updateSearchTerm}
        updateSortBy={updateSortBy}
        toggleFruitFilter={toggleFruitFilter}
        toggleAllergenFilter={toggleAllergenFilter}
        updateMaxSugar={updateMaxSugar}
        updateMinRating={updateMinRating}
        updateMaxPrice={updateMaxPrice}
        resetFilters={resetFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Filtres actifs */}
      <ActiveFilters 
        filters={filters}
        toggleFruitFilter={toggleFruitFilter}
        toggleAllergenFilter={toggleAllergenFilter}
        updateMaxSugar={updateMaxSugar}
        updateMinRating={updateMinRating}
        updateMaxPrice={updateMaxPrice}
        activeFilterCount={activeFilterCount}
      />

      {/* Résultats */}
      <JamsGrid 
        jams={jams}
        isLoading={isLoading}
        error={error}
        resetFilters={resetFilters}
        refreshData={refreshData}
      />
    </div>
  );
};

export default Explore;
