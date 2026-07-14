import Link from "next/link";
import { Maze67Game } from "@/components/materials/games/maze-67/Maze67Game";
import { requireRole } from "@/lib/auth/session";

export default async function StudentMaze67Page() {
  await requireRole("student");
  return (
    <div className="space-y-5 pb-10">
      <Link href="/uczen/materialy" className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200">← Strefa Misji</Link>
      <Maze67Game rewardEnabled />
    </div>
  );
}
