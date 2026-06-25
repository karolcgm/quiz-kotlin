"use client";

import { fillPercent, type BeakerDef } from "@/lib/simulations/waterMeasures";

interface WaterBeakerVisualProps {
  beaker: BeakerDef;
  selected?: boolean;
  compareGhostCount?: number;
  onSelect?: () => void;
}

export function WaterBeakerVisual({
  beaker,
  selected = false,
  compareGhostCount,
  onSelect,
}: WaterBeakerVisualProps) {
  const percent = fillPercent(beaker.volumeMl, beaker.capacityMl);
  const waterHeight = 168 * (percent / 100);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full max-w-[180px] transition ${onSelect ? "cursor-pointer" : "cursor-default"} ${
        selected ? "scale-105" : "hover:scale-[1.02]"
      }`}
    >
      <svg viewBox="0 0 160 260" className="mx-auto w-full drop-shadow-xl" aria-hidden>
        <defs>
          <linearGradient id={`glass-${beaker.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.45)" />
          </linearGradient>
          <linearGradient id={`water-${beaker.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={beaker.liquidColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.95" />
          </linearGradient>
          <clipPath id={`clip-${beaker.id}`}>
            <rect x="36" y="48" width="88" height="168" rx="8" />
          </clipPath>
        </defs>

        {compareGhostCount !== undefined && compareGhostCount > 0 && (
          <g opacity="0.25">
            {Array.from({ length: Math.min(compareGhostCount, 8) }).map((_, index) => {
              const row = Math.floor(index / 2);
              const col = index % 2;
              return (
                <rect
                  key={index}
                  x={40 + col * 36}
                  y={200 - row * 28}
                  width={30}
                  height={24}
                  rx={4}
                  fill={beaker.liquidColor}
                />
              );
            })}
          </g>
        )}

        <rect x="28" y="40" width="104" height="184" rx="14" fill={`url(#glass-${beaker.id})`} stroke="#94a3b8" strokeWidth="2" />
        <rect x="34" y="46" width="92" height="172" rx="10" fill="rgba(248,250,252,0.35)" />

        {[0.25, 0.5, 0.75, 1].map((mark) => (
          <g key={mark}>
            <line
              x1="122"
              y1={216 - 168 * mark}
              x2="132"
              y2={216 - 168 * mark}
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <text x="138" y={220 - 168 * mark} className="fill-slate-500 text-[9px] font-bold">
              {Math.round(beaker.capacityMl * mark)}
            </text>
          </g>
        ))}

        <g clipPath={`url(#clip-${beaker.id})`}>
          <rect
            x="36"
            y={216 - waterHeight}
            width="88"
            height={waterHeight}
            fill={`url(#water-${beaker.id})`}
            className="transition-all duration-700 ease-out"
          />
          {waterHeight > 8 && (
            <path
              d={`M36 ${216 - waterHeight} Q52 ${216 - waterHeight - 6} 80 ${216 - waterHeight} T124 ${216 - waterHeight}`}
              fill={beaker.liquidColor}
              opacity="0.55"
              className="water-wave"
            />
          )}
        </g>

        <rect x="52" y="224" width="56" height="10" rx="4" fill="#cbd5e1" />
        <text x="80" y="252" textAnchor="middle" className="fill-slate-700 text-[11px] font-black">
          {beaker.capacityMl} ml
        </text>
      </svg>

      <div
        className={`mt-2 rounded-xl px-3 py-2 text-center text-sm font-bold ${
          selected ? "bg-indigo-600 text-white" : "bg-white/80 text-slate-800"
        }`}
      >
        {beaker.label}
      </div>
    </button>
  );
}
