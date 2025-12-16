import { Recipe } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';

interface RecipeGridProps {
  recipes: Recipe[];
  loading?: boolean;
  hasSearched?: boolean;
}

export function RecipeGrid({ recipes, loading, hasSearched }: RecipeGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-20 h-20 rounded-full gradient-sunset animate-spin-slow opacity-30" />
          <UtensilsCrossed className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
        </div>
        <p className="mt-6 text-lg text-muted-foreground font-medium">Finding perfect recipes...</p>
        <p className="text-sm text-muted-foreground">This may take a moment</p>
      </div>
    );
  }

  if (hasSearched && recipes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="text-6xl mb-4">🥺</div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">No recipes found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Try adjusting your search terms or being less specific with your constraints.
        </p>
      </motion.div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Found {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <RecipeCard key={`${recipe.name}-${index}`} recipe={recipe} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
