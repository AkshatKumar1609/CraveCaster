import { useState } from 'react';
import { Recipe, RecipeNutrition } from '@/types/recipe';
import { toast } from 'sonner';

const API_URL = 'https://cravecaster.onrender.com/search';

/**
 * Parse a time string like "1 hrs 20 mins", "50 mins", "4 hrs 20 mins" into total minutes.
 */
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  let total = 0;
  const hrMatch = timeStr.match(/(\d+)\s*hrs?/);
  const minMatch = timeStr.match(/(\d+)\s*mins?/);
  if (hrMatch) total += parseInt(hrMatch[1]) * 60;
  if (minMatch) total += parseInt(minMatch[1]);
  return total;
}

/**
 * Parse the nutrition string from the API into a structured RecipeNutrition object.
 * Example: "Total Fat 11g 14%, Saturated Fat 4g 19%, ..."
 */
function parseNutritionString(nutritionStr: string): RecipeNutrition {
  if (!nutritionStr) return {};

  const nutrition: RecipeNutrition = { raw: nutritionStr };

  const extract = (pattern: RegExp): number | undefined => {
    const match = nutritionStr.match(pattern);
    return match ? parseFloat(match[1]) : undefined;
  };

  nutrition.fat = extract(/Total Fat\s+([\d.]+)g/);
  nutrition.sat_fat = extract(/Saturated Fat\s+([\d.]+)g/);
  nutrition.cholesterol = extract(/Cholesterol\s+([\d.]+)mg/);
  nutrition.sodium = extract(/Sodium\s+([\d.]+)mg/);
  nutrition.carbohydrate = extract(/Total Carbohydrate\s+([\d.]+)g/);
  nutrition.fiber = extract(/Dietary Fiber\s+([\d.]+)g/);
  nutrition.sugar = extract(/Total Sugars\s+([\d.]+)g/);
  nutrition.protein = extract(/Protein\s+([\d.]+)g/);
  nutrition.calcium = extract(/Calcium\s+([\d.]+)mg/);
  nutrition.iron = extract(/Iron\s+([\d.]+)mg/);
  nutrition.potassium = extract(/Potassium\s+([\d.]+)mg/);

  return nutrition;
}

/**
 * Parse comma-separated ingredients string into an array.
 */
function parseIngredients(ingredientsStr: string): string[] {
  if (!ingredientsStr) return [];
  return ingredientsStr
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Parse directions text (newline-separated) into an array of steps.
 */
function parseDirections(directionsStr: string): string[] {
  if (!directionsStr) return [];
  return directionsStr
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Map a raw API result item to our internal Recipe type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiResultToRecipe(item: any): Recipe {
  return {
    name: item.recipe_name ?? '',
    time: item.total_time ?? '',
    timeMinutes: parseTimeToMinutes(item.total_time ?? ''),
    ingredients: parseIngredients(item.ingredients ?? ''),
    directions: parseDirections(item.directions ?? ''),
    image: item.img_url ?? '',
    nutrition: parseNutritionString(item.nutrition ?? ''),
    score: item.match_score_percentage ?? 0,
    rating: item.rating ?? undefined,
    rank: item.rank ?? undefined,
    cuisinePath: item.cuisine_path ?? undefined,
  };
}

export function useRecipeSearch() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalReturned, setTotalReturned] = useState<number>(0);
  const [userQuery, setUserQuery] = useState<string>('');

  const searchRecipes = async (prompt: string, limit: number = 10) => {
    if (!prompt.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const url = new URL(API_URL);
      url.searchParams.set('query', prompt);
      url.searchParams.set('limit', String(limit));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle new API format: { user_query, total_returned, results: [...] }
      if (data.results && Array.isArray(data.results)) {
        setUserQuery(data.user_query ?? prompt);
        setTotalReturned(data.total_returned ?? data.results.length);
        setRecipes(data.results.map(mapApiResultToRecipe));
      } else if (Array.isArray(data)) {
        // Fallback: old flat array format
        setUserQuery(prompt);
        setTotalReturned(data.length);
        setRecipes(data);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search recipes. Please try again.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setRecipes([]);
    setHasSearched(false);
    setTotalReturned(0);
    setUserQuery('');
  };

  return {
    recipes,
    loading,
    hasSearched,
    searchRecipes,
    clearResults,
    totalReturned,
    userQuery,
  };
}
