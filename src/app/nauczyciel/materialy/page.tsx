import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MATERIAL_CATALOG } from "@/data/materials/catalog";
import { requireRole } from "@/lib/auth/session";

export default async function TeacherMaterialsPage() {
  await requireRole("teacher");

  return <div className="space-y-7 pb-12">
    <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-teal-800 p-7 text-white shadow-2xl sm:p-9">
      <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-200">Nowy dział · Materiały</p>
      <h1 className="mt-2 text-4xl font-black sm:text-5xl">Znajdź po umiejętności. Zobacz miniaturę. Ułóż zestaw.</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-200">Biblioteka łączy lekcje, ćwiczenia i gry w jednym miejscu. Pięć interaktywnych misji Chrupka rozwija działania, własności liczb naturalnych i rozumienie ułamków.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">Klasa 5</span>
        <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">Liczby i działania</span>
        <span className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-black text-cyan-950">Misje animowane</span>
      </div>
    </section>

    <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
      <Card className="h-fit border-indigo-100"><p className="text-xs font-black uppercase tracking-[.16em] text-indigo-700">Filtry umiejętności</p><div className="mt-4 space-y-2">{["Dodawanie i odejmowanie", "Mnożenie i dzielenie", "Kolejność działań", "Własności liczb", "NWD i NWW", "Ułamki zwykłe"].map((label, index) => <button key={label} type="button" className={`w-full rounded-xl px-3 py-3 text-left text-sm font-bold ${index === 0 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{label}</button>)}</div><Link href="/nauczyciel/lekcje" className="mt-5 block text-sm font-black text-indigo-700">Przejdź do dotychczasowych lekcji →</Link></Card>
      <section>
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-teal-700">{MATERIAL_CATALOG.length} materiały</p><h2 className="text-3xl font-black text-slate-950">Biblioteka wizualna</h2></div>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">{MATERIAL_CATALOG.map((material) => (
          <Card key={material.id} className="group overflow-hidden border-cyan-100 p-0">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image src={material.thumbnail} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute left-4 top-4 rounded-full bg-cyan-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-950">Misja animowana</div>
            </div>
            <div className="p-5">
              <h3 className="text-2xl font-black text-slate-950">{material.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{material.shortDescription}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600"><span className="rounded-full bg-slate-100 px-3 py-1">{material.estimatedMinutes} min</span><span className="rounded-full bg-slate-100 px-3 py-1">{material.skillIds.length} umiejętności</span><span className="rounded-full bg-slate-100 px-3 py-1">Tablet + tablica</span></div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Link href={`/nauczyciel/materialy/${material.slug}`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-600 px-4 font-black text-white hover:bg-indigo-700">Otwórz podgląd</Link>
                <Link href={`/nauczyciel/materialy/kompozytor?material=${material.slug}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-indigo-200 px-4 font-black text-indigo-800 hover:bg-indigo-50">+ Dodaj do zestawu</Link>
              </div>
            </div>
          </Card>
        ))}</div>
      </section>
    </div>
  </div>;
}
