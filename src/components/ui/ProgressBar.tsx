"use client";

import { pct } from "@/lib/utils";

interface Props {
  value: number | undefined;
  max: number;
  color?: string;
  height?: "sm" | "md" | "lg";
}

export default function ProgressBar({ value, max, color = "#6ee7b7", height = "md" }: Props) {
  const p = pct(value, max);
  const over = p >= 100;
  return (
    <div className={`progress-track progress-${height === "md" ? "" : height}`.trim()}>
      <div
        className="progress-fill"
        style={{
          width: `${p}%`,
          background: over
            ? "linear-gradient(90deg, #f87171, #ef4444)"
            : color,
        }}
      />
    </div>
  );
}
