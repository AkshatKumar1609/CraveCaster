import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Bookmark, BookmarkCheck, ArrowLeft, Flame, Utensils, ListChecks } from 'lucide-react';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { AuthDialog } from '@/components/AuthDialog';

interface RecipeDetailViewProps {
  recipe: Recipe;
  onBack: () => void;
}

function getDifficulty(time: number): { label: string; color: string; bgColor: string } {
  if (time <= 30) {
    return { label: 'Easy', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700' };
  } else if (time <= 60) {
    return { label: 'Medium', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700' };
  } else {
    return { label: 'Hard', color: 'text-rose-700 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-900/50 border-rose-300 dark:border-rose-700' };
  }
}

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes} Min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function RecipeDetailView({ recipe, onBack }: RecipeDetailViewProps) {
  const { saveRecipe, removeRecipe, isRecipeSaved, savedRecipes } = useSavedRecipes();
  const { user } = useAuth();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const isSaved = isRecipeSaved(recipe.name);
  const savedRecipe = savedRecipes.find(r => r.recipe_name === recipe.name);
  const difficulty = getDifficulty(recipe.time);

  const handleSaveToggle = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    if (isSaved && savedRecipe) {
      await removeRecipe(savedRecipe.id);
    } else {
      await saveRecipe(recipe);
    }
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const nutritionItems = [
    { key: 'calories', label: 'Calories', unit: '' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'fat', label: 'Fat', unit: 'g' },
    { key: 'fiber', label: 'Fiber', unit: 'g' },
    { key: 'sugar', label: 'Sugar', unit: 'g' },
    { key: 'sodium', label: 'Sodium', unit: 'mg' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <Navbar />
      {/* Hero Image Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-black/90">
        {recipe.image ? (
          <>
            {/* Blurred background */}
            <img
              src={recipe.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50"
            />
            {/* Main image with original proportions */}
            <img
              src={recipe.image}
              alt={recipe.name}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <span className="text-8xl">🍽️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm hover:bg-background border border-border h-10 w-10"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {recipe.time > 0 && (
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border border-border text-sm px-3 py-1">
              <Clock className="h-4 w-4 mr-1.5" />
              {formatTime(recipe.time)}
            </Badge>
          )}
          <Badge className={`${difficulty.bgColor} ${difficulty.color} border text-sm px-3 py-1`}>
            {difficulty.label}
          </Badge>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight max-w-4xl">
            {capitalizeFirstLetter(recipe.name)}
          </h1>
        </div>
      </div>

      {/* Action bar */}
      <div className="sticky top-0 z-10 px-4 md:px-8 py-3 sm:py-4 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1 sm:gap-2">
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">{recipe.ingredients.length}</span>
              <span className="xs:hidden">{recipe.ingredients.length}</span>
              <span className="hidden sm:inline">Ingredients</span>
            </span>
            <span className="flex items-center gap-1 sm:gap-2">
              <ListChecks className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{recipe.directions.length}</span>
              <span className="hidden sm:inline">Steps</span>
            </span>
          </div>
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={handleSaveToggle}
            className="shrink-0"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Save Recipe</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Auth Dialog for non-logged users */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onSuccess={() => saveRecipe(recipe)}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* Nutrition Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-semibold text-base sm:text-lg text-foreground mb-3 sm:mb-4 flex items-center gap-2">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Nutrition Facts
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            {nutritionItems.map(({ key, label, unit }) => {
              const value = recipe.nutrition[key as keyof typeof recipe.nutrition];
              if (!value) return null;
              return (
                <div key={key} className="bg-muted/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 text-center border border-border/50">
                  <div className="text-lg sm:text-2xl font-bold text-foreground">
                    {value}
                    {unit && <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-0.5">{unit}</span>}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{label}</div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Ingredients */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-semibold text-base sm:text-lg text-foreground mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
            <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Ingredients
            <span className="text-xs sm:text-sm text-muted-foreground font-normal ml-1 sm:ml-2">
              ({checkedIngredients.size}/{recipe.ingredients.length} done)
            </span>
          </h2>
          <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
            {recipe.ingredients.map((ing, i) => {
              const isChecked = checkedIngredients.has(i);
              return (
                <div
                  key={i}
                  onClick={() => toggleIngredient(i)}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
                    isChecked 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-card border-border hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <Checkbox 
                    checked={isChecked} 
                    onCheckedChange={() => toggleIngredient(i)}
                    className="shrink-0 h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className={`text-sm sm:text-base ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {capitalizeFirstLetter(ing)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Directions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-semibold text-base sm:text-lg text-foreground mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
            <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Directions
            <span className="text-xs sm:text-sm text-muted-foreground font-normal ml-1 sm:ml-2">
              ({checkedSteps.size}/{recipe.directions.length} completed)
            </span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {recipe.directions.map((step, i) => {
              const isChecked = checkedSteps.has(i);
              return (
                <div 
                  key={i} 
                  onClick={() => toggleStep(i)}
                  className={`flex gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
                    isChecked 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-card border-border hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm sm:text-base transition-colors ${
                    isChecked 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isChecked ? '✓' : i + 1}
                  </div>
                  <p className={`text-sm sm:text-base leading-relaxed pt-0.5 sm:pt-1 ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {capitalizeFirstLetter(step)}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
