"use client";

import { useMemo } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { useStore } from "@/store/useStore";
import { sumDay, fmt, pct } from "@/lib/utils";
import {
  VITAMIN_KEYS, MINERAL_KEYS, NUTRIENT_LABELS, NUTRIENT_UNITS,
} from "@/lib/nutrients";
import type { NutrientKey } from "@/types/nutrition";
import ProgressBar from "@/components/ui/ProgressBar";
import Donut from "@/components/ui/Donut";

const MACRO_CONFIG = [
  { key: "protein" as NutrientKey, label: "Protein",  color: "#60a5fa", track: "rgba(96,165,250,0.12)"  },
  { key: "carbs"   as NutrientKey, label: "Carbs",    color: "#fbbf24", track: "rgba(251,191,36,0.12)"  },
  { key: "fat"     as NutrientKey, label: "Fat",      color: "#f87171", track: "rgba(248,113,113,0.12)" },
  { key: "fiber"   as NutrientKey, label: "Fiber",    color: "#34d399", track: "rgba(52,211,153,0.12)"  },
];

const RADAR_KEYS: [NutrientKey, string][] = [
  ["vitA","Vit A"], ["vitC","Vit C"], ["vitD","Vit D"],
  ["iron","Iron"],  ["calcium","Ca"], ["magnesium","Mg"],
];

function NutrientRow({ nKey, value, max, color }: { nKey: NutrientKey; value: number; max: number; color: string }) {
  const p = pct(value, max);
  const low = p < 25 && value > 0;
  const over = p >= 110;
  return (
    <div className="nutrient-row">
      <div className="nutrient-row-header">
        <span className={`nutrient-name${low ? " low" : over ? " over" : ""}`}>
          {low && "⚠ "}{NUTRIENT_LABELS[nKey]}
        </span>
        <span className="nutrient-val">
          {fmt(value, nKey === "vitB12" || nKey === "vitD" || nKey === "folate" || nKey === "vitA" || nKey === "vitK" || nKey === "selenium" ? 1 : 1)}&thinsp;{NUTRIENT_UNITS[nKey]} / {max}&thinsp;{NUTRIENT_UNITS[nKey]}
        </span>
      </div>
      <ProgressBar value={value} max={max} color={over ? "#f87171" : low ? "#fbbf24" : color} height="sm" />
    </div>
  );
}

export default function Dashboard() {
  const { todayLog, targets } = useStore();
  const totals = useMemo(() => sumDay(todayLog), [todayLog]);

  const cal    = totals.calories ?? 0;
  const calMax = targets.calories;
  const rem    = Math.max(0, calMax - cal);
  const over   = cal > calMax;
  const calPct = pct(cal, calMax);

  const radarData = RADAR_KEYS.map(([k, name]) => ({
    name,
    value: Math.min(100, pct(totals[k], targets[k as keyof typeof targets] as number)),
  }));

  const hasData = Object.values(totals).some((v) => v && v > 0);

  return (
    <div className="fade-up">

      {/* ── Hero Calorie Card ─────────────────────────────────────── */}
      <div className="hero-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className={`hero-calories${over ? " hero-over" : ""}`}>
              {Math.round(cal)}
            </div>
            <div className="hero-label">kcal consumed</div>
          </div>
          <div style={{ textAlign: "right" }}>
            {over ? (
              <>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "JetBrains Mono, monospace", color: "var(--red)" }}>
                  +{Math.round(cal - calMax)}
                </div>
                <div style={{ fontSize: 11, color: "var(--red)", fontWeight: 600 }}>over goal</div>
              </>
            ) : (
              <>
                <div className="hero-remaining">{Math.round(rem)}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>kcal left</div>
              </>
            )}
          </div>
        </div>

        {/* calorie progress */}
        <div style={{ margin: "16px 0 8px" }}>
          <ProgressBar
            value={cal}
            max={calMax}
            height="lg"
            color="linear-gradient(90deg, #6ee7b7, #3b82f6)"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{Math.round(calPct)}% of {calMax} kcal goal</span>
          {over && <span className="badge badge-danger">Over target</span>}
          {!over && calPct > 80 && <span className="badge badge-warning">Almost full</span>}
          {!over && calPct <= 80 && calPct > 0 && <span className="badge badge-success">On track</span>}
        </div>
      </div>

      {/* ── Macros ───────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-section-label">Macronutrients</div>
        <div className="macro-grid">
          {MACRO_CONFIG.map(({ key, label, color, track }) => (
            <div key={key} className="macro-cell">
              <Donut value={totals[key]} max={targets[key as keyof typeof targets] as number} color={color} trackColor={track} />
              <span className="macro-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Macro stat boxes */}
        <div className="macro-value-row">
          {[
            { key: "protein" as NutrientKey, label: "Protein", unit: "g", color: "#60a5fa" },
            { key: "carbs"   as NutrientKey, label: "Carbs",   unit: "g", color: "#fbbf24" },
            { key: "fat"     as NutrientKey, label: "Fat",     unit: "g", color: "#f87171" },
            { key: "fiber"   as NutrientKey, label: "Fiber",   unit: "g", color: "#34d399" },
            { key: "sugar"   as NutrientKey, label: "Sugar",   unit: "g", color: "#c084fc" },
          ].map(({ key, label, unit, color }) => (
            <div key={key} className="macro-stat-box">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span className="macro-stat-lbl">{label}</span>
                <span className="macro-stat-num" style={{ fontSize: 16, color }}>
                  {fmt(totals[key], 1)}<span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{unit}</span>
                </span>
              </div>
              <ProgressBar value={totals[key]} max={targets[key as keyof typeof targets] as number} color={color} height="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Micro Radar ──────────────────────────────────────────── */}
      {hasData && (
        <div className="card">
          <div className="card-section-label">Micronutrient overview</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 24, bottom: 10, left: 24 }}>
              <PolarGrid />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)", fontFamily: "Inter, sans-serif" }}
              />
              <Radar
                dataKey="value"
                stroke="#6ee7b7"
                fill="#6ee7b7"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1f2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${Math.round(v)}%`, "% of target"]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Vitamins ──────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-section-label">Vitamins</div>
        {VITAMIN_KEYS.map((k) => (
          <NutrientRow
            key={k}
            nKey={k}
            value={totals[k] ?? 0}
            max={targets[k as keyof typeof targets] as number}
            color="#6366f1"
          />
        ))}
      </div>

      {/* ── Minerals ──────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-section-label">Minerals</div>
        {MINERAL_KEYS.map((k) => (
          <NutrientRow
            key={k}
            nKey={k}
            value={totals[k] ?? 0}
            max={targets[k as keyof typeof targets] as number}
            color="#2dd4bf"
          />
        ))}
      </div>

      {!hasData && (
        <div style={{ textAlign: "center", marginTop: 8, marginBottom: 24, color: "var(--text-tertiary)", fontSize: 13 }}>
          Log your first meal to see nutrients populate here.
        </div>
      )}
    </div>
  );
}
