import { Recipe } from '@/types/recipe';
import { SearchBar } from './SearchBar';
import { RecipeCard } from './RecipeCard';
import { motion } from 'framer-motion';
import { ArrowLeft, ChefHat, Utensils, Flame, Salad, Cookie, Soup } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecipeResultsViewProps {
  recipes: Recipe[];
  loading: boolean;
  onSearch: (query: string) => void;
  onBack: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

const foodIcons = [Utensils, Flame, Salad, Cookie, Soup];

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Animated food icons circle */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Orbiting food icons */}
        {foodIcons.map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [
                Math.cos((index * 2 * Math.PI) / foodIcons.length) * 50 - 12,
                Math.cos((index * 2 * Math.PI) / foodIcons.length + Math.PI) * 50 - 12,
                Math.cos((index * 2 * Math.PI) / foodIcons.length) * 50 - 12,
              ],
              y: [
                Math.sin((index * 2 * Math.PI) / foodIcons.length) * 50 - 12,
                Math.sin((index * 2 * Math.PI) / foodIcons.length + Math.PI) * 50 - 12,
                Math.sin((index * 2 * Math.PI) / foodIcons.length) * 50 - 12,
              ],
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          >
            <Icon className="h-6 w-6 text-primary" />
          </motion.div>
        ))}
        
        {/* Center pulsing chef hat */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
        </motion.div>
      </div>

      {/* Animated text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.p 
          className="text-lg font-medium text-foreground mb-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Finding delicious recipes...
        </motion.p>
        <p className="text-sm text-muted-foreground">Our AI chef is working magic</p>
      </motion.div>

      {/* Skeleton cards */}
      <div className="w-full max-w-6xl mt-12 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-card border border-border overflow-hidden"
            >
              <motion.div
                className="h-48 bg-gradient-to-r from-muted via-muted/50 to-muted"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: '200% 100%' }}
              />
              <div className="p-4 space-y-3">
                <motion.div
                  className="h-5 bg-muted rounded-md w-3/4"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                />
                <motion.div
                  className="h-4 bg-muted rounded-md w-1/2"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 + 0.1 }}
                />
                <div className="flex gap-2 pt-2">
                  <motion.div
                    className="h-6 w-16 bg-muted rounded-full"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 + 0.2 }}
                  />
                  <motion.div
                    className="h-6 w-12 bg-muted rounded-full"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 + 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RecipeResultsView({ 
  recipes, 
  loading, 
  onSearch, 
  onBack,
  onSelectRecipe 
}: RecipeResultsViewProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header with Search */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 max-w-2xl">
              <SearchBar onSearch={onSearch} loading={loading} compact />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <LoadingSkeleton />
        ) : recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No recipes found</h3>
            <p className="text-muted-foreground">Try adjusting your search or explore different ingredients</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 sm:mb-6"
            >
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">Click on a recipe to view full details</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={`${recipe.name}-${index}`}
                  recipe={recipe}
                  index={index}
                  onClick={() => onSelectRecipe(recipe)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
