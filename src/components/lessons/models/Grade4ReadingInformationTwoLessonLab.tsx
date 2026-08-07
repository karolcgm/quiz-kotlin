"use client";

import { useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4ReadingInformationTwoActivity = "information" | "practice";

export function grade4ReadingInformationTwoActivityFromStageId(stageId: string): Grade4ReadingInformationTwoActivity {
  return stageId.endsWith("-information") ? "information" : "practice";
}

type VisualKind = "birds" | "balls" | "bus" | "schedule" | "plants" | "books";
type ReadingTask = { visual: VisualKind; prompt: string; choices: string[]; answer: string; clue: string; explanation: string };

const TASKS: ReadingTask[] = [
  { visual: "birds", prompt: "Na placu było razem 30 wróbli i gołębi. Najpierw odleciały 4 wróble, a potem wszystkie gołębie. Zostało 6 ptaków. Jakie ptaki zostały?", choices: ["6 wróbli", "6 gołębi", "4 wróble", "Nie można ustalić"], answer: "6 wróbli", clue: "Po odlocie wszystkich gołębi żaden gołąb nie mógł zostać.", explanation: "Zostały wróble, ponieważ wszystkie gołębie odleciały. Treść podaje, że pozostało ich 6." },
  { visual: "balls", prompt: "W trzech koszykach było początkowo po tyle samo piłeczek. Z żółtego przełożono 2 do niebieskiego, a potem 6 z niebieskiego do zielonego. W którym koszyku jest teraz najmniej piłeczek?", choices: ["W żółtym", "W niebieskim", "W zielonym", "W każdym tyle samo"], answer: "W niebieskim", clue: "Śledź zmiany każdego koszyka osobno, zaczynając od równej liczby.", explanation: "Żółty ma o 2 mniej niż na początku, niebieski zyskał 2 i stracił 6, więc ma o 4 mniej. Zielony zyskał 6." },
  { visual: "bus", prompt: "Na przystanku z autobusu wysiadło 7 osób, a potem wsiadły 4 osoby. Po odjeździe w autobusie było 21 osób. Ile osób było w autobusie przed przystankiem?", choices: ["18 osób", "21 osób", "24 osoby", "32 osoby"], answer: "24 osoby", clue: "Cofnij zdarzenia w odwrotnej kolejności: najpierw usuń osoby, które wsiadły, potem przywróć te, które wysiadły.", explanation: "Przed wejściem 4 osób było 17 osób, a przed wyjściem 7 osób były 24 osoby." },
  { visual: "schedule", prompt: "Pracownia jest wolna od 12:20 do 13:00. Zajęcia koła trwają 45 minut. Czy całe zajęcia zmieszczą się w tym czasie?", choices: ["Tak", "Nie", "Tylko w sobotę", "Nie można ustalić"], answer: "Nie", clue: "Odczytaj początek i koniec wolnego czasu, a potem porównaj długość przerwy z czasem zajęć.", explanation: "Od 12:20 do 13:00 jest 40 minut, a zajęcia potrzebują 45 minut." },
  { visual: "plants", prompt: "Trzy rośliny miały rano tę samą wysokość. Fasola urosła o 2 cm, słonecznik o 5 cm, a groszek o 3 cm. Która roślina jest teraz najwyższa?", choices: ["Fasola", "Słonecznik", "Groszek", "Są równe"], answer: "Słonecznik", clue: "Skoro wysokości początkowe były równe, o wyniku decyduje największy przyrost.", explanation: "Słonecznik urósł najbardziej — o 5 cm — dlatego jest teraz najwyższy." },
  { visual: "books", prompt: "Na dwóch półkach było razem 46 książek. Bibliotekarka przełożyła 8 książek z górnej półki na dolną. Ile książek jest teraz razem na obu półkach?", choices: ["38 książek", "46 książek", "54 książki", "Nie można ustalić"], answer: "46 książek", clue: "Książki zmieniły miejsce, ale żadnej nie dodano ani nie zabrano.", explanation: "Przekładanie między półkami nie zmienia łącznej liczby książek. Nadal jest ich 46." },
];

interface Props { activity: Grade4ReadingInformationTwoActivity; taskSeed?: number; questionNumber?: number; questionCount?: number; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }

function BoxesExample() {
  const box = (name: string, color: string, text: string) => <div className={`rounded-2xl p-4 text-center shadow ring-2 ${color}`}><p className="font-black">{name}</p><p className="mt-2 text-lg font-black">{text}</p></div>;
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 11" heading="Śledź zmiany i zachowaj całość" description="Gdy przedmioty są tylko przekładane, ich łączna liczba się nie zmienia. Zmienia się jednak zawartość poszczególnych miejsc.">
    <div className="space-y-5">
      <p className="rounded-3xl bg-amber-50 p-5 text-center text-xl font-black leading-relaxed text-amber-950 ring-2 ring-amber-200">Na stole stały trzy pudełka: czerwone, niebieskie i zielone. W każdym było po tyle samo kredek. Ania przełożyła 3 kredki z czerwonego do zielonego. Potem Kuba przełożył 5 kredek z zielonego do niebieskiego.</p>
      <section className="rounded-3xl bg-slate-100 p-5 ring-2 ring-slate-200">
        <p className="mb-4 text-center text-sm font-black uppercase tracking-[.16em] text-slate-700">Na początku: w każdym tyle samo</p>
        <div className="grid gap-3 sm:grid-cols-3">{box("Czerwone", "bg-rose-100 text-rose-950 ring-rose-300", "tyle samo")}{box("Niebieskie", "bg-blue-100 text-blue-950 ring-blue-300", "tyle samo")}{box("Zielone", "bg-emerald-100 text-emerald-950 ring-emerald-300", "tyle samo")}</div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white p-4 text-center shadow ring-2 ring-violet-200"><p className="font-black text-violet-900">1. Ania przekłada</p><p className="mt-2 text-lg font-black">czerwone − 3 → zielone + 3</p></div><div className="rounded-2xl bg-white p-4 text-center shadow ring-2 ring-violet-200"><p className="font-black text-violet-900">2. Kuba przekłada</p><p className="mt-2 text-lg font-black">zielone − 5 → niebieskie + 5</p></div></div>
      <section className="grid gap-3 rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200 sm:grid-cols-3">{box("Czerwone", "bg-rose-100 text-rose-950 ring-rose-300", "o 3 mniej")}{box("Niebieskie", "bg-blue-100 text-blue-950 ring-blue-300", "o 5 więcej")}{box("Zielone", "bg-emerald-100 text-emerald-950 ring-emerald-300", "o 2 mniej")}</section>
      <section className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950"><p>Razem jest tyle kredek, ile było na początku.</p><p className="mt-1 text-sm">Bez liczby początkowej nie podamy dokładnej sumy.</p></div><div className="rounded-2xl bg-violet-100 p-4 text-center font-black text-violet-950"><p>Najmniej kredek jest w czerwonym pudełku.</p><p className="mt-1 text-sm">Ubyły 3, a w zielonym ubyły łącznie tylko 2.</p></div></section>
    </div>
  </LessonTaskFrame>;
}

function TaskVisual({ kind }: { kind: VisualKind }) {
  if (kind === "birds") return <div className="flex flex-wrap justify-center gap-4 text-center"><div className="rounded-2xl bg-amber-100 p-4 ring-2 ring-amber-300"><p className="text-4xl" aria-hidden>🐦</p><p className="font-black">wróble</p></div><div className="rounded-2xl bg-blue-100 p-4 ring-2 ring-blue-300"><p className="text-4xl" aria-hidden>🕊️</p><p className="font-black">gołębie</p></div><div className="rounded-2xl bg-white p-4 ring-2 ring-slate-300"><p className="text-3xl font-black">30</p><p className="font-bold">ptaków razem</p></div></div>;
  if (kind === "balls") return <div className="grid grid-cols-3 gap-3">{[["Żółty", "−2", "bg-amber-200"], ["Niebieski", "+2, potem −6", "bg-blue-200"], ["Zielony", "+6", "bg-emerald-200"]].map(([name, change, color]) => <div key={name} className={`rounded-2xl p-3 text-center shadow ${color}`}><p className="font-black">{name}</p><p className="mt-2 font-black">{change}</p></div>)}</div>;
  if (kind === "bus") return <div className="flex flex-wrap items-center justify-center gap-3 text-center"><div className="rounded-2xl bg-blue-600 px-6 py-5 text-3xl font-black text-white">🚌 ?</div><span className="font-black text-rose-700">− 7</span><span className="font-black text-emerald-700">+ 4</span><div className="rounded-2xl bg-violet-100 px-6 py-5 font-black text-violet-950">po przystanku: 21</div></div>;
  if (kind === "schedule") return <div className="mx-auto max-w-lg overflow-hidden rounded-2xl bg-white shadow ring-2 ring-violet-200"><div className="grid grid-cols-2 bg-violet-700 p-3 text-center font-black text-white"><span>Pracownia wolna</span><span>Czas zajęć</span></div><div className="grid grid-cols-2 p-4 text-center text-2xl font-black"><span>12:20–13:00</span><span>45 min</span></div></div>;
  if (kind === "plants") return <div className="flex items-end justify-center gap-3">{[["Fasola", 2], ["Słonecznik", 5], ["Groszek", 3]].map(([name, growth]) => <div key={name} className="w-28 rounded-t-2xl bg-emerald-200 p-3 text-center ring-2 ring-emerald-400" style={{ minHeight: `${80 + Number(growth) * 12}px` }}><p className="text-3xl" aria-hidden>🌱</p><p className="font-black">{name}</p><p className="font-bold">+{growth} cm</p></div>)}</div>;
  return <div className="flex items-center justify-center gap-4"><div className="rounded-2xl bg-amber-100 p-5 text-center ring-2 ring-amber-300"><p className="text-3xl" aria-hidden>📚</p><p className="font-black">Górna półka</p></div><span className="text-2xl font-black text-violet-700">8 książek →</span><div className="rounded-2xl bg-cyan-100 p-5 text-center ring-2 ring-cyan-300"><p className="text-3xl" aria-hidden>📚</p><p className="font-black">Dolna półka</p></div></div>;
}

function PracticeSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: ReadingTask; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const choose = (choice: string) => { if (locked) return; setSelected(choice); setFeedback(null); onResultChange?.(null); };
  const check = () => { if (!selected) { setFeedback("missing"); return; } const correct = selected === task.answer; setFeedback(correct ? "correct" : "incorrect"); onResultChange?.(correct, selected); };
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 11" heading="Połącz informacje i wywnioskuj" description="Śledź kolejność zdarzeń. Zwróć uwagę, co się zmienia, a co pozostaje bez zmian." questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4"><section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200"><TaskVisual kind={task.visual} /></section><p className="rounded-3xl bg-amber-50 p-5 text-center text-xl font-black leading-relaxed text-amber-950 ring-2 ring-amber-200">{task.prompt}</p><p className="rounded-2xl bg-slate-100 p-3 text-center font-bold text-slate-700"><span className="font-black text-slate-950">Wskazówka:</span> {task.clue}</p><div className="grid gap-3 sm:grid-cols-2">{task.choices.map((choice) => <LessonTaskChoice key={choice} selected={selected === choice} disabled={locked} onClick={() => choose(choice)}>{choice}</LessonTaskChoice>)}</div>{!readOnly ? <button type="button" onClick={check} disabled={locked} className="min-h-12 w-full rounded-2xl bg-violet-700 px-4 font-black text-white shadow disabled:opacity-40">Sprawdź odpowiedź</button> : null}{feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Wybierz jedną odpowiedź.</p> : null}{feedback === "correct" ? <div role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950"><p>Brawo! Poprawnie łączysz informacje.</p><p className="mt-1">{task.explanation}</p></div> : null}{feedback === "incorrect" ? <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawna odpowiedź to: {task.answer}. Dziś bez punktu.</p><p className="mt-1">{task.explanation}</p></div> : null}</div>
  </LessonTaskFrame>;
}

export function Grade4ReadingInformationTwoLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = TASKS.length, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <BoxesExample />;
  const task = TASKS[Math.max(0, (questionNumber - 1) % TASKS.length)] ?? TASKS[Math.abs(taskSeed) % TASKS.length]!;
  return <PracticeSlide key={`${questionNumber}-${task.prompt}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
