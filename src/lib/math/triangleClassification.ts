export type TriangleSideKind = "equilateral" | "isosceles" | "scalene";
export type TriangleAngleKind = "right" | "obtuse" | "acute";
export type TriangleClassKind = TriangleSideKind | TriangleAngleKind;

export interface TriangleVertices {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  cx: number;
  cy: number;
}

export const TRIANGLE_SIDE_LABELS: Record<TriangleSideKind, string> = {
  equilateral: "Trójkąt równoboczny",
  isosceles: "Trójkąt równoramienny",
  scalene: "Trójkąt różnoboczny",
};

export const TRIANGLE_ANGLE_LABELS: Record<TriangleAngleKind, string> = {
  right: "Trójkąt prostokątny",
  obtuse: "Trójkąt rozwartokątny",
  acute: "Trójkąt ostrokątny",
};

export const TRIANGLE_CLASS_LABELS: Record<TriangleClassKind, string> = {
  ...TRIANGLE_SIDE_LABELS,
  ...TRIANGLE_ANGLE_LABELS,
};

const LENGTH_EPS = 2.5;
const RIGHT_ANGLE_EPS = 1.5;

function equilateralVertices(centerX = 200, baseY = 220, baseWidth = 240): TriangleVertices {
  const half = baseWidth / 2;
  const height = (baseWidth * Math.sqrt(3)) / 2;
  return {
    ax: centerX - half,
    ay: baseY,
    bx: centerX + half,
    by: baseY,
    cx: centerX,
    cy: baseY - height,
  };
}

function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(bx - ax, by - ay);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function triangleSideLengths(vertices: TriangleVertices): [number, number, number] {
  const ab = distance(vertices.ax, vertices.ay, vertices.bx, vertices.by);
  const bc = distance(vertices.bx, vertices.by, vertices.cx, vertices.cy);
  const ca = distance(vertices.cx, vertices.cy, vertices.ax, vertices.ay);
  return [ab, bc, ca];
}

export function angleAtVertex(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  const v1x = ax - bx;
  const v1y = ay - by;
  const v2x = cx - bx;
  const v2y = cy - by;
  const denom = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (denom === 0) return 0;
  const cosine = clamp((v1x * v2x + v1y * v2y) / denom, -1, 1);
  return (Math.acos(cosine) * 180) / Math.PI;
}

export function triangleAngles(vertices: TriangleVertices): [number, number, number] {
  return [
    Math.round(angleAtVertex(vertices.bx, vertices.by, vertices.ax, vertices.ay, vertices.cx, vertices.cy)),
    Math.round(angleAtVertex(vertices.cx, vertices.cy, vertices.bx, vertices.by, vertices.ax, vertices.ay)),
    Math.round(angleAtVertex(vertices.ax, vertices.ay, vertices.cx, vertices.cy, vertices.bx, vertices.by)),
  ];
}

export function classifyTriangleBySides(vertices: TriangleVertices): TriangleSideKind {
  const [ab, bc, ca] = triangleSideLengths(vertices);
  const sides = [ab, bc, ca].sort((a, b) => a - b);

  if (Math.abs(sides[0] - sides[2]) < LENGTH_EPS) {
    return "equilateral";
  }
  if (
    Math.abs(sides[0] - sides[1]) < LENGTH_EPS ||
    Math.abs(sides[1] - sides[2]) < LENGTH_EPS ||
    Math.abs(sides[0] - sides[2]) < LENGTH_EPS
  ) {
    return "isosceles";
  }
  return "scalene";
}

export function classifyTriangleByAngles(vertices: TriangleVertices): TriangleAngleKind {
  const angles = triangleAngles(vertices);
  if (angles.some((angle) => Math.abs(angle - 90) <= RIGHT_ANGLE_EPS)) {
    return "right";
  }
  if (angles.some((angle) => angle > 90 + RIGHT_ANGLE_EPS)) {
    return "obtuse";
  }
  return "acute";
}

export function presetTriangle(kind: TriangleClassKind): TriangleVertices {
  switch (kind) {
    case "equilateral":
      return equilateralVertices();
    case "isosceles":
      return { ax: 100, ay: 220, bx: 300, by: 220, cx: 200, cy: 60 };
    case "scalene":
      return { ax: 70, ay: 220, bx: 320, by: 220, cx: 285, cy: 75 };
    case "right":
      return { ax: 90, ay: 220, bx: 290, by: 220, cx: 90, cy: 70 };
    case "obtuse":
      return { ax: 60, ay: 220, bx: 340, by: 220, cx: 320, cy: 190 };
    case "acute":
      return equilateralVertices(200, 220, 220);
    default:
      return equilateralVertices(200, 220, 200);
  }
}

export function formatTriangleClassLabel(kind: TriangleClassKind): string {
  return TRIANGLE_CLASS_LABELS[kind];
}

export function isTriangleClassLabel(label: string): label is TriangleClassKind {
  return label in TRIANGLE_CLASS_LABELS;
}

export const TRIANGLE_SIDE_KINDS: TriangleSideKind[] = ["equilateral", "isosceles", "scalene"];
export const TRIANGLE_ANGLE_KINDS: TriangleAngleKind[] = ["right", "obtuse", "acute"];
