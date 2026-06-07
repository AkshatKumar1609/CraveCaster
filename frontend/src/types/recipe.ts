export interface RecipeNutritionItem {
  label: string;
  value: string;
  unit?: string;
  dailyValue?: string;
}

export interface RecipeNutrition {
  // Structured parsed nutrition from the raw string
  fat?: number;
  sat_fat?: number;
  cholesterol?: number;
  sodium?: number;
  fiber?: number;
  sugar?: number;
  protein?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  carbohydrate?: number;
  // Raw string for display fallback
  raw?: string;
}

export interface Recipe {
  name: string;
  time: string;           // e.g. "1 hrs 20 mins" — now a string from API
  timeMinutes: number;    // parsed minutes for difficulty calculation
  ingredients: string[];
  directions: string[];
  image: string;
  nutrition: RecipeNutrition;
  score: number;          // match_score_percentage
  rating?: number;
  rank?: number;
  cuisinePath?: string;
}

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
