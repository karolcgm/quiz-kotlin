import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GeometryArcadeGame,
} from "@/components/materials/games/geometry-arcade/GeometryArcadeGame";
import {
  GEOMETRY_GAME_KEYS,
  isGeometryGameKey,
} from "@/components/materials/games/geometry-arcade/geometryGameKeys";
import { requireRole } from "@/lib/auth/session";

export function generateStaticParams() {
  return GEOMETRY_GAME_KEYS.map((geometryGame) => ({ geometryGame }));
}

export default async function TeacherGeometryGamePage({
  params,
}: {
  params: Promise<{ geometryGame: string }>;
}) {
  await requireRole("teacher");
  const { geometryGame } = await params;

  if (!isGeometryGameKey(geometryGame)) notFound();

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/nauczyciel/materialy"
          className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200"
        >
          ← Biblioteka materiałów
        </Link>
        <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-900">
          Tryb nauczyciela · pełna gra bez punktów
        </span>
      </div>
      <GeometryArcadeGame
        gameKey={geometryGame}
        rewardEnabled={false}
      />
    </div>
  );
}
