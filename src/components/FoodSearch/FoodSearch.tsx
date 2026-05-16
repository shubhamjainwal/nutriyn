"use client";

import { useState, useRef, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { parseNutrients, nanoid, fmt } from "@/lib/utils";
import type {
  MealType, UsdaSearchFood, UsdaFoodDetail, LoggedFood, Food, Recipe,
} from "@/types/nutrition";

interface Props {
  mealType: MealType;
}

// ─── Food detail panel ────────────────────────────────────────────────────────
function FoodDetail({
  food,
  mealType,
  onBack,
  onAdded,
}: {
  food: Food;
  mealType: MealType;
  onBack: () => void;
  onAdded: () => void;
}) {
  const { addFood, closeSearch } = useStore();
  const [servings, setServings] = useState(1);

  const n = food.nutrients;
  const FACTS = [
    { key: "calories", label: "Calories", unit: "kcal", color: "#6ee7b7" },
    { key: "protein",  label: "Protein",  unit: "g",    color: "#60a5fa" },
    { key: "carbs",    label: "Carbs",    unit: "g",    color: "#fbbf24" },
    { key: "fat",      label: "Fat",      unit: "g",    color: "#f87171" },
    { key: "fiber",    label: "Fiber",    unit: "g",    color: "#34d399" },
    { key: "sugar",    label: "Sugar",    unit: "g",    color: "#c084fc" },
  ] as const;

  const handleAdd = async () => {
    const logged: LoggedFood = {
      ...food,
      logId: nanoid(),
      servings,
    };
    await addFood(mealType, logged);
    closeSearch();
  };

  return (
    <div className="detail-panel">
      {/* Header */}
      <div className="search-header">
        <button className="btn-icon" onClick={onBack} aria-label="Back">
          <i className="ti ti-arrow-left" aria-hidden="true" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {food.name}
          </div>
          {food.brand && (
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{food.brand}</div>
          )}
        </div>
      </div>

      <div className="detail-scroll">
        {/* Serving control */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-section-label">Servings</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 14 }}>
            1 serving = {food.servingSize}&thinsp;{food.servingSizeUnit}
          </div>
          <div className="serving-control">
            <button
              className="btn btn-ghost"
              style={{ width: 44, height: 44, fontSize: 20, borderRadius: "var(--radius-md)" }}
              onClick={() => setServings((s) => Math.max(0.25, +(s - 0.25).toFixed(2)))}
            >−</button>
            <input
              type="number"
              className="serving-num"
              value={servings}
              min={0.25}
              step={0.25}
              onChange={(e) => setServings(Math.max(0.25, +e.target.value || 0.25))}
            />
            <button
              className="btn btn-ghost"
              style={{ width: 44, height: 44, fontSize: 20, borderRadius: "var(--radius-md)" }}
              onClick={() => setServings((s) => +(s + 0.25).toFixed(2))}
            >+</button>
          </div>
        </div>

        {/* Nutrition facts */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-section-label">Nutrition per {servings} serving{servings !== 1 ? "s" : ""}</div>
          <div className="nutrition-facts-grid">
            {FACTS.map(({ key, label, unit, color }) => (
              <div key={key} className="nutrition-fact-box">
                <div className="nutrition-fact-val" style={{ color }}>
                  {fmt((n[key] ?? 0) * servings, key === "calories" ? 0 : 1)}
                </div>
                <div className="nutrition-fact-lbl">{label} ({unit})</div>
              </div>
            ))}
          </div>
        </div>

        {/* Source badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <span className="badge badge-success">
            <i className="ti ti-check" style={{ fontSize: 12 }} />
            {food.source === "usda" ? "USDA Verified Data" : "Custom Recipe"}
          </span>
        </div>

        <button className="btn btn-primary btn-full" style={{ padding: "14px", fontSize: 16 }} onClick={handleAdd}>
          <i className="ti ti-plus" aria-hidden="true" />
          Add to {mealType}
        </button>
      </div>
    </div>
  );
}

// ─── Main Search ──────────────────────────────────────────────────────────────
export default function FoodSearch({ mealType }: Props) {
  const { closeSearch, recipes } = useStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UsdaSearchFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Food | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setError(""); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.foods ?? []);
      if ((data.foods ?? []).length === 0) setError("No results. Try a different search term.");
    } catch {
      setError("Search failed – check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 350);
  };

  const pickUSDA = async (food: UsdaSearchFood) => {
    setFetching(true);
    try {
      const res = await fetch(`/api/food/${food.fdcId}`);
      const detail: UsdaFoodDetail = await res.json();
      setSelected({
        fdcId: food.fdcId,
        name: food.description,
        brand: food.brandOwner ?? food.brandName ?? "",
        servingSize: food.servingSize ?? 100,
        servingSizeUnit: food.servingSizeUnit ?? "g",
        nutrients: parseNutrients(detail.foodNutrients),
        source: "usda",
      });
    } catch {
      // fallback to search nutrients
      setSelected({
        fdcId: food.fdcId,
        name: food.description,
        brand: food.brandOwner ?? "",
        servingSize: 100,
        servingSizeUnit: "g",
        nutrients: parseNutrients(food.foodNutrients),
        source: "usda",
      });
    } finally {
      setFetching(false);
    }
  };

  const pickRecipe = (recipe: Recipe) => {
    setSelected({
      fdcId: 0,
      name: recipe.name,
      brand: "My Recipe",
      servingSize: 1,
      servingSizeUnit: "serving",
      nutrients: recipe.nutrientTotals,
      source: "recipe",
    });
  };

  // If food is selected, show detail panel
  if (selected) {
    return (
      <FoodDetail
        food={selected}
        mealType={mealType}
        onBack={() => setSelected(null)}
        onAdded={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="search-overlay">
      {/* Fetching overlay */}
      {fetching && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 400,
          background: "rgba(5,8,17,0.7)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 14,
        }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
          <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading nutrition data…</div>
        </div>
      )}

      {/* Header */}
      <div className="search-header">
        <button className="btn-icon" onClick={closeSearch} aria-label="Close search">
          <i className="ti ti-x" aria-hidden="true" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8 }}>
            Adding to&nbsp;<strong style={{ color: "var(--accent)" }}>{mealType}</strong>
          </div>
          <input
            type="search"
            autoFocus
            placeholder="Search USDA database…"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            style={{ padding: "9px 14px" }}
          />
        </div>
      </div>

      {/* Results area */}
      <div className="search-results">

        {/* My Recipes quick-add */}
        {!query && recipes.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 10, marginTop: 4 }}>
              My Recipes
            </div>
            {recipes.map((r) => (
              <div key={r.id} className="food-result-row" onClick={() => pickRecipe(r)}>
                <div className="food-thumb" style={{ background: "rgba(192,132,252,0.15)", border: "1px solid rgba(192,132,252,0.2)" }}>
                  🍳
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "JetBrains Mono, monospace" }}>
                    {Math.round(r.nutrientTotals.calories ?? 0)} kcal · {r.ingredients.length} ingredients
                  </div>
                </div>
                <i className="ti ti-chevron-right" style={{ color: "var(--text-tertiary)", fontSize: 16, flexShrink: 0 }} />
              </div>
            ))}
            <div className="divider" />
          </>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0", color: "var(--text-secondary)", fontSize: 13 }}>
            <div className="spinner" />
            Searching USDA database…
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ color: "var(--amber)", fontSize: 13, padding: "8px 0" }}>
            <i className="ti ti-alert-triangle" /> {error}
          </div>
        )}

        {/* USDA Results */}
        {results.length > 0 && !loading && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 10 }}>
              USDA Results
            </div>
            {results.map((food) => {
              const calVal = food.foodNutrients?.find((n) => n.nutrientId === 1008)?.value;
              return (
                <div key={food.fdcId} className="food-result-row" onClick={() => pickUSDA(food)}>
                  <div className="food-thumb" style={{ background: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.2)" }}>
                    🥦
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {food.description}
                    </div>
                    {food.brandOwner && (
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{food.brandOwner}</div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {calVal !== undefined && (
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "var(--accent)" }}>
                        {Math.round(calVal)}
                      </div>
                    )}
                    {calVal !== undefined && (
                      <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>kcal</div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Empty state */}
        {!query && !loading && results.length === 0 && recipes.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Search the USDA database</div>
            <div className="empty-state-body">
              Over 1 million verified foods. Try "chicken breast", "apple", or "brown rice".
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
