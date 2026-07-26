import { notFound } from "next/navigation";
import { GeometryArcadeGame, GEOMETRY_GAMES, type GeometryGameKey } from "@/components/materials/games/geometry-arcade/GeometryArcadeGame";
import { requireRole } from "@/lib/auth/session";

export default async function GeometryGamePage({ params }: { params: Promise<{ geometryGame: string }> }) {
  await requireRole("student");
  const { geometryGame } = await params;
  if (!(geometryGame in GEOMETRY_GAMES)) notFound();
  return <GeometryArcadeGame gameKey={geometryGame as GeometryGameKey} />;
}
