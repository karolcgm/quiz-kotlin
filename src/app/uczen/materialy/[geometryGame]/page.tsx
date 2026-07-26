import { notFound } from "next/navigation";
import { GeometryArcadeGame } from "@/components/materials/games/geometry-arcade/GeometryArcadeGame";
import {
  GEOMETRY_GAME_KEYS,
  isGeometryGameKey,
} from "@/components/materials/games/geometry-arcade/geometryGameKeys";
import { requireRole } from "@/lib/auth/session";

export function generateStaticParams() {
  return GEOMETRY_GAME_KEYS.map((geometryGame) => ({ geometryGame }));
}

export default async function GeometryGamePage({ params }: { params: Promise<{ geometryGame: string }> }) {
  await requireRole("student");
  const { geometryGame } = await params;
  if (!isGeometryGameKey(geometryGame)) notFound();
  return <GeometryArcadeGame gameKey={geometryGame} />;
}
