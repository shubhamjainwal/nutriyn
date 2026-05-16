import { create } from "zustand";
import type {
  TabId, DayLog, Recipe, WeightEntry,
  NutrientTargets, LoggedFood, MealType,
} from "@/types/nutrition";
import { DEFAULT_TARGETS, MEAL_TYPES } from "@/lib/nutrients";
import {
  todayStr, nanoid, emptyDayLog, sumFoods,
} from "@/lib/utils";
import {
  getLog, saveLog, getAllRecipes, saveRecipe as dbSaveRecipe,
  deleteRecipe as dbDeleteRecipe, getAllWeight, saveWeight,
  deleteWeight, getTargets, saveTargets,
} from "@/lib/db";

interface SearchContext {
  mealType: MealType;
}

interface AppState {
  // Navigation
  activeTab: TabId;
  setTab: (tab: TabId) => void;

  // Food Search modal
  searchCtx: SearchContext | null;
  openSearch: (mealType: MealType) => void;
  closeSearch: () => void;

  // Today's log
  todayLog: DayLog;
  loadTodayLog: () => Promise<void>;
  addFood: (mealType: MealType, food: LoggedFood) => Promise<void>;
  removeFood: (mealType: MealType, logId: string) => Promise<void>;
  updateServings: (mealType: MealType, logId: string, servings: number) => Promise<void>;

  // Recipes
  recipes: Recipe[];
  loadRecipes: () => Promise<void>;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;

  // Weight
  weightLog: WeightEntry[];
  loadWeight: () => Promise<void>;
  addWeight: (entry: WeightEntry) => Promise<void>;
  removeWeight: (id: string) => Promise<void>;

  // Targets
  targets: NutrientTargets;
  loadTargets: () => Promise<void>;
  updateTargets: (t: NutrientTargets) => Promise<void>;

  // Bootstrap all data
  init: () => Promise<void>;
}

const emptyMeals = (): DayLog["meals"] =>
  Object.fromEntries(MEAL_TYPES.map((m) => [m, []])) as DayLog["meals"];

export const useStore = create<AppState>((set, get) => ({
  activeTab: "dashboard",
  setTab: (tab) => set({ activeTab: tab }),

  searchCtx: null,
  openSearch: (mealType) => set({ searchCtx: { mealType } }),
  closeSearch: () => set({ searchCtx: null }),

  // ── Today log ────────────────────────────────────────────────────────────
  todayLog: emptyDayLog(todayStr()),

  loadTodayLog: async () => {
    const date = todayStr();
    const log = (await getLog(date)) ?? emptyDayLog(date);
    // ensure all meal keys exist
    MEAL_TYPES.forEach((m) => {
      if (!log.meals[m]) log.meals[m] = [];
    });
    set({ todayLog: log });
  },

  addFood: async (mealType, food) => {
    const prev = get().todayLog;
    const updated: DayLog = {
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: [...(prev.meals[mealType] ?? []), food],
      },
    };
    set({ todayLog: updated });
    await saveLog(updated);
  },

  removeFood: async (mealType, logId) => {
    const prev = get().todayLog;
    const updated: DayLog = {
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: (prev.meals[mealType] ?? []).filter((f) => f.logId !== logId),
      },
    };
    set({ todayLog: updated });
    await saveLog(updated);
  },

  updateServings: async (mealType, logId, servings) => {
    const prev = get().todayLog;
    const updated: DayLog = {
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: (prev.meals[mealType] ?? []).map((f) =>
          f.logId === logId ? { ...f, servings } : f
        ),
      },
    };
    set({ todayLog: updated });
    await saveLog(updated);
  },

  // ── Recipes ───────────────────────────────────────────────────────────────
  recipes: [],
  loadRecipes: async () => {
    const recipes = await getAllRecipes();
    set({ recipes });
  },

  saveRecipe: async (recipe) => {
    await dbSaveRecipe(recipe);
    const recipes = await getAllRecipes();
    set({ recipes });
  },

  deleteRecipe: async (id) => {
    await dbDeleteRecipe(id);
    set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) }));
  },

  // ── Weight ────────────────────────────────────────────────────────────────
  weightLog: [],
  loadWeight: async () => {
    const weightLog = await getAllWeight();
    set({ weightLog });
  },

  addWeight: async (entry) => {
    await saveWeight(entry);
    const weightLog = await getAllWeight();
    set({ weightLog });
  },

  removeWeight: async (id) => {
    await deleteWeight(id);
    set((s) => ({ weightLog: s.weightLog.filter((e) => e.id !== id) }));
  },

  // ── Targets ───────────────────────────────────────────────────────────────
  targets: DEFAULT_TARGETS,
  loadTargets: async () => {
    const targets = await getTargets();
    set({ targets });
  },

  updateTargets: async (targets) => {
    await saveTargets(targets);
    set({ targets });
  },

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  init: async () => {
    await Promise.all([
      get().loadTodayLog(),
      get().loadRecipes(),
      get().loadWeight(),
      get().loadTargets(),
    ]);
  },
}));
