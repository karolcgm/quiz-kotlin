"use client";

import { balanceTiltDegrees } from "@/lib/math/comparisonDisplay";

interface BalanceScaleVisualProps {
  left: number;
  right: number;
  leftLabel?: string;
  rightLabel?: string;
}

function panWeightHeight(value: number) {
  return 24 + Math.min(Math.max(value, 0), 999) / 999 * 56;
}

export function BalanceScaleVisual({ left, right, leftLabel, rightLabel }: BalanceScaleVisualProps) {
  const tilt = balanceTiltDegrees(left, right);
  const leftHeight = panWeightHeight(left);
  const rightHeight = panWeightHeight(right);

  return (
    <svg viewBox="0 0 420 260" className="mx-auto w-full max-w-xl" role="img" aria-label={`Waga: ${left} i ${right}`}>
      <defs>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="panGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      <rect x="198" y="198" width="24" height="52" rx="6" fill="#475569" />
      <ellipse cx="210" cy="252" rx="58" ry="10" fill="#cbd5e1" />

      <g transform={`rotate(${tilt} 210 118)`}>
        <rect x="40" y="112" width="340" height="12" rx="6" fill="url(#beamGrad)" />
        <circle cx="210" cy="118" r="10" fill="#334155" stroke="#1e293b" strokeWidth="2" />

        <line x1="90" y1="118" x2="90" y2="148" stroke="#64748b" strokeWidth="3" />
        <ellipse cx="90" cy="156" rx="52" ry="10" fill="url(#panGrad)" stroke="#d97706" strokeWidth="2" />
        <rect
          x="62"
          y={156 - leftHeight}
          width="56"
          height={leftHeight}
          rx="8"
          fill={left >= right ? "#6366f1" : "#a5b4fc"}
          stroke="#4338ca"
          strokeWidth="2"
        />
        <text x="90" y={156 - leftHeight - 8} textAnchor="middle" className="fill-slate-800 text-xl font-black">
          {left}
        </text>
        {leftLabel && (
          <text x="90" y="178" textAnchor="middle" className="fill-amber-900 text-[10px] font-bold">
            {leftLabel}
          </text>
        )}

        <line x1="330" y1="118" x2="330" y2="148" stroke="#64748b" strokeWidth="3" />
        <ellipse cx="330" cy="156" rx="52" ry="10" fill="url(#panGrad)" stroke="#d97706" strokeWidth="2" />
        <rect
          x="302"
          y={156 - rightHeight}
          width="56"
          height={rightHeight}
          rx="8"
          fill={right >= left ? "#10b981" : "#6ee7b7"}
          stroke="#059669"
          strokeWidth="2"
        />
        <text x="330" y={156 - rightHeight - 8} textAnchor="middle" className="fill-slate-800 text-xl font-black">
          {right}
        </text>
        {rightLabel && (
          <text x="330" y="178" textAnchor="middle" className="fill-amber-900 text-[10px] font-bold">
            {rightLabel}
          </text>
        )}
      </g>

      <text x="210" y="24" textAnchor="middle" className="fill-slate-600 text-xs font-bold">
        {tilt === 0 ? "Waga jest równoważna" : tilt > 0 ? "Prawa szalka opada" : "Lewa szalka opada"}
      </text>
    </svg>
  );
}
