import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GeometryArcadeGame,
  GEOMETRY_GAMES,
  type GeometryGameKey,
} from "@/components/materials/games/geometry-arcade/GeometryArcadeGame";
import { requireRole } from "@/lib/auth/session";

export default async function TeacherGeometryGamePage({
  params,
}: {
  params: Promise<{ geometryGame: string }>;
}) {
  await requireRole("teacher");
  const { geometryGame } = await params;

  if (!(geometryGame in GEOMETRY_GAMES)) notFound();

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
          Podgląd nauczyciela · wynik nie jest zapisywany
        </span>
      </div>
      <GeometryArcadeGame
        gameKey={geometryGame as GeometryGameKey}
        rewardEnabled={false}
      />
    </div>
  );
}
