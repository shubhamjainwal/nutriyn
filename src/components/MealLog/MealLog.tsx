"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { sumFoods, fmt } from "@/lib/utils";
import { MEAL_TYPES } from "@/lib/nutrients";
import type { MealType } from "@/types/nutrition";

const MEAL_META: Record<MealType, { icon: string; gradient: string; border: string }> = {
  Breakfast: { icon: "☀️", gradient: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.2)"  },
  Lunch:     { icon: "🥙", gradient: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.2)"  },
  Dinner:    { icon: "🌙", gradient: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.2)" },
  Snacks:    { icon: "🍎", gradient: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.2)"  },
};

export default function MealLog() {
  const { todayLog, removeFood, openSearch } = useStore();

  return (
    <div className="fade-up">
      {MEAL_TYPES.map((mt) => {
        const foods = todayLog.meals[mt] ?? [];
        const t = sumFoods(foods);
        const meta = MEAL_META[mt];
        return (
          <div
            key={mt}
            className="meal-card"
            style={{
              background: `linear-gradient(135deg, ${meta.gradient}, rgba(255,255,255,0.02))`,
              borderColor: foods.length ? meta.border : "var(--glass-border)",
            }}
          >
            {/* Header */}
            <div className={`meal-header${foods.length ? " has-foods" : ""}`}>
              <div
                className="meal-icon"
                style={{
                  background: meta.gradient,
                  border: `1px solid ${meta.border}`,
                }}
              >
                {meta.icon}
              </div>
              <div className="meal-info">
                <div className="meal-name">{mt}</div>
                {foods.length > 0 && (
                  <div className="meal-cal">
                    {Math.round(t.calories ?? 0)} kcal · P{fmt(t.protein, 0)}g · C{fmt(t.carbs, 0)}g · F{fmt(t.fat, 0)}g
                  </div>
                )}
                {foods.length === 0 && (
                  <div className="meal-cal" style={{ color: "var(--text-tertiary)" }}>Nothing logged yet</div>
                )}
              </div>
              <button className="btn-add" onClick={() => openSearch(mt)}>
                <i className="ti ti-plus" aria-hidden="true" />
                Add
              </button>
            </div>

            {/* Food items */}
            {foods.map((f) => (
              <div key={f.logId} className="food-item">
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--glass-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>
                  🥗
                </div>
                <div className="food-item-info">
                  <div className="food-item-name">{f.name}</div>
                  <div className="food-item-meta">
                    {f.servings}× serving · {Math.round((f.nutrients.calories ?? 0) * f.servings)} kcal
                    &nbsp;·&nbsp;P{fmt((f.nutrients.protein ?? 0) * f.servings, 0)}g
                    &nbsp;C{fmt((f.nutrients.carbs ?? 0) * f.servings, 0)}g
                    &nbsp;F{fmt((f.nutrients.fat ?? 0) * f.servings, 0)}g
                  </div>
                </div>
                <button
                  className="btn-icon danger"
                  onClick={() => removeFood(mt, f.logId)}
                  aria-label={`Remove ${f.name}`}
                >
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
