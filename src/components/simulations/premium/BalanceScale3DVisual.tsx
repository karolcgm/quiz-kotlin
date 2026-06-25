"use client";

import { useMemo } from "react";

interface WeightBlock {
  kg: number;
  color: string;
}

interface BalanceScale3DVisualProps {
  leftWeights: number[];
  rightWeights: number[];
  animate?: boolean;
}

const WEIGHT_COLORS: Record<number, string> = {
  1: "#6366f1",
  2: "#8b5cf6",
  5: "#22d3ee",
  10: "#34d399",
};

function total(weights: number[]) {
  return weights.reduce((sum, value) => sum + value, 0);
}

function panWeightBlocks(weights: number[]): WeightBlock[] {
  return weights.map((kg) => ({ kg, color: WEIGHT_COLORS[kg] ?? "#94a3b8" }));
}

export function BalanceScale3DVisual({
  leftWeights,
  rightWeights,
  animate = true,
}: BalanceScale3DVisualProps) {
  const leftTotal = total(leftWeights);
  const rightTotal = total(rightWeights);
  const diff = leftTotal - rightTotal;
  const tilt = Math.max(-14, Math.min(14, diff * 2.2));

  const leftBlocks = useMemo(() => panWeightBlocks(leftWeights), [leftWeights]);
  const rightBlocks = useMemo(() => panWeightBlocks(rightWeights), [rightWeights]);

  function renderStack(blocks: WeightBlock[], x: number, side: "left" | "right") {
    let y = 168;
    return blocks.map((block, index) => {
      const h = 18 + block.kg * 5;
      y -= h + 4;
      return (
        <g key={`${side}-${index}-${block.kg}`} className={animate ? "premium-weight-drop" : undefined} style={{ animationDelay: `${index * 80}ms` }}>
          <rect
            x={x - 22}
            y={y}
            width={44}
            height={h}
            rx={8}
            fill={block.color}
            stroke="rgba(15,23,42,0.25)"
            strokeWidth={2}
            opacity={0.95}
          />
          <rect x={x - 18} y={y + 3} width={8} height={h - 6} rx={3} fill="rgba(255,255,255,0.25)" />
          <text x={x} y={y + h / 2 + 5} textAnchor="middle" className="fill-white text-xs font-black">
            {block.kg} kg
          </text>
        </g>
      );
    });
  }

  return (
    <svg viewBox="0 0 480 280" className="mx-auto w-full max-w-2xl" role="img" aria-label={`Waga: lewa ${leftTotal} kg, prawa ${rightTotal} kg`}>
      <defs>
        <linearGradient id="scale-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="scale-pan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="scale-shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="240" cy="258" rx="100" ry="14" fill="#cbd5e1" opacity="0.6" />
      <rect x="222" y="188" width="36" height="72" rx="10" fill="url(#scale-base)" filter="url(#scale-shadow)" />
      <polygon points="210,188 270,188 250,160 230,160" fill="#475569" />

      <g
        className="transition-transform duration-700 ease-out"
        style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "240px 160px" }}
      >
        <rect x="60" y="152" width="360" height="14" rx="7" fill="url(#scale-base)" />
        <circle cx="240" cy="159" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="3" />

        <g>
          <line x1="110" y1="159" x2="110" y2="188" stroke="#64748b" strokeWidth="4" />
          <ellipse cx="110" cy="196" rx="58" ry="12" fill="url(#scale-pan)" stroke="#d97706" strokeWidth="2" />
          <ellipse cx="110" cy="192" rx="46" ry="8" fill="rgba(255,255,255,0.35)" />
          {renderStack(leftBlocks, 110, "left")}
          <text x="110" y="228" textAnchor="middle" className="fill-slate-700 text-sm font-black">
            {leftTotal} kg
          </text>
        </g>

        <g>
          <line x1="370" y1="159" x2="370" y2="188" stroke="#64748b" strokeWidth="4" />
          <ellipse cx="370" cy="196" rx="58" ry="12" fill="url(#scale-pan)" stroke="#d97706" strokeWidth="2" />
          <ellipse cx="370" cy="192" rx="46" ry="8" fill="rgba(255,255,255,0.35)" />
          {renderStack(rightBlocks, 370, "right")}
          <text x="370" y="228" textAnchor="middle" className="fill-slate-700 text-sm font-black">
            {rightTotal} kg
          </text>
        </g>
      </g>

      <text x="240" y="36" textAnchor="middle" className="fill-slate-600 text-sm font-bold">
        {diff === 0 ? "⚖️ Równowaga!" : diff > 0 ? "Lewa szalka cięższa" : "Prawa szalka cięższa"}
      </text>
    </svg>
  );
}

export const AVAILABLE_WEIGHTS = [1, 2, 5, 10] as const;
