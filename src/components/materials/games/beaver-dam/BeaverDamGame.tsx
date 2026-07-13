"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { buildBeaverDamRounds, isCorrectBeaverDamChoice } from "@/lib/materials/generators/beaverDam";

type GameStatus = "intro" | "playing" | "complete";

export function BeaverDamGame() {
  const rounds = useMemo(() => buildBeaverDamRounds(), []);
  const [status, setStatus] = useState<GameStatus>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const round = rounds[roundIndex];

  const start = () => {
    setStatus("playing");
    setRoundIndex(0);
    setScore(0);
    setMistakes(0);
    setFeedback(null);
    setSelectedId(null);
  };

  const choose = (choiceId: string) => {
    if (!round || feedback === "correct") return;
    setSelectedId(choiceId);
    if (!isCorrectBeaverDamChoice(round, choiceId)) {
      setMistakes((value) => value + 1);
      setFeedback("wrong");
      return;
    }

    setFeedback("correct");
    setScore((value) => value + 1);
    window.setTimeout(() => {
      if (roundIndex === rounds.length - 1) {
        setStatus("complete");
      } else {
        setRoundIndex((value) => value + 1);
        setSelectedId(null);
        setFeedback(null);
      }
    }, 850);
  };

  return <section className="beaver-dam-game overflow-hidden rounded-[2rem] border border-cyan-200 bg-slate-950 shadow-2xl" aria-label="Gra Chrupek i Tama Liczb">
    <div className="relative aspect-[16/9] min-h-[540px] overflow-hidden bg-slate-900">
      <Image src="/materials/beaver-dam/v1/beaver-dam-game-scene-v1.png" alt="" fill sizes="(min-width: 1280px) 1100px, 100vw" className="object-cover" priority />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/15 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-950/85 to-transparent p-4 text-white sm:p-6">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Misja animowana</p><h1 className="text-xl font-black sm:text-3xl">Chrupek i Tama Liczb</h1></div>
        {status !== "intro" ? <div className="rounded-2xl bg-white/90 px-4 py-2 text-right text-slate-950 shadow-lg"><p className="text-[10px] font-black uppercase text-teal-700">Tama</p><p className="text-lg font-black">{score}/{rounds.length}</p></div> : null}
      </div>

      {status === "intro" ? <div className="absolute inset-0 grid place-items-center bg-slate-950/35 p-5 backdrop-blur-[2px]">
        <div className="max-w-xl rounded-[2rem] border-4 border-white/80 bg-white/95 p-7 text-center shadow-2xl sm:p-10">
          <span className="text-5xl" aria-hidden>🪵</span>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Pomóż Chrupkowi naprawić tamę!</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">Na każdej kłodzie jest inne działanie. Wybierz właściwą odpowiedź i zbuduj pięć mocnych fragmentów tamy.</p>
          <button type="button" onClick={start} className="mt-6 min-h-14 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-cyan-400">Rozpocznij misję →</button>
        </div>
      </div> : null}

      {status === "playing" && round ? <div className="absolute inset-0 pt-24 sm:pt-28">
        <div className="mx-auto w-[min(92%,780px)] rounded-2xl border-2 border-white/70 bg-slate-950/80 px-4 py-3 text-center text-white shadow-xl backdrop-blur-md sm:px-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Runda {roundIndex + 1} z {rounds.length}</p>
          <h2 className="mt-1 text-lg font-black sm:text-2xl">{round.prompt}</h2>
        </div>

        <div className="beaver-log-grid mx-auto mt-5 grid w-[min(76%,800px)] grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
          {round.choices.map((choice, index) => {
            const selected = selectedId === choice.id;
            const stateClass = selected && feedback === "wrong" ? "beaver-log-wrong" : selected && feedback === "correct" ? "beaver-log-correct" : "";
            return <button key={choice.id} type="button" onClick={() => choose(choice.id)} disabled={feedback === "correct"} className={`beaver-answer-log group relative min-h-20 rounded-[45%_25%_40%_28%] border-4 border-amber-950/60 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 px-5 py-4 text-xl font-black text-amber-950 shadow-[0_12px_20px_rgba(15,23,42,.28)] transition hover:-translate-y-1 hover:rotate-[-1deg] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:cursor-default sm:text-2xl ${stateClass}`} style={{ animationDelay: `${index * 120}ms` }}>
              <span className="absolute inset-x-[12%] inset-y-[18%] rounded-xl border border-amber-900/30 bg-amber-100 shadow-inner" />
              <span className="relative">{choice.expression}</span>
            </button>;
          })}
        </div>

        <div className="mx-auto mt-4 min-h-16 w-[min(90%,720px)]" aria-live="polite">
          {feedback === "wrong" ? <p className="rounded-2xl border border-amber-200 bg-white/95 px-5 py-3 text-center font-bold text-amber-900 shadow-lg">Jeszcze nie ta kłoda. {round.hint}</p> : null}
          {feedback === "correct" ? <p className="beaver-success-message rounded-2xl border border-emerald-200 bg-emerald-50/95 px-5 py-3 text-center font-black text-emerald-900 shadow-lg">Dobrze! Kłoda pasuje — Chrupek wzmacnia tamę.</p> : null}
        </div>

        <div className="absolute bottom-4 left-4 flex gap-2 sm:bottom-6 sm:left-6" aria-label={`Postęp tamy: ${score} z ${rounds.length}`}>
          {rounds.map((item, index) => <span key={item.id} className={`h-5 w-12 rounded-full border-2 border-amber-950/50 shadow ${index < score ? "beaver-dam-piece bg-amber-400" : "bg-slate-900/45"}`} />)}
        </div>
      </div> : null}

      {status === "complete" ? <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-emerald-950/60 via-slate-950/35 to-cyan-900/55 p-5 backdrop-blur-[2px]">
        <div className="max-w-xl rounded-[2rem] border-4 border-amber-200 bg-white/95 p-8 text-center shadow-2xl">
          <div className="text-6xl" aria-hidden>🌟</div>
          <p className="mt-3 text-xs font-black uppercase tracking-[.2em] text-amber-700">Tama gotowa</p>
          <h2 className="mt-1 text-4xl font-black text-slate-950">Świetna robota!</h2>
          <p className="mt-3 text-lg text-slate-600">Poprawne kłody: <strong className="text-slate-950">{score}/{rounds.length}</strong>. Próby wymagające podpowiedzi: <strong className="text-slate-950">{mistakes}</strong>.</p>
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">Ta misja nie przyznaje rzadkiej naklejki premium. Legendarne Chrupki są zarezerwowane za cały dział lub nagrodę nauczyciela.</p>
          <button type="button" onClick={start} className="mt-6 min-h-12 rounded-xl bg-teal-600 px-6 font-black text-white hover:bg-teal-700">Zagraj ponownie</button>
        </div>
      </div> : null}
    </div>
  </section>;
}
