"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import type { MaterialDefinition } from "@/types/material";

interface MaterialComposerProps {
  materials: MaterialDefinition[];
  initialSlug?: string;
}

const CHANNELS = [
  { id: "lesson", label: "Na lekcję", description: "Wspólna praca na tablicy i tabletach" },
  { id: "home", label: "Do domu", description: "Samodzielna powtórka ucznia" },
  { id: "extra", label: "Dla chętnych", description: "Dodatkowe ćwiczenie bez presji" },
] as const;

export function MaterialComposer({ materials, initialSlug }: MaterialComposerProps) {
  const fallback = materials[0]?.slug ?? "";
  const [selectedSlug, setSelectedSlug] = useState(
    materials.some((material) => material.slug === initialSlug) ? initialSlug! : fallback,
  );
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]["id"]>("lesson");
  const [title, setTitle] = useState("Misja z Chrupkiem");
  const [previewReady, setPreviewReady] = useState(false);
  const selected = useMemo(
    () => materials.find((material) => material.slug === selectedSlug),
    [materials, selectedSlug],
  );
  const selectedChannel = CHANNELS.find((item) => item.id === channel)!;

  return (
    <div className="space-y-6 pb-12">
      <header className="rounded-[2.25rem] bg-gradient-to-br from-indigo-950 via-slate-950 to-teal-900 p-7 text-white shadow-xl sm:p-9">
        <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Kompozytor materiałów · wersja MVP</p>
        <h1 className="mt-2 text-4xl font-black">Zbuduj zestaw z widocznych kart</h1>
        <p className="mt-3 max-w-3xl text-slate-200">Wybierz misję, określ sposób użycia i sprawdź gotowy podgląd. Zapisywanie oraz wysyłka do konkretnej klasy zostaną podłączone do szkolnych danych w kolejnym etapie.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="border-indigo-100">
            <label htmlFor="set-title" className="text-xs font-black uppercase tracking-[.14em] text-indigo-700">Nazwa zestawu</label>
            <input id="set-title" value={title} onChange={(event) => { setTitle(event.target.value); setPreviewReady(false); }} className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-200 px-4 text-lg font-bold text-slate-950 outline-none focus:border-indigo-500" />
          </Card>

          <section>
            <p className="text-xs font-black uppercase tracking-[.14em] text-teal-700">1. Wybierz materiał</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {materials.map((material) => {
                const isSelected = material.slug === selectedSlug;
                return (
                  <button key={material.id} type="button" onClick={() => { setSelectedSlug(material.slug); setPreviewReady(false); }} className={`overflow-hidden rounded-[1.75rem] border-4 bg-white text-left shadow-sm transition hover:-translate-y-1 ${isSelected ? "border-cyan-400 shadow-cyan-100" : "border-transparent"}`} aria-pressed={isSelected}>
                    <div className="relative aspect-[16/9]"><Image src={material.thumbnail} alt="" fill sizes="(min-width: 768px) 42vw, 100vw" className="object-cover" /></div>
                    <div className="p-4"><span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Misja animowana · {material.estimatedMinutes} min</span><h2 className="mt-1 text-xl font-black text-slate-950">{material.title}</h2><p className="mt-1 text-sm text-slate-600">{material.shortDescription}</p></div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="text-xs font-black uppercase tracking-[.14em] text-teal-700">2. Wybierz sposób użycia</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">{CHANNELS.map((item) => <button key={item.id} type="button" onClick={() => { setChannel(item.id); setPreviewReady(false); }} aria-pressed={channel === item.id} className={`rounded-2xl border-2 p-4 text-left transition ${channel === item.id ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"}`}><strong className="block text-slate-950">{item.label}</strong><span className="mt-1 block text-xs leading-relaxed text-slate-600">{item.description}</span></button>)}</div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-5 xl:h-fit">
          <Card className="overflow-hidden border-cyan-200 p-0 shadow-xl">
            {selected ? <div className="relative aspect-[16/9]"><Image src={selected.thumbnail} alt="" fill sizes="380px" className="object-cover" /></div> : null}
            <div className="p-5">
              <p className="text-xs font-black uppercase tracking-[.14em] text-teal-700">Podgląd zestawu</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{title.trim() || "Zestaw bez nazwy"}</h2>
              <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><p><strong>Materiał:</strong> {selected?.title ?? "Brak"}</p><p><strong>Tryb:</strong> {selectedChannel.label}</p><p><strong>Czas:</strong> około {selected?.estimatedMinutes ?? 0} min</p></div>
              <button type="button" onClick={() => setPreviewReady(true)} disabled={!selected || !title.trim()} className="mt-4 min-h-12 w-full rounded-xl bg-indigo-600 px-4 font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">Utwórz podgląd zestawu</button>
              {previewReady && selected ? <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Podgląd gotowy. Materiał i tryb zostały poprawnie ułożone.</div> : null}
              {selected ? <Link href={`/nauczyciel/materialy/${selected.slug}`} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-indigo-200 px-4 text-sm font-black text-indigo-800 hover:bg-indigo-50">Otwórz misję w nowej karcie</Link> : null}
              <p className="mt-4 text-xs leading-relaxed text-slate-500">Ten ekran nie udaje jeszcze wysyłki. Bezpieczne przypisanie do szkoły, klasy i uczniów wymaga migracji opisanej w planie MD.</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
