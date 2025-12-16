import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { toast } from 'sonner';

const API_URL = 'https://cravecaster.onrender.com/search';

export function useRecipeSearch() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchRecipes = async (prompt: string, limit: number = 10) => {
    if (!prompt.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, limit }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setRecipes(data);
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
  };

  return {
    recipes,
    loading,
    hasSearched,
    searchRecipes,
    clearResults,
  };
}
