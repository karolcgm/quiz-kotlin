"use client";

import { useState } from "react";

const STATIONS = [
  { id: "numbers", label: "Liczby", color: "from-violet-500 to-indigo-700", prompt: "Ułóż liczby od najmniejszej do największej.", tokens: ["354", "305", "345"], answer: ["305", "345", "354"] },
  { id: "jump", label: "Oś", color: "from-cyan-400 to-blue-700", prompt: "Punkt startuje na 40. Wykonuje skok +30. Gdzie ląduje?", tokens: ["60", "70", "80"], answer: ["70"] },
  { id: "grid", label: "Grupy", color: "from-amber-400 to-orange-600", prompt: "Wskaż liczbę pól: 4 rzędy po 6.", tokens: ["10", "24", "46"], answer: ["24"] },
  { id: "rule", label: "Reguły", color: "from-emerald-400 to-teal-700", prompt: "Dotknij działania, które wykonasz najpierw: 8 + 3 × 4", tokens: ["+", "×"], answer: ["×"] },
] as const;

interface Props { seed: number; readOnly?: boolean; presentationMode?: boolean; }

export function DiagnosticStationsModel({ readOnly = false, presentationMode = false }: Props) {
  const [stationIndex, setStationIndex] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const station = STATIONS[stationIndex]!;
  const ordered = station.id === "numbers";
  const complete = placed.length === station.answer.length;
  const correct = complete && placed.every((item, index) => item === station.answer[index]);

  const choose = (token: string) => {
    if (readOnly) return;
    if (ordered) setPlaced((items) => items.includes(token) ? items.filter((item) => item !== token) : [...items, token]);
    else setSelected(token);
  };

  const reset = () => { setPlaced([]); setSelected(null); };

  return <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl sm:p-8">
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,.35),transparent_30%),radial-gradient(circle_at_90%_100%,rgba(168,85,247,.35),transparent_35%)]" />
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black tracking-[.22em] text-cyan-300">STACJE STARTOWE · KLASA V</p><h3 className="mt-1 text-2xl font-black sm:text-4xl">{presentationMode ? "Prowadź diagnozę własnym tempem" : "Wybierz stację i działaj"}</h3></div><div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur">Stacja {stationIndex + 1} / {STATIONS.length}</div></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-4">{STATIONS.map((item, index) => <button type="button" key={item.id} onClick={() => { setStationIndex(index); reset(); }} className={`touch-manipulation min-h-20 rounded-2xl bg-gradient-to-br ${item.color} p-3 text-left font-black ${index === stationIndex ? "ring-4 ring-white shadow-2xl" : "opacity-70"}`}><span className="block text-[10px] tracking-widest text-white/75">STACJA {index + 1}</span>{item.label}</button>)}</div>
    <div className={`mt-6 rounded-[1.7rem] bg-gradient-to-br ${station.color} p-[1px]`}><div className="rounded-[1.65rem] bg-slate-950/95 p-5 sm:p-8"><p className="mx-auto max-w-3xl text-center text-xl font-black leading-relaxed sm:text-3xl">{station.prompt}</p>
      {station.id === "jump" ? <div className="mx-auto mt-7 max-w-2xl"><div className="relative h-20 border-b-4 border-cyan-200"><span className="absolute bottom-0 left-[10%] text-2xl font-black">40</span><span className="absolute bottom-4 left-[48%] text-4xl text-cyan-300">➜</span><span className="absolute bottom-0 right-[10%] text-2xl font-black">?</span></div></div> : null}
      {station.id === "grid" ? <div className="mx-auto mt-7 grid max-w-sm grid-cols-6 gap-2">{Array.from({ length: 24 }).map((_, index) => <span key={index} className="aspect-square rounded-lg bg-amber-300 shadow-[inset_0_-4px_0_rgba(0,0,0,.15)]" />)}</div> : null}
      {ordered ? <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => choose(event.dataTransfer.getData("text/plain"))} className="mx-auto mt-8 flex min-h-24 max-w-3xl flex-wrap justify-center gap-3 rounded-3xl border-2 border-dashed border-white/25 p-4">{placed.map((token) => <button type="button" key={token} onClick={() => choose(token)} className="min-h-16 min-w-20 rounded-2xl bg-white px-4 text-2xl font-black text-slate-950">{token}</button>)}{placed.length === 0 ? <p className="self-center text-sm font-bold text-slate-400">Przeciągnij lub dotknij liczby w kolejności</p> : null}</div> : null}
      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-4">{station.tokens.filter((token) => !ordered || !placed.includes(token)).map((token) => <button type="button" key={token} draggable={!readOnly} onDragStart={(event) => event.dataTransfer.setData("text/plain", token)} onClick={() => choose(token)} className={`touch-manipulation min-h-20 min-w-24 rounded-3xl border-2 px-6 text-3xl font-black ${selected === token ? "border-cyan-200 bg-cyan-300 text-slate-950 ring-4 ring-cyan-300/30" : "border-white/20 bg-white/10"}`}>{token}</button>)}</div>
      {ordered ? <div className="mt-4 text-center text-xs text-slate-400">Dotyk działa na tablicy; można też przeciągać cyfry.</div> : null}
      {complete || selected ? <div className={`mx-auto mt-6 max-w-xl rounded-2xl px-5 py-4 text-center font-black ${correct || selected === station.answer[0] ? "bg-emerald-400 text-emerald-950" : "bg-amber-300 text-amber-950"}`}>{correct || selected === station.answer[0] ? "Dobra decyzja — przejdź dalej, gdy nauczyciel zdecyduje." : "Spróbuj inaczej. Podpowiedź nie zdradza rozwiązania."}</div> : null}
    </div></div>
    <div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={reset} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm font-bold hover:bg-white/10">Wyczyść stację</button>{presentationMode ? <button type="button" onClick={() => setStationIndex((current) => (current + 1) % STATIONS.length)} className="min-h-11 rounded-xl bg-white px-4 text-sm font-black text-slate-950">Następna stacja</button> : null}</div>
  </section>;
}
