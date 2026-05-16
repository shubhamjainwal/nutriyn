"use client";

import { useState, useMemo, useRef } from "react";
import { useStore } from "@/store/useStore";
import { parseNutrients, nanoid, sumFoods, fmt } from "@/lib/utils";
import type { Recipe, RecipeIngredient, UsdaSearchFood } from "@/types/nutrition";

type View = "list" | "create" | "detail";

// ─── Recipe Detail ─────────────────────────────────────────────────────────────
function RecipeDetail({
  recipe,
  onBack,
  onDelete,
}: {
  recipe: Recipe;
  onBack: () => void;
  onDelete: () => void;
}) {
  const t = recipe.nutrientTotals;
  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          <i className="ti ti-arrow-left" /> Back
        </button>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 16 }}>{recipe.name}</div>
        <button className="btn-icon danger" onClick={onDelete} aria-label="Delete recipe">
          <i className="ti ti-trash" />
        </button>
      </div>

      {/* Nutrition summary */}
      <div className="card">
        <div className="card-section-label">Total nutrition</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { k: "calories", l: "Calories", u: "kcal", c: "#6ee7b7" },
            { k: "protein",  l: "Protein",  u: "g",    c: "#60a5fa" },
            { k: "carbs",    l: "Carbs",    u: "g",    c: "#fbbf24" },
            { k: "fat",      l: "Fat",      u: "g",    c: "#f87171" },
          ].map(({ k, l, u, c }) => (
            <div key={k} className="macro-stat-box">
              <div className="macro-stat-num" style={{ fontSize: 22, color: c }}>
                {fmt(t[k] ?? 0, k === "calories" ? 0 : 1)}
              </div>
              <div className="macro-stat-lbl">{l} ({u})</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="card">
        <div className="card-section-label">{recipe.ingredients.length} Ingredients</div>
        {recipe.ingredients.map((ing) => (
          <div key={ing.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--glass-border)" }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{ing.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>
              {ing.servings}× serving&nbsp;·&nbsp;{Math.round((ing.nutrients.calories ?? 0) * ing.servings)} kcal
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recipe Creator ────────────────────────────────────────────────────────────
function RecipeCreator({ onSave, onBack }: { onSave: (r: Recipe) => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<UsdaSearchFood[]>([]);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.foods ?? []);
    } finally { setSearching(false); }
  };

  const handleQ = (val: string) => {
    setQ(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(val), 350);
  };

  const addIngredient = (food: UsdaSearchFood) => {
    const ing: RecipeIngredient = {
      id: nanoid(),
      fdcId: food.fdcId,
      name: food.description,
      servings: 1,
      nutrients: parseNutrients(food.foodNutrients),
    };
    setIngredients((prev) => [...prev, ing]);
    setAdding(false); setQ(""); setResults([]);
  };

const draftTotals = useMemo(
  () =>
    sumFoods(
      ingredients.map((i) => ({
        ...i,
        logId: i.id,
        source: "usda" as const,
        fdcId: i.fdcId ?? 0,
        servingSize: 1,
        servingSizeUnit: "serving",
      }))
    ),
  [ingredients]
);

  const save = () => {
    if (!name.trim() || ingredients.length === 0) return;
    onSave({
      id: nanoid(),
      name: name.trim(),
      ingredients,
      nutrientTotals: draftTotals,
      createdAt: Date.now(),
    });
  };

  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          <i className="ti ti-arrow-left" /> Back
        </button>
        <input
          type="text"
          placeholder="Recipe name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1 }}
          autoFocus
        />
      </div>

      {/* Ingredient list */}
      {ingredients.map((ing) => (
        <div key={ing.id} className="card card-sm" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ing.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "JetBrains Mono, monospace" }}>
              {Math.round((ing.nutrients.calories ?? 0) * ing.servings)} kcal
            </div>
          </div>
          <input
            type="number"
            value={ing.servings}
            min={0.25}
            step={0.25}
            onChange={(e) =>
              setIngredients((prev) =>
                prev.map((i) =>
                  i.id === ing.id ? { ...i, servings: Math.max(0.25, +e.target.value || 0.25) } : i
                )
              )
            }
            style={{ width: 70, textAlign: "center" }}
          />
          <button
            className="btn-icon danger"
            onClick={() => setIngredients((prev) => prev.filter((i) => i.id !== ing.id))}
            aria-label="Remove ingredient"
          >
            <i className="ti ti-x" />
          </button>
        </div>
      ))}

      {/* Add ingredient panel */}
      {adding ? (
        <div className="card">
          <input
            type="search"
            autoFocus
            placeholder="Search ingredient…"
            value={q}
            onChange={(e) => handleQ(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          {searching && (
            <div style={{ display: "flex", gap: 10, color: "var(--text-secondary)", fontSize: 13, alignItems: "center" }}>
              <div className="spinner" /> Searching…
            </div>
          )}
          {results.map((f) => (
            <div key={f.fdcId} className="food-result-row" onClick={() => addIngredient(f)}>
              <div style={{ flex: 1, fontSize: 13 }}>{f.description}</div>
              <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "JetBrains Mono, monospace" }}>
                {Math.round(f.foodNutrients?.find((n) => n.nutrientId === 1008)?.value ?? 0)} kcal
              </span>
            </div>
          ))}
          <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }}
            onClick={() => { setAdding(false); setQ(""); setResults([]); }}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="btn btn-ghost btn-full"
          style={{ padding: 13, marginBottom: 10 }}
          onClick={() => setAdding(true)}
        >
          <i className="ti ti-plus" /> Add Ingredient
        </button>
      )}

      {/* Totals preview */}
      {ingredients.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-section-label">Total</div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { k: "calories", l: "kcal", c: "#6ee7b7" },
              { k: "protein",  l: "protein", c: "#60a5fa" },
              { k: "carbs",    l: "carbs",   c: "#fbbf24" },
              { k: "fat",      l: "fat",     c: "#f87171" },
            ].map(({ k, l, c }) => (
              <div key={k}>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: c }}>
                  {fmt(draftTotals[k] ?? 0, 0)}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn btn-primary btn-full"
        style={{ padding: 14, fontSize: 15 }}
        onClick={save}
        disabled={!name.trim() || ingredients.length === 0}
      >
        <i className="ti ti-device-floppy" /> Save Recipe
      </button>
    </div>
  );
}

