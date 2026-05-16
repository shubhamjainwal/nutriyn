import type { NutrientMap, LoggedFood, DayLog, UsdaFoodNutrient } from "@/types/nutrition";
import { NUTRIENT_ID_MAP } from "./nutrients";

export const todayStr = (): string =>
  new Date().toISOString().split("T")[0];

export const fmt = (n: number | undefined, dec = 1): string =>
  (+(n ?? 0)).toFixed(dec);

export const pct = (val: number | undefined, max: number): number =>
  Math.min(100, ((val ?? 0) / max) * 100);

export const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

export const nanoid = (): string =>
  Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

export const parseNutrients = (foodNutrients: UsdaFoodNutrient[] = []): NutrientMap => {
  const res: NutrientMap = {};
  foodNutrients.forEach((fn) => {
    const id = fn.nutrient?.id ?? fn.nutrientId;
    if (!id) return;
    const key = NUTRIENT_ID_MAP[id];
    if (key) res[key] = +(fn.amount ?? fn.value ?? 0);
  });
  return res;
};

export const sumFoods = (foods: LoggedFood[]): NutrientMap => {
  const t: NutrientMap = {};
  foods.forEach((item) => {
    const m = item.servings ?? 1;
    Object.entries(item.nutrients).forEach(([k, v]) => {
      if (v !== undefined) t[k] = (t[k] ?? 0) + v * m;
    });
  });
  return t;
};

export const sumDay = (log: DayLog | undefined): NutrientMap => {
  if (!log) return {};
  const t: NutrientMap = {};
  Object.values(log.meals).forEach((foods) => {
    const st = sumFoods(foods);
    Object.entries(st).forEach(([k, v]) => {
      if (v !== undefined) t[k] = (t[k] ?? 0) + v;
    });
  });
  return t;
};

export const emptyDayLog = (date: string): DayLog => ({
  date,
  meals: { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] },
  water: 0,
});
