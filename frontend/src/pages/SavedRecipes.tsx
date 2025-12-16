import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSavedRecipes, SavedRecipe } from '@/hooks/useSavedRecipes';
import { RecipeDetailView } from '@/components/RecipeDetailView';
import { Recipe } from '@/types/recipe';
import { Clock, Trash2, BookmarkX, Loader2, Dumbbell, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

// Convert SavedRecipe to Recipe type for RecipeDetailView
function convertToRecipe(savedRecipe: SavedRecipe): Recipe {
  return {
    name: savedRecipe.recipe_name,
    image: savedRecipe.recipe_image || '',
    time: savedRecipe.recipe_time || 0,
    ingredients: savedRecipe.recipe_ingredients || [],
    directions: savedRecipe.recipe_directions || [],
    nutrition: savedRecipe.recipe_nutrition || {},
    score: 0,
  };
}

export default function SavedRecipes() {
  const { user, loading: authLoading } = useAuth();
  const { savedRecipes, loading, removeRecipe } = useSavedRecipes();
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show full-page recipe detail when a recipe is selected
  if (selectedRecipe) {
    return (
      <RecipeDetailView 
        recipe={convertToRecipe(selectedRecipe)} 
        onBack={() => setSelectedRecipe(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Saved Recipes</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {savedRecipes.length} {savedRecipes.length === 1 ? 'recipe' : 'recipes'} saved
              </p>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">Find More Recipes</Button>
            </Link>
          </div>

          {savedRecipes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 sm:py-20 px-4"
            >
              <div className="p-3 sm:p-4 rounded-full bg-muted mb-3 sm:mb-4">
                <BookmarkX className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-2 text-center">
                No Saved Recipes Yet
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-4 sm:mb-6">
                Start exploring and save recipes you love to build your personal collection.
              </p>
              <Link to="/">
                <Button variant="hero" size="sm">Discover Recipes</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {savedRecipes.map((recipe, index) => (
                <SavedRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  index={index}
                  onRemove={() => removeRecipe(recipe.id)}
                  onSelect={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

interface SavedRecipeCardProps {
  recipe: SavedRecipe;
  index: number;
  onRemove: () => void;
  onSelect: () => void;
}

function SavedRecipeCard({ recipe, index, onRemove, onSelect }: SavedRecipeCardProps) {
  const nutrition = recipe.recipe_nutrition || {};

  const formatTime = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card 
        className="group overflow-hidden bg-card hover:shadow-card transition-all duration-300 border-border/50 cursor-pointer"
        onClick={onSelect}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {recipe.recipe_image ? (
            <img
              src={recipe.recipe_image}
              alt={recipe.recipe_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
          
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {recipe.recipe_time && (
              <Badge className="bg-card/90 text-foreground backdrop-blur-sm">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(recipe.recipe_time)}
              </Badge>
            )}
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-serif text-xl font-semibold text-foreground line-clamp-2 mb-3">
            {capitalizeFirstLetter(recipe.recipe_name)}
          </h3>

          {/* Quick nutrition stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            {nutrition.protein && (
              <div className="flex items-center gap-1">
                <Dumbbell className="h-4 w-4 text-accent" />
                <span>{nutrition.protein}g Protein</span>
              </div>
            )}
            {nutrition.fat && (
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-primary" />
                <span>{nutrition.fat}g Fat</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
