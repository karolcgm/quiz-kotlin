import Link from "next/link";
import { SpaceCourierGame } from "@/components/materials/games/space-courier/SpaceCourierGame";
import { requireRole } from "@/lib/auth/session";

export default async function TeacherSpaceCourierPage() {
  await requireRole("teacher");
  return <div className="space-y-5 pb-10"><div className="flex flex-wrap items-center justify-between gap-3"><Link href="/nauczyciel/materialy" className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200">← Biblioteka materiałów</Link><span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-900">Podgląd nauczyciela · wynik nie jest zapisywany</span></div><SpaceCourierGame /></div>;
}
