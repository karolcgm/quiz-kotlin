export const GEOMETRY_GAME_KEYS = [
  "laser-lab",
  "polygon-forge",
  "triangle-shipyard",
  "quadrilateral-arena",
  "symmetry-temple",
  "geometry-inspector",
] as const;

export type GeometryGameKey = (typeof GEOMETRY_GAME_KEYS)[number];

export function isGeometryGameKey(value: string): value is GeometryGameKey {
  return (GEOMETRY_GAME_KEYS as readonly string[]).includes(value);
}
