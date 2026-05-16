// ─── Enums ────────────────────────────────────────────────────────────────────

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks";
export type WeightUnit = "kg" | "lbs";
export type TabId = "dashboard" | "log" | "recipes" | "weight" | "settings";

// ─── Nutrients ────────────────────────────────────────────────────────────────

export interface NutrientMap {
  // Macros
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  // Vitamins
  vitA?: number;
  vitB1?: number;
  vitB2?: number;
  vitB3?: number;
  vitB5?: number;
  vitB6?: number;
  vitB12?: number;
  vitC?: number;
  vitD?: number;
  vitE?: number;
  vitK?: number;
  folate?: number;
  // Minerals
  calcium?: number;
  iron?: number;
  magnesium?: number;
  potassium?: number;
  sodium?: number;
  zinc?: number;
  selenium?: number;
  phosphorus?: number;
  copper?: number;
  manganese?: number;
  // Index signature
  [key: string]: number | undefined;
}

export type NutrientKey = keyof NutrientMap;

// ─── Food ─────────────────────────────────────────────────────────────────────

export interface Food {
  fdcId: number;
  name: string;
  brand?: string;
  servingSize: number;
  servingSizeUnit: string;
  nutrients: NutrientMap;
  source: "usda" | "recipe";
}

export interface LoggedFood extends Food {
  logId: string;          // unique per log entry
  servings: number;
}

// ─── USDA API raw shapes ──────────────────────────────────────────────────────

export interface UsdaFoodNutrient {
  nutrientId?: number;
  nutrient?: { id: number; name: string; unitName: string };
  amount?: number;
  value?: number;
}

export interface UsdaSearchFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: UsdaFoodNutrient[];
}

export interface UsdaSearchResponse {
  foods: UsdaSearchFood[];
  totalHits?: number;
  currentPage?: number;
  totalPages?: number;
}

export interface UsdaFoodDetail {
  fdcId: number;
  description: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: UsdaFoodNutrient[];
}

// ─── Daily Log ────────────────────────────────────────────────────────────────

export type DayMeals = Record<MealType, LoggedFood[]>;

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: DayMeals;
  water?: number;
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  id: string;
  fdcId?: number;
  name: string;
  servings: number;
  nutrients: NutrientMap;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  nutrientTotals: NutrientMap;
  createdAt: number;
}

// ─── Weight ───────────────────────────────────────────────────────────────────

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  unit: WeightUnit;
}

// ─── User Targets ─────────────────────────────────────────────────────────────

export type NutrientTargets = Required<
  Pick<
    NutrientMap,
    | "calories" | "protein" | "carbs" | "fat" | "fiber" | "sugar"
    | "vitA" | "vitB1" | "vitB2" | "vitB3" | "vitB5" | "vitB6" | "vitB12"
    | "vitC" | "vitD" | "vitE" | "vitK" | "folate"
    | "calcium" | "iron" | "magnesium" | "potassium" | "sodium" | "zinc"
    | "selenium" | "phosphorus" | "copper" | "manganese"
  >
>;
