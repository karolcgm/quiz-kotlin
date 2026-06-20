export const BASIC_SHAPE_KINDS = ["circle", "triangle", "square", "rectangle"] as const;

export type BasicShapeKind = (typeof BASIC_SHAPE_KINDS)[number];

export const SHAPE_LABELS: Record<BasicShapeKind, string> = {
  circle: "koło",
  triangle: "trójkąt",
  square: "kwadrat",
  rectangle: "prostokąt",
};

export const SHAPE_BIN_COLORS: Record<BasicShapeKind, { bg: string; border: string; text: string }> = {
  circle: { bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-900" },
  triangle: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-900" },
  square: { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-900" },
  rectangle: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-900" },
};

export const SHAPE_FILL_COLORS: Record<BasicShapeKind, string> = {
  circle: "#38bdf8",
  triangle: "#34d399",
  square: "#a78bfa",
  rectangle: "#fbbf24",
};

export function randomBasicShape(): BasicShapeKind {
  return BASIC_SHAPE_KINDS[Math.floor(Math.random() * BASIC_SHAPE_KINDS.length)];
}

export function createMixedShapePool(count = 8): { id: string; kind: BasicShapeKind }[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `shape-${index}-${Math.random().toString(36).slice(2, 7)}`,
    kind: randomBasicShape(),
  }));
}
