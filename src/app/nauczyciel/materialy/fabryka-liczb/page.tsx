import Link from "next/link";
import { NumberFactoryGame } from "@/components/materials/games/number-factory/NumberFactoryGame";
import { requireRole } from "@/lib/auth/session";

export default async function TeacherNumberFactoryPage() {
  await requireRole("teacher");
  return <div className="space-y-5 pb-10"><div className="flex flex-wrap items-center justify-between gap-3"><Link href="/nauczyciel/materialy" className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200">← Biblioteka materiałów</Link><span className="rounded-full bg-cyan-100 px-4 py-2 text-xs font-black text-cyan-900">Podgląd nauczyciela</span></div><NumberFactoryGame /></div>;
}
