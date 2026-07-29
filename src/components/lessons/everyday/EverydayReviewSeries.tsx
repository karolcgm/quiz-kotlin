"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame, LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import { everydayReviewTasks, type EverydayReviewActivity, type EverydayReviewTask } from "@/lib/math/everyday/everydayReview";

type Feedback = "missing" | "correct" | "incorrect" | null;
interface Props { activity: EverydayReviewActivity; readOnly?: boolean; onResultChange?: (correct: boolean | null, answerLabel?: string) => void }
const normalize = (value: string) => value.trim().toLocaleLowerCase("pl-PL").replace(/\s+/g, "").replace(".", ",");

function ReviewVisual({ task }: { task: EverydayReviewTask }) {
  const visual = task.visual;
  if (visual.kind === "clock") return <div className="flex items-center justify-center gap-4">{[["START", visual.start], ["KONIEC", visual.end]].map(([label, value]) => <div key={label} className="rounded-3xl border-2 border-indigo-200 bg-white px-5 py-4 text-center shadow-sm"><p className="text-xs font-black tracking-widest text-indigo-500">{label}</p><b className="text-3xl text-indigo-950">{value}</b></div>)}<span className="text-3xl font-black text-cyan-600">→</span></div>;
  if (visual.kind === "calendar") return <div className="mx-auto max-w-sm rounded-3xl border-2 border-rose-200 bg-white p-5 text-center shadow"><div className="rounded-2xl bg-rose-500 p-3 text-2xl font-black text-white">{visual.label}</div><div className="mt-4 grid grid-cols-7 gap-1">{Array.from({ length: 28 }, (_, index) => <span key={index} className="grid aspect-square place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{index + 1}</span>)}</div></div>;
  if (visual.kind === "conversion") return <div className="flex flex-wrap items-center justify-center gap-3 text-center"><b className="rounded-2xl bg-violet-100 px-5 py-3 text-2xl text-violet-950">{visual.from}</b><div><span className="block text-sm font-black text-cyan-700">{visual.factor}</span><span className="text-3xl font-black text-cyan-600">→</span></div><b className="rounded-2xl bg-cyan-100 px-5 py-3 text-2xl text-cyan-950">{visual.to}</b></div>;
  if (visual.kind === "scale") return <div className="mx-auto max-w-xl rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center justify-between gap-4"><b className="text-2xl text-emerald-950">{visual.scale}</b><span className="rounded-xl bg-white px-4 py-2 font-black text-emerald-800">{visual.distance}</span></div><div className="mt-5 h-3 rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-500" /><div className="flex justify-between text-xs font-black text-slate-600"><span>MAPA</span><span>TEREN</span></div></div>;
  if (visual.kind === "rounding") return <div className="text-center"><p className="mb-3 font-bold text-slate-600">Zaokrąglij do: <b className="text-violet-800">{visual.place}</b></p><div className="inline-flex overflow-hidden rounded-2xl border-2 border-indigo-200 bg-white shadow-sm">{Array.from(visual.value).map((char, index) => <span key={`${char}-${index}`} className={`grid h-16 min-w-10 place-items-center text-3xl font-black ${index === visual.markedIndex ? "bg-rose-200 text-rose-950 ring-4 ring-inset ring-rose-500" : "text-indigo-950"}`}>{char}</span>)}</div></div>;
  if (visual.kind === "table") return <div className="overflow-x-auto"><table className="mx-auto min-w-[30rem] border-separate border-spacing-0 text-center"><caption className="mb-3 text-xl font-black">{visual.title}</caption><thead><tr><th className="border border-indigo-200 bg-indigo-100 p-3">Kategoria</th>{visual.columns.map((column) => <th key={column} className="border border-indigo-200 bg-indigo-100 p-3">{column}</th>)}</tr></thead><tbody>{visual.rows.map((row) => <tr key={row.label}><th className="border border-indigo-200 bg-cyan-50 p-3">{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${index}`} className="border border-indigo-200 bg-white p-3 text-xl font-black">{value}</td>)}</tr>)}</tbody></table></div>;
  if (visual.kind === "bars") {
    const maximum = Math.max(...visual.first, ...visual.second);
    return <div><h4 className="text-center text-xl font-black">{visual.title}</h4><div className="mt-4 flex h-56 items-end justify-around gap-3 border-b-4 border-l-4 border-slate-700 p-3">{visual.labels.map((label, index) => <div key={label} className="relative flex h-full flex-1 items-end justify-center gap-1"><div className="w-8 rounded-t-lg bg-violet-500" style={{ height: `${visual.first[index]! / maximum * 100}%` }} /><div className="w-8 rounded-t-lg bg-cyan-500" style={{ height: `${visual.second[index]! / maximum * 100}%` }} /><span className="absolute -bottom-9 text-xs font-black">{label}</span></div>)}</div><div className="mt-10 flex justify-center gap-5 text-sm font-black"><span className="text-violet-700">■ {visual.legends[0]}</span><span className="text-cyan-700">■ {visual.legends[1]}</span></div></div>;
  }
  if (visual.kind === "line") {
    const max = Math.max(...visual.values), min = Math.min(...visual.values), range = Math.max(1, max - min);
    const points = visual.values.map((value, index) => `${40 + index * 100},${170 - (value - min) / range * 120}`).join(" ");
    return <div><h4 className="text-center text-xl font-black">{visual.title}</h4><svg viewBox="0 0 480 220" className="mx-auto mt-3 w-full max-w-2xl" role="img" aria-label={visual.title}><line x1="30" y1="180" x2="455" y2="180" stroke="#334155" strokeWidth="4" /><line x1="30" y1="20" x2="30" y2="180" stroke="#334155" strokeWidth="4" /><polyline points={points} fill="none" stroke="#7c3aed" strokeWidth="7" />{visual.values.map((value, index) => { const x = 40 + index * 100, y = 170 - (value - min) / range * 120; return <g key={visual.labels[index]}><circle cx={x} cy={y} r="8" fill="#06b6d4" stroke="white" strokeWidth="3" /><text x={x} y={y - 14} textAnchor="middle" fontWeight="900" fontSize="15">{value}</text><text x={x} y="205" textAnchor="middle" fontWeight="800" fontSize="13">{visual.labels[index]}</text></g>})}</svg></div>;
  }
  return <div className="mx-auto grid max-w-xl grid-cols-[auto_1fr] items-center gap-5 rounded-3xl border-2 border-amber-200 bg-amber-50 p-5"><span className="text-6xl" aria-hidden>{visual.emoji}</span><ul className="grid gap-2">{visual.facts.map((fact) => <li key={fact} className="rounded-xl bg-white px-4 py-2 font-black shadow-sm">{fact}</li>)}</ul></div>;
}

export function EverydayReviewSeries({ activity, readOnly = false, onResultChange }: Props) {
  const tasks = everydayReviewTasks(activity);
  const [index, setIndex] = useState(0), [answer, setAnswer] = useState(""), [feedback, setFeedback] = useState<Feedback>(null), [mistakeMade, setMistakeMade] = useState(false);
  const task = tasks[index]!, showNavigator = readOnly || !onResultChange;
  const reset = (nextIndex: number) => { const safe = Math.max(0, Math.min(tasks.length - 1, nextIndex)); setIndex(safe); setAnswer(""); setFeedback(null); setMistakeMade(false); onResultChange?.(null) };
  const advance = (earnedPoint: boolean) => { if (index === tasks.length - 1) { onResultChange?.(earnedPoint && !mistakeMade, task.answerLabel); return } setIndex((current) => current + 1); setAnswer(""); setFeedback(null) };
  const edit = (key: string) => { setAnswer((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`.slice(0, 10)); setFeedback(null) };
  const check = () => { if (!answer) { setFeedback("missing"); return } const correct = normalize(answer) === normalize(task.answer) || (!task.choices && Number(answer.replace(",", ".")) === Number(task.answer.replace(",", "."))); setFeedback(correct ? "correct" : "incorrect"); if (correct) window.setTimeout(() => advance(true), 700); else setMistakeMade(true) };
  const heading = activity === "section-review-practical" ? "Kalendarz, jednostki, skala i zaokrąglanie" : activity === "section-review-data" ? "Tabele, diagramy i wykresy" : "Zadania łączące wiadomości";
  return <LessonTaskFrame eyebrow="Dział 3 · Powtórzenie wiadomości" heading={heading} description="Rozwiąż zadanie, zatwierdź odpowiedź i przejdź do kolejnego przykładu." questionNumber={showNavigator ? undefined : index + 1} questionCount={showNavigator ? undefined : tasks.length} data-everyday-review={activity}>
    <div className="grid gap-5">
      {showNavigator ? <LessonTaskNavigator currentIndex={index} taskCount={tasks.length} onPrevious={() => reset(index - 1)} onNext={() => reset(index + 1)} /> : null}
      <section className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 sm:p-6"><ReviewVisual task={task} /></section>
      <section className="grid gap-4 rounded-3xl border-2 border-violet-200 bg-white p-5">
        <div className="text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-violet-600">{task.title}</p><h3 className="mt-2 text-xl font-black leading-relaxed">{task.prompt}</h3></div>
        {task.choices ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{task.choices.map((choice) => <LessonTaskChoice key={choice} selected={answer === choice} disabled={readOnly || feedback === "correct"} onClick={() => { setAnswer(choice); setFeedback(null) }}>{choice}</LessonTaskChoice>)}</div> : <div className="flex items-center justify-center gap-2"><input aria-label="Odpowiedź" inputMode="none" readOnly value={answer} className="min-h-14 w-40 rounded-2xl border-2 border-violet-400 bg-violet-50 text-center text-2xl font-black outline-none" />{task.unit ? <b>{task.unit}</b> : null}</div>}
        {!readOnly ? task.choices ? <button type="button" onClick={check} disabled={feedback === "correct"} className="min-h-12 rounded-xl bg-violet-700 px-4 font-black text-white disabled:opacity-40">Zatwierdź</button> : <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={feedback === "correct"} allowSeparator label="Klawiatura do odpowiedzi" /> : null}
        <details className="rounded-2xl bg-cyan-50 p-3 text-sm font-bold text-cyan-950"><summary className="cursor-pointer font-black">Podpowiedź</summary><p className="mt-2">{task.hint}</p></details>
        {feedback === "missing" ? <p className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wynik przed zatwierdzeniem.</p> : null}
        {feedback === "correct" ? <p className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze! Odpowiedź jest poprawna.</p> : null}
        {feedback === "incorrect" ? <div className="grid gap-3 rounded-2xl bg-rose-50 p-4 text-center font-bold text-rose-950"><p>Spróbuj innym razem. Poprawny wynik to {task.answerLabel}. Dziś bez punktu.</p><button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-violet-700 px-4 font-black text-white">Przejdź dalej bez punktu</button></div> : null}
      </section>
    </div>
  </LessonTaskFrame>;
}
