"use client";

import type { BasicShapeKind } from "@/lib/math/basicShapes";

interface BasicShapeIconProps {
  kind: BasicShapeKind;
  size?: number;
  fill?: string;
  className?: string;
}

export function BasicShapeIcon({ kind, size = 64, fill = "#6366f1", className }: BasicShapeIconProps) {
  const common = { fill, stroke: "#1e293b", strokeWidth: 2.5 };

  if (kind === "circle") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
        <circle cx="32" cy="32" r="24" {...common} />
      </svg>
    );
  }

  if (kind === "triangle") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
        <polygon points="32,8 56,52 8,52" {...common} strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "square") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
        <rect x="12" y="12" width="40" height="40" rx="4" {...common} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="8" y="18" width="48" height="28" rx="4" {...common} />
    </svg>
  );
}
