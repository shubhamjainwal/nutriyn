"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useStore } from "@/store/useStore";
import { nanoid, todayStr } from "@/lib/utils";
import type { WeightUnit } from "@/types/nutrition";

export default function WeightTracker() {
  const { weightLog, addWeight, removeWeight } = useStore();
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");

  const log = async () => {
    const w = parseFloat(value);
    if (!w || w <= 0) return;
    await addWeight({ id: nanoid(), date: todayStr(), weight: w, unit });
    setValue("");
  };

  const last30 = weightLog.slice(-30);
  const latest = weightLog.at(-1);
  const sevenDay = weightLog.length >= 7
    ? (weightLog.slice(-7).reduce((s, e) => s + e.weight, 0) / 7).toFixed(1)
    : null;
  const change = weightLog.length >= 7
    ? (weightLog.at(-1)!.weight - weightLog.at(-7)!.weight).toFixed(1)
    : null;

  const chartData = last30.map((e) => ({
    date: e.date.slice(5),
    weight: e.weight,
  }));

  const minW = Math.min(...last30.map((e) => e.weight)) - 1;
  const maxW = Math.max(...last30.map((e) => e.weight)) + 1;

  return (
    <div className="fade-up">
      {/* Log today */}
      <div className="card">
        <div className="card-section-label">Log weight</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 72.5"
            step={0.1}
            min={1}
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === "Enter" && log()}
          />
          <select value={unit} onChange={(e) => setUnit(e.target.value as WeightUnit)} style={{ width: 76 }}>
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
          <button className="btn btn-primary" style={{ padding: "11px 18px" }} onClick={log}>
            Log
          </button>
        </div>
      </div>

      {/* Stats */}
      {latest && (
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-val" style={{ color: "var(--accent)" }}>{latest.weight}</div>
            <div className="stat-lbl">{latest.unit} · Latest</div>
          </div>
          {sevenDay && (
            <div className="stat-box">
              <div className="stat-val" style={{ color: "var(--blue)" }}>{sevenDay}</div>
              <div className="stat-lbl">7-day avg</div>
            </div>
          )}
          {change !== null && (
            <div className="stat-box">
              <div
                className="stat-val"
                style={{ color: parseFloat(change) < 0 ? "var(--accent)" : "var(--red)" }}
              >
                {parseFloat(change) > 0 ? "+" : ""}{change}
              </div>
              <div className="stat-lbl">7-day change</div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {last30.length >= 2 && (
        <div className="chart-card">
          <div className="card-section-label" style={{ paddingLeft: 8 }}>Weight trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 5, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#6ee7b7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minW, maxW]}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1f2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                itemStyle={{ color: "#6ee7b7" }}
                formatter={(v: number) => [`${v} ${unit}`, "Weight"]}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#6ee7b7"
                strokeWidth={2.5}
                fill="url(#wGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#6ee7b7", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History list */}
      {weightLog.length > 0 && (
        <div className="card">
          <div className="card-section-label">History</div>
          {[...weightLog].reverse().slice(0, 15).map((e) => (
            <div
              key={e.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 0",
                borderBottom: "1px solid var(--glass-border)",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{e.date}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "var(--accent)" }}>
                  {e.weight}&thinsp;{e.unit}
                </span>
                <button
                  className="btn-icon danger"
                  style={{ width: 28, height: 28, borderRadius: 8 }}
                  onClick={() => removeWeight(e.id)}
                  aria-label="Delete entry"
                >
                  <i className="ti ti-x" style={{ fontSize: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {weightLog.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">⚖️</div>
          <div className="empty-state-title">No entries yet</div>
          <div className="empty-state-body">Log your first weight to start seeing trends.</div>
        </div>
      )}
    </div>
  );
}
