"use client";

interface NumberBondHouseProps {
  whole: number | "?";
  partA: number | "?";
  partB: number | "?";
  highlight?: "whole" | "partA" | "partB" | null;
}

export function NumberBondHouse({ whole, partA, partB, highlight }: NumberBondHouseProps) {
  const wholeLabel = whole === "?" ? "?" : whole;
  const partALabel = partA === "?" ? "?" : partA;
  const partBLabel = partB === "?" ? "?" : partB;

  return (
    <svg viewBox="0 0 420 260" className="mx-auto w-full max-w-lg" role="img" aria-label={`Dom liczbowy ${whole}`}>
      <polygon points="210,20 360,110 60,110" fill="#fde68a" stroke="#d97706" strokeWidth="4" />
      <rect x="60" y="110" width="300" height="130" rx="16" fill="#fef3c7" stroke="#d97706" strokeWidth="4" />

      <text x="210" y="78" textAnchor="middle" className="fill-amber-950 text-4xl font-black">
        {wholeLabel}
      </text>
      <text x="210" y="98" textAnchor="middle" className="fill-amber-800 text-xs font-bold">
        całość
      </text>

      <rect
        x="80"
        y="140"
        width="120"
        height="80"
        rx="12"
        fill={highlight === "partA" ? "#c7d2fe" : "#e0e7ff"}
        stroke="#4338ca"
        strokeWidth="3"
      />
      <rect
        x="220"
        y="140"
        width="120"
        height="80"
        rx="12"
        fill={highlight === "partB" ? "#bbf7d0" : "#dcfce7"}
        stroke="#059669"
        strokeWidth="3"
      />

      <text x="140" y="188" textAnchor="middle" className="fill-indigo-900 text-3xl font-black">
        {partALabel}
      </text>
      <text x="280" y="188" textAnchor="middle" className="fill-emerald-900 text-3xl font-black">
        {partBLabel}
      </text>
      <text x="140" y="210" textAnchor="middle" className="fill-indigo-700 text-xs font-bold">
        składnik
      </text>
      <text x="280" y="210" textAnchor="middle" className="fill-emerald-700 text-xs font-bold">
        składnik
      </text>

      <text x="210" y="132" textAnchor="middle" className="fill-amber-900 text-2xl font-black">
        +
      </text>
    </svg>
  );
}
