import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { RecipeResultsView } from '@/components/RecipeResultsView';
import { RecipeDetailView } from '@/components/RecipeDetailView';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';
import { Recipe } from '@/types/recipe';
import { AnimatePresence, motion } from 'framer-motion';

const Index = () => {
  const { recipes, loading, hasSearched, searchRecipes } = useRecipeSearch();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleBack = () => {
    window.location.reload();
  };

  const handleBackFromRecipe = () => {
    setSelectedRecipe(null);
  };

  // Show full-page recipe detail when a recipe is selected
  if (selectedRecipe) {
    return <RecipeDetailView recipe={selectedRecipe} onBack={handleBackFromRecipe} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        <AnimatePresence mode="wait">
          {hasSearched ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RecipeResultsView
                recipes={recipes}
                loading={loading}
                onSearch={searchRecipes}
                onBack={handleBack}
                onSelectRecipe={setSelectedRecipe}
              />
            </motion.div>
          ) : (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Hero onSearch={searchRecipes} loading={loading} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer - only show on home */}
        {!hasSearched && (
          <footer className="border-t border-border py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-muted-foreground">
                © 2024 CraveCaster. Discover recipes that match your cravings.
              </p>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
};

export default Index;
