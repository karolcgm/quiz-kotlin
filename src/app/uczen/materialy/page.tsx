import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MATERIAL_CATALOG } from "@/data/materials/catalog";
import { requireRole } from "@/lib/auth/session";

export default async function StudentMaterialsPage() {
  await requireRole("student");
  const materials = MATERIAL_CATALOG.filter((material) => material.published && material.studentCanChoose);

  return <div className="space-y-7 pb-12">
    <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-700 via-cyan-700 to-indigo-900 p-7 text-white shadow-2xl sm:p-10">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_280px]">
        <div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Strefa Misji</p><h1 className="mt-2 text-4xl font-black sm:text-6xl">Wybierz przygodę z Chrupkiem</h1><p className="mt-4 max-w-2xl text-lg text-cyan-50/90">Tutaj naprawdę rozwiązujesz zadania, budujesz wynik i możesz wrócić do ćwiczenia w domu. Każda misja pokazuje, jaką umiejętność rozwijasz.</p></div>
        <Image src="/materials/characters/chrupek/chrupek-character-anchor-v1.png" alt="Chrupek, bohater LekcjaLab" width={1692} height={930} className="mx-auto h-56 w-full rounded-3xl object-cover object-[18%_50%] shadow-xl" priority />
      </div>
    </section>

    <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-teal-700">Możesz wybrać samodzielnie</p><h2 className="mt-1 text-3xl font-black text-slate-950">Misje animowane</h2></div><span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-800">Bez limitu powtórek</span></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">{materials.map((material) => <Card key={material.id} className="group overflow-hidden border-cyan-100 p-0 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"><div className="relative aspect-[16/9] overflow-hidden"><Image src={material.thumbnail} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-5 pt-16 text-white"><span className="rounded-full bg-cyan-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-950">Misja animowana</span><h3 className="mt-2 text-2xl font-black">{material.title}</h3></div></div><div className="p-5"><p className="leading-relaxed text-slate-600">{material.shortDescription}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600"><span className="rounded-full bg-slate-100 px-3 py-1">⏱ {material.estimatedMinutes} min</span><span className="rounded-full bg-slate-100 px-3 py-1">Klasa {material.grades.join(", ")}</span><span className="rounded-full bg-slate-100 px-3 py-1">{material.sectionId === "M5-S3" ? "Ułamki zwykłe" : material.sectionId === "M5-S2" ? "Własności liczb" : "Liczby i działania"}</span></div><Link href={`/uczen/materialy/${material.slug}`} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 font-black text-white shadow transition hover:from-teal-700 hover:to-cyan-700">Rozpocznij misję →</Link></div></Card>)}</div>
    </section>
  </div>;
}
