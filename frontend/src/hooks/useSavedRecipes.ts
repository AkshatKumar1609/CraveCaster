import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Recipe, RecipeNutrition } from '@/types/recipe';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_name: string;
  recipe_image: string | null;
  recipe_time: number | null;
  recipe_ingredients: string[];
  recipe_directions: string[];
  recipe_nutrition: RecipeNutrition;
  created_at: string;
}

function parseJsonArray(json: Json | null): string[] {
  if (!json) return [];
  if (Array.isArray(json)) return json.map(item => String(item));
  return [];
}

function parseJsonObject(json: Json | null): RecipeNutrition {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return {};
  return json as RecipeNutrition;
}

function mapToSavedRecipe(row: {
  id: string;
  user_id: string;
  recipe_name: string;
  recipe_image: string | null;
  recipe_time: number | null;
  recipe_ingredients: Json | null;
  recipe_directions: Json | null;
  recipe_nutrition: Json | null;
  created_at: string;
}): SavedRecipe {
  return {
    id: row.id,
    user_id: row.user_id,
    recipe_name: row.recipe_name,
    recipe_image: row.recipe_image,
    recipe_time: row.recipe_time,
    recipe_ingredients: parseJsonArray(row.recipe_ingredients),
    recipe_directions: parseJsonArray(row.recipe_directions),
    recipe_nutrition: parseJsonObject(row.recipe_nutrition),
    created_at: row.created_at,
  };
}

export function useSavedRecipes() {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedRecipes();
    } else {
      setSavedRecipes([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSavedRecipes = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved recipes:', error);
    } else {
      setSavedRecipes((data || []).map(mapToSavedRecipe));
    }
    setLoading(false);
  };

  const saveRecipe = async (recipe: Recipe) => {
    if (!user) {
      toast.error('Please sign in to save recipes');
      return { error: new Error('Not authenticated') };
    }

    // Check if already saved before making the request
    if (isRecipeSaved(recipe.name)) {
      toast.info('Recipe is already saved');
      return { error: new Error('Already saved') };
    }

    const { data, error } = await supabase
      .from('saved_recipes')
      .insert({
        user_id: user.id,
        recipe_name: recipe.name,
        recipe_image: recipe.image,
        recipe_time: recipe.time,
        recipe_ingredients: recipe.ingredients as unknown as Json,
        recipe_directions: recipe.directions as unknown as Json,
        recipe_nutrition: recipe.nutrition as unknown as Json,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.info('Recipe is already saved');
      } else {
        toast.error('Failed to save recipe');
      }
    } else if (data) {
      setSavedRecipes(prev => [mapToSavedRecipe(data), ...prev]);
      toast.success('Recipe saved!');
    }

    return { data, error };
  };

  const removeRecipe = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to remove recipe');
    } else {
      setSavedRecipes(prev => prev.filter(r => r.id !== id));
      toast.success('Recipe removed');
    }

    return { error };
  };

  const isRecipeSaved = (recipeName: string) => {
    return savedRecipes.some(r => r.recipe_name === recipeName);
  };

  return {
    savedRecipes,
    loading,
    saveRecipe,
    removeRecipe,
    isRecipeSaved,
    refetch: fetchSavedRecipes,
  };
}