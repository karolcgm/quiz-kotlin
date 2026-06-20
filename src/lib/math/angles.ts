export type AngleKind = "acute" | "right" | "obtuse" | "straight";

export const ANGLE_KIND_LABELS: Record<AngleKind, string> = {
  acute: "Kąt ostry (< 90°)",
  right: "Kąt prosty (90°)",
  obtuse: "Kąt rozwarty (> 90°)",
  straight: "Kąt półpełny (180°)",
};

export const ANGLE_KIND_COLORS: Record<AngleKind, string> = {
  acute: "#10b981",
  right: "#3b82f6",
  obtuse: "#f97316",
  straight: "#a855f7",
};

export function classifyAngleKind(degrees: number): AngleKind {
  const rounded = Math.round(degrees);
  if (rounded >= 179) return "straight";
  if (Math.abs(rounded - 90) <= 2) return "right";
  if (rounded > 90) return "obtuse";
  return "acute";
}

export function normalizeDegrees(value: number): number {
  return Math.max(0, Math.min(180, Math.round(value)));
}

export function verticalAnglePair(angle: number): number {
  return normalizeDegrees(angle);
}

export function adjacentSupplement(angle: number): number {
  return normalizeDegrees(180 - angle);
}