// ─── Main Recipes ──────────────────────────────────────────────────────────────
export default function Recipes() {
  const { recipes, saveRecipe, deleteRecipe } = useStore();
  const [view, setView] = useState<View>("list");
  const [detailId, setDetailId] = useState<string | null>(null);

  const detail = recipes.find((r) => r.id === detailId);

  if (view === "detail" && detail) {
    return (
      <RecipeDetail
        recipe={detail}
        onBack={() => setView("list")}
        onDelete={async () => { await deleteRecipe(detail.id); setView("list"); }}
      />
    );
  }

  if (view === "create") {
    return (
      <RecipeCreator
        onBack={() => setView("list")}
        onSave={async (r) => { await saveRecipe(r); setView("list"); }}
      />
    );
  }

  return (
    <div className="fade-up">
      <button
        className="btn btn-primary btn-full"
        style={{ padding: 14, fontSize: 15, marginBottom: 16 }}
        onClick={() => setView("create")}
      >
        <i className="ti ti-plus" /> New Recipe
      </button>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍳</div>
          <div className="empty-state-title">No recipes yet</div>
          <div className="empty-state-body">
            Build and save custom meals for ultra-fast logging of your go-to dishes.
          </div>
        </div>
      ) : (
        recipes.map((r) => (
          <div
            key={r.id}
            className="recipe-card"
            onClick={() => { setDetailId(r.id); setView("detail"); }}
          >
            <div className="recipe-thumb">🍳</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3, fontFamily: "JetBrains Mono, monospace" }}>
                {Math.round(r.nutrientTotals.calories ?? 0)} kcal · {r.ingredients.length} ingredients
              </div>
            </div>
            <i className="ti ti-chevron-right" style={{ color: "var(--text-tertiary)", fontSize: 18, flexShrink: 0 }} />
          </div>
        ))
      )}
    </div>
  );
}
