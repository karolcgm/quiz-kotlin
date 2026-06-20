export type PolygonAsk = "name" | "perimeter" | "vertices" | "interiorAngle";

const POLYGON_NAMES: Record<number, string> = {
  3: "trójkąt",
  4: "czworokąt",
  5: "pięciokąt",
  6: "sześciokąt",
  7: "siedmiokąt",
  8: "ośmiokąt",
  9: "dziewięciokąt",
  10: "dziesięciokąt",
  11: "jedenastokąt",
  12: "dwunastokąt",
};

export function polygonName(sides: number): string {
  return POLYGON_NAMES[sides] ?? `${sides}-kąt`;
}

export function polygonPerimeter(sides: number, sideLength: number): number {
  return sides * sideLength;
}

export function polygonInteriorAngle(sides: number): number {
  return ((sides - 2) * 180) / sides;
}

export function polygonVertices(sides: number): number {
  return sides;
}

export function polygonNameOptions(correctSides: number): string[] {
  const options = new Set<string>([polygonName(correctSides)]);
  for (const offset of [-2, -1, 1, 2]) {
    const candidate = correctSides + offset;
    if (candidate >= 3 && candidate <= 12) {
      options.add(polygonName(candidate));
    }
  }
  return [...options].sort(() => Math.random() - 0.5).slice(0, 4);
}

export interface Point2D {
  x: number;
  y: number;
}

export function regularPolygonVertices(
  sides: number,
  centerX: number,
  centerY: number,
  radius: number,
): Point2D[] {
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / sides;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

export function pointsToPath(vertices: Point2D[]): string {
  return vertices.map((vertex) => `${vertex.x},${vertex.y}`).join(" ");
}
