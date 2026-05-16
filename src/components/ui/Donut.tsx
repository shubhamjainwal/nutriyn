"use client";

interface Props {
  value: number | undefined;
  max: number;
  color: string;
  trackColor: string;
  size?: number;
  strokeWidth?: number;
}

export default function Donut({
  value, max, color, trackColor, size = 72, strokeWidth = 8,
}: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.min(1, (value ?? 0) / max);
  const over = p >= 1;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={over ? "#f87171" : color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${p * circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.45s cubic-bezier(0.4,0,0.2,1)" }}
      />
      {/* Center value */}
      <text
        x={size / 2} y={size / 2 + 5}
        textAnchor="middle"
        fill={over ? "#f87171" : "rgba(255,255,255,0.92)"}
        fontSize={size < 70 ? 11 : 13}
        fontWeight={700}
        fontFamily='"JetBrains Mono", monospace'
      >
        {Math.round(value ?? 0)}
      </text>
    </svg>
  );
}
