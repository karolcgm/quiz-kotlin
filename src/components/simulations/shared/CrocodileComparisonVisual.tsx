"use client";

import type { ComparisonRelation } from "@/lib/math/comparisonDisplay";

type CrocodileDirection = ComparisonRelation;

interface CrocodileComparisonVisualProps {
  direction: CrocodileDirection;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
  label?: string;
}

const sizeMap = {
  sm: { viewBox: "0 0 120 80", className: "h-16 w-24", fontSize: 40 },
  md: { viewBox: "0 0 140 92", className: "h-24 w-36", fontSize: 48 },
  lg: { viewBox: "0 0 160 104", className: "h-32 w-52", fontSize: 56 },
};

/**
 * Krokodyl „zjada” większą liczbę — paszcza to znak < lub > (otwarcie w stronę większej wartości).
 * Przy "<" lewa jest mniejsza, paszcza patrzy w prawo. Przy ">" lewa jest większa, paszcza w lewo.
 */
function CrocodileSvg({ direction, fontSize }: { direction: CrocodileDirection; fontSize: number }) {
  const eyesOnLeft = direction === "<";
  const eyeX1 = eyesOnLeft ? 28 : 112;
  const eyeX2 = eyesOnLeft ? 40 : 124;
  const tailPath = eyesOnLeft
    ? "M16 58 Q4 48 8 36 Q12 28 20 32"
    : "M144 58 Q156 48 152 36 Q148 28 140 32";

  return (
    <>
      <path
        d={tailPath}
        fill="none"
        stroke="#15803d"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx={eyesOnLeft ? 24 : 136}
        cy={62}
        rx={14}
        ry={10}
        fill="#22c55e"
        stroke="#15803d"
        strokeWidth="2"
      />

      <text
        x="80"
        y={fontSize + 8}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="900"
        fill="#16a34a"
        stroke="#14532d"
        strokeWidth="1.5"
        paintOrder="stroke fill"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {direction}
      </text>

      <circle cx={eyeX1} cy={26} r="6" fill="#fff" stroke="#15803d" strokeWidth="2" />
      <circle cx={eyeX2} cy={26} r="6" fill="#fff" stroke="#15803d" strokeWidth="2" />
      <circle cx={eyeX1 + 1.5} cy={26} r="2.5" fill="#0f172a" />
      <circle cx={eyeX2 + 1.5} cy={26} r="2.5" fill="#0f172a" />
    </>
  );
}

export function CrocodileComparisonVisual({
  direction,
  size = "md",
  selected = false,
  onClick,
  label,
}: CrocodileComparisonVisualProps) {
  const dims = sizeMap[size];
  const content = (
    <svg
      viewBox={dims.viewBox}
      className={dims.className}
      role="img"
      aria-label={label ?? `Krokodyl: ${direction} — paszcza w stronę większej liczby`}
    >
      <CrocodileSvg direction={direction} fontSize={dims.fontSize} />
    </svg>
  );

  if (!onClick) {
    return (
      <div className="flex flex-col items-center gap-1">
        {content}
        {label && <span className="text-xs font-bold text-slate-600">{label}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition ${
        selected
          ? "border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200"
          : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
      }`}
      aria-pressed={selected}
    >
      {content}
      {label && <span className="text-xs font-bold text-slate-700">{label}</span>}
    </button>
  );
}
