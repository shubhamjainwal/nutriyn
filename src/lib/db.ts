import Dexie, { type Table } from "dexie";
import type { DayLog, Recipe, WeightEntry, NutrientTargets } from "@/types/nutrition";
import { DEFAULT_TARGETS } from "./nutrients";

interface SettingsRow {
  key: string;
  value: unknown;
}

export class NutriDB extends Dexie {
  logs!: Table<DayLog, string>;
  recipes!: Table<Recipe, string>;
  weight!: Table<WeightEntry, string>;
  settings!: Table<SettingsRow, string>;

  constructor() {
    super("NutriTrackDB");
    this.version(1).stores({
      logs: "date",
      recipes: "id, createdAt",
      weight: "id, date",
      settings: "key",
    });
  }
}

export const db = new NutriDB();

// ─── Settings helpers ─────────────────────────────────────────────────────────
export const getTargets = async (): Promise<NutrientTargets> => {
  const row = await db.settings.get("targets");
  return (row?.value as NutrientTargets) ?? DEFAULT_TARGETS;
};

export const saveTargets = async (targets: NutrientTargets): Promise<void> => {
  await db.settings.put({ key: "targets", value: targets });
};

// ─── Day log helpers ──────────────────────────────────────────────────────────
export const getLog = async (date: string): Promise<DayLog | undefined> =>
  db.logs.get(date);

export const saveLog = async (log: DayLog): Promise<void> => {
  await db.logs.put(log);
};

// ─── Recipe helpers ───────────────────────────────────────────────────────────
export const getAllRecipes = async (): Promise<Recipe[]> =>
  db.recipes.orderBy("createdAt").reverse().toArray();

export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  await db.recipes.put(recipe);
};

export const deleteRecipe = async (id: string): Promise<void> => {
  await db.recipes.delete(id);
};

// ─── Weight helpers ───────────────────────────────────────────────────────────
export const getAllWeight = async (): Promise<WeightEntry[]> =>
  db.weight.orderBy("date").toArray();

export const saveWeight = async (entry: WeightEntry): Promise<void> => {
  await db.weight.put(entry);
};

export const deleteWeight = async (id: string): Promise<void> => {
  await db.weight.delete(id);
};
