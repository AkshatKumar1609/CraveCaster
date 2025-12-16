import { Recipe } from '@/types/recipe';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Dumbbell, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
  onClick?: () => void;
}

function getDifficulty(time: number): { label: string; color: string; bgColor: string } {
  if (time <= 30) {
    return { label: 'Easy', color: 'text-green-700', bgColor: 'bg-green-100 border-green-200' };
  } else if (time <= 60) {
    return { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-200' };
  } else {
    return { label: 'Hard', color: 'text-red-700', bgColor: 'bg-red-100 border-red-200' };
  }
}

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function RecipeCard({ recipe, index = 0, onClick }: RecipeCardProps) {
  const difficulty = getDifficulty(recipe.time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="group overflow-hidden bg-card hover:shadow-card transition-all duration-300 border-border/50 h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {recipe.time > 0 && (
              <Badge className="bg-card/90 text-foreground backdrop-blur-sm border">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(recipe.time)}
              </Badge>
            )}
          </div>
          
          {/* Difficulty badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${difficulty.bgColor} ${difficulty.color} border backdrop-blur-sm font-medium`}>
              {difficulty.label}
            </Badge>
          </div>

          {/* Hover CTA */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white text-sm font-medium">Click to view recipe →</span>
          </div>
        </div>

        <CardContent className="p-3 sm:p-4">
          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground line-clamp-2 mb-2 sm:mb-3 group-hover:text-primary transition-colors">
            {recipe.name}
          </h3>

          {/* Quick nutrition stats */}
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            {recipe.nutrition.protein && (
              <div className="flex items-center gap-1">
                <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                <span>{recipe.nutrition.protein}g</span>
              </div>
            )}
            {recipe.nutrition.fat && (
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>{recipe.nutrition.fat}g fat</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
