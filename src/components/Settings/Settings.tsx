"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import type { NutrientTargets } from "@/types/nutrition";

const SECTIONS = [
  {
    title: "📊 Calorie Goal",
    fields: [
      { key: "calories" as keyof NutrientTargets, label: "Daily Calories", unit: "kcal", step: 50 },
    ],
  },
  {
    title: "🥩 Macros",
    fields: [
      { key: "protein" as keyof NutrientTargets, label: "Protein",        unit: "g",  step: 5  },
      { key: "carbs"   as keyof NutrientTargets, label: "Carbohydrates",  unit: "g",  step: 5  },
      { key: "fat"     as keyof NutrientTargets, label: "Fat",            unit: "g",  step: 5  },
      { key: "fiber"   as keyof NutrientTargets, label: "Fiber",          unit: "g",  step: 1  },
      { key: "sugar"   as keyof NutrientTargets, label: "Sugar",          unit: "g",  step: 5  },
    ],
  },
  {
    title: "💊 Vitamins",
    fields: [
      { key: "vitA"   as keyof NutrientTargets, label: "Vitamin A",      unit: "mcg", step: 50  },
      { key: "vitB1"  as keyof NutrientTargets, label: "B1 Thiamin",     unit: "mg",  step: 0.1 },
      { key: "vitB2"  as keyof NutrientTargets, label: "B2 Riboflavin",  unit: "mg",  step: 0.1 },
      { key: "vitB3"  as keyof NutrientTargets, label: "B3 Niacin",      unit: "mg",  step: 1   },
      { key: "vitB5"  as keyof NutrientTargets, label: "B5 Pantothenic", unit: "mg",  step: 0.5 },
      { key: "vitB6"  as keyof NutrientTargets, label: "Vitamin B6",     unit: "mg",  step: 0.1 },
      { key: "vitB12" as keyof NutrientTargets, label: "Vitamin B12",    unit: "mcg", step: 0.1 },
      { key: "vitC"   as keyof NutrientTargets, label: "Vitamin C",      unit: "mg",  step: 10  },
      { key: "vitD"   as keyof NutrientTargets, label: "Vitamin D",      unit: "mcg", step: 1   },
      { key: "vitE"   as keyof NutrientTargets, label: "Vitamin E",      unit: "mg",  step: 1   },
      { key: "vitK"   as keyof NutrientTargets, label: "Vitamin K",      unit: "mcg", step: 10  },
      { key: "folate" as keyof NutrientTargets, label: "Folate",         unit: "mcg", step: 50  },
    ],
  },
  {
    title: "🪨 Minerals",
    fields: [
      { key: "calcium"    as keyof NutrientTargets, label: "Calcium",    unit: "mg",  step: 50  },
      { key: "iron"       as keyof NutrientTargets, label: "Iron",       unit: "mg",  step: 1   },
      { key: "magnesium"  as keyof NutrientTargets, label: "Magnesium",  unit: "mg",  step: 10  },
      { key: "potassium"  as keyof NutrientTargets, label: "Potassium",  unit: "mg",  step: 100 },
      { key: "sodium"     as keyof NutrientTargets, label: "Sodium",     unit: "mg",  step: 100 },
      { key: "zinc"       as keyof NutrientTargets, label: "Zinc",       unit: "mg",  step: 1   },
      { key: "selenium"   as keyof NutrientTargets, label: "Selenium",   unit: "mcg", step: 5   },
      { key: "phosphorus" as keyof NutrientTargets, label: "Phosphorus", unit: "mg",  step: 50  },
      { key: "copper"     as keyof NutrientTargets, label: "Copper",     unit: "mg",  step: 0.1 },
      { key: "manganese"  as keyof NutrientTargets, label: "Manganese",  unit: "mg",  step: 0.1 },
    ],
  },
];

export default function Settings() {
  const { targets, updateTargets } = useStore();
  const [draft, setDraft] = useState<NutrientTargets>(targets);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setDraft(targets); }, [targets]);

  const set = (key: keyof NutrientTargets, val: number) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const save = async () => {
    await updateTargets(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-up">
      {/* Header info */}
      <div className="card" style={{
        background: "linear-gradient(135deg, rgba(110,231,183,0.1), rgba(96,165,250,0.06))",
        borderColor: "rgba(110,231,183,0.2)",
        marginBottom: 16,
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 24 }}>🎯</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Daily Nutrition Goals</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Set your personal targets. These are used to calculate progress on the dashboard.
              Adjust to match your diet plan or doctor's recommendation.
            </div>
          </div>
        </div>
      </div>

      {SECTIONS.map(({ title, fields }) => (
        <div key={title} className="card" style={{ marginBottom: 12 }}>
          <div className="card-section-label">{title}</div>
          {fields.map(({ key, label, unit, step }) => (
            <div key={key} className="settings-field">
              <label className="settings-label" htmlFor={`field-${key}`}>
                {label}
                <span style={{ color: "var(--text-tertiary)", fontWeight: 400, marginLeft: 4 }}>({unit})</span>
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  id={`field-${key}`}
                  type="number"
                  value={draft[key]}
                  min={0}
                  step={step}
                  onChange={(e) => set(key, +e.target.value)}
                />
                <span style={{ fontSize: 12, color: "var(--text-tertiary)", flexShrink: 0 }}>{unit}</span>
              </div>
            </div>
          ))}
        </div>
      ))}

      <button
        className="btn btn-primary btn-full"
        style={{ padding: 14, fontSize: 16, marginBottom: 8 }}
        onClick={save}
      >
        {saved ? (
          <><i className="ti ti-check" /> Saved!</>
        ) : (
          <><i className="ti ti-device-floppy" /> Save All Targets</>
        )}
      </button>

      {/* App info footer */}
      <div style={{ textAlign: "center", padding: "20px 0 10px", color: "var(--text-tertiary)", fontSize: 12 }}>
        <div>Nutriyn v0.1.0 · Data stored locally on device</div>
        <div style={{ marginTop: 4 }}>USDA FoodData Central · No account required</div>
      </div>
    </div>
  );
}
