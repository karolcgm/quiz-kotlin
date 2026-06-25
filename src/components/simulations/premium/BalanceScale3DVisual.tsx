"use client";

import { useMemo } from "react";
import { balanceTiltDegrees } from "@/lib/math/comparisonDisplay";

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

const LEFT_PAN = { x: 108, panTop: 206 };
const RIGHT_PAN = { x: 372, panTop: 206 };
const PIVOT = { x: 240, y: 158 };

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
  const tilt = -balanceTiltDegrees(leftTotal, rightTotal);

  const leftBlocks = useMemo(() => panWeightBlocks(leftWeights), [leftWeights]);
  const rightBlocks = useMemo(() => panWeightBlocks(rightWeights), [rightWeights]);

  function renderStack(blocks: WeightBlock[], panX: number, panTop: number, side: "left" | "right") {
    let surfaceY = panTop;
    return blocks.map((block, index) => {
      const h = 20 + block.kg * 6;
      const y = surfaceY - h;
      surfaceY = y - 5;
      return (
        <g
          key={`${side}-${index}-${block.kg}`}
          className={animate ? "premium-weight-drop" : undefined}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <rect
            x={panX - 26}
            y={y}
            width={52}
            height={h}
            rx={9}
            fill={block.color}
            stroke="rgba(15,23,42,0.3)"
            strokeWidth={2}
          />
          <rect x={panX - 22} y={y + 4} width={10} height={h - 8} rx={4} fill="rgba(255,255,255,0.28)" />
          <text x={panX} y={y + h / 2 + 6} textAnchor="middle" className="fill-white text-sm font-black">
            {block.kg} kg
          </text>
        </g>
      );
    });
  }

  function renderPan(panX: number, panTop: number, blocks: WeightBlock[], side: "left" | "right", panTotal: number) {
    const panBottom = panTop + 18;
    return (
      <g>
        <line x1={panX} y1={PIVOT.y + 8} x2={panX} y2={panTop - 4} stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx={panX} cy={panBottom} rx={62} ry={14} fill="#b45309" opacity="0.35" />
        <ellipse cx={panX} cy={panTop + 6} rx={62} ry={14} fill="url(#scale-pan)" stroke="#d97706" strokeWidth="2.5" />
        <ellipse cx={panX} cy={panTop + 2} rx={48} ry={9} fill="rgba(255,255,255,0.4)" />
        <rect x={panX - 54} y={panTop - 2} width={108} height={8} rx={4} fill="rgba(251,191,36,0.55)" />
        {renderStack(blocks, panX, panTop - 2, side)}
        <text x={panX} y={panBottom + 28} textAnchor="middle" className="fill-slate-700 text-base font-black">
          {panTotal} kg
        </text>
      </g>
    );
  }

  const diff = leftTotal - rightTotal;

  return (
    <svg viewBox="0 0 480 300" className="mx-auto w-full max-w-2xl" role="img" aria-label={`Waga: lewa ${leftTotal} kg, prawa ${rightTotal} kg`}>
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

      <ellipse cx="240" cy="278" rx="100" ry="14" fill="#cbd5e1" opacity="0.6" />
      <rect x="222" y="198" width="36" height="82" rx="10" fill="url(#scale-base)" filter="url(#scale-shadow)" />
      <polygon points="210,198 270,198 252,168 228,168" fill="#475569" />

      <g transform={`rotate(${tilt} ${PIVOT.x} ${PIVOT.y})`} className="transition-all duration-700 ease-out">
        <rect x="48" y={PIVOT.y - 6} width="384" height="14" rx="7" fill="url(#scale-base)" />
        <circle cx={PIVOT.x} cy={PIVOT.y} r="13" fill="#1e293b" stroke="#64748b" strokeWidth="3" />

        {renderPan(LEFT_PAN.x, LEFT_PAN.panTop, leftBlocks, "left", leftTotal)}
        {renderPan(RIGHT_PAN.x, RIGHT_PAN.panTop, rightBlocks, "right", rightTotal)}
      </g>

      <text x="240" y="32" textAnchor="middle" className="fill-slate-600 text-sm font-bold">
        {diff === 0 ? "Równowaga!" : diff > 0 ? "Lewa szalka opada" : "Prawa szalka opada"}
      </text>
    </svg>
  );
}

export const AVAILABLE_WEIGHTS = [1, 2, 5, 10] as const;
