"use client";

import type { SetItemDef } from "@/lib/simulations/setSortingThemes";

function polygonPoints(sides: number, cx: number, cy: number, radius: number): string {
  return Array.from({ length: sides }, (_, index) => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");
}

export function SetSortingItemVisual({ item }: { item: SetItemDef }) {
  const accent = item.accent ?? "#6366f1";

  if (item.visual === "polygon" && item.sides) {
    return (
      <svg viewBox="0 0 80 80" className="size-16 sm:size-20" aria-hidden>
        <polygon
          points={polygonPoints(item.sides, 40, 40, 30)}
          fill={accent}
          fillOpacity={0.85}
          stroke="rgba(15,23,42,0.25)"
          strokeWidth={2}
        />
      </svg>
    );
  }

  if (item.visual === "angle") {
    const value = Number.parseInt(item.label, 10);
    const endX = 40 + 28 * Math.cos(((value - 90) * Math.PI) / 180);
    const endY = 40 + 28 * Math.sin(((value - 90) * Math.PI) / 180);
    return (
      <svg viewBox="0 0 80 80" className="size-16 sm:size-20" aria-hidden>
        <line x1="16" y1="56" x2="64" y2="56" stroke="#64748b" strokeWidth="3" />
        <line x1="16" y1="56" x2={endX} y2={endY} stroke={accent} strokeWidth="4" strokeLinecap="round" />
        <text x="40" y="72" textAnchor="middle" className="fill-slate-700 text-xs font-black">
          {item.label}
        </text>
      </svg>
    );
  }

  return (
    <div
      className="flex size-16 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-md sm:size-20 sm:text-3xl"
      style={{ backgroundColor: accent }}
    >
      {item.label}
    </div>
  );
}
