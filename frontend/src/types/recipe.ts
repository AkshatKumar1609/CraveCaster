export interface RecipeNutrition {
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
}

export interface Recipe {
  name: string;
  time: number;
  ingredients: string[];
  directions: string[];
  image: string;
  nutrition: RecipeNutrition;
  score: number;
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
