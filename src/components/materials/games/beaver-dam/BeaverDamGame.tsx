"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GameDifficultyPicker } from "@/components/materials/games/GameDifficultyPicker";
import { claimBeaverDamPerfectRewardAction } from "@/lib/actions/rewards";
import type { GameDifficulty } from "@/lib/materials/gameDifficulty";
import { buildBeaverDamRounds, isCorrectBeaverDamChoice, type BeaverDamRound } from "@/lib/materials/generators/beaverDam";

type GameStatus = "intro" | "playing" | "complete";
type RewardStatus = "idle" | "saving" | "awarded" | "already-awarded" | "error";

const DIFFICULTY_DESCRIPTIONS: Record<GameDifficulty, string> = {
  easy: "Mniejsze liczby",
  medium: "Liczby do tysięcy",
  hard: "Duże liczby",
};

export function formatBeaverDamTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.trunc(seconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function BeaverDamGame({ rewardEnabled = false }: { rewardEnabled?: boolean }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("medium");
  const [rounds, setRounds] = useState<BeaverDamRound[]>([]);
  const [status, setStatus] = useState<GameStatus>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus>("idle");
  const round = rounds[roundIndex];

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const start = () => {
    setRounds(buildBeaverDamRounds(difficulty));
    setStatus("playing");
    setRoundIndex(0);
    setScore(0);
    setMistakes(0);
    setFeedback(null);
    setSelectedId(null);
    setElapsedSeconds(0);
    setFinalSeconds(0);
    setRewardStatus("idle");
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
        setFinalSeconds(elapsedSeconds);
        setStatus("complete");
        if (mistakes === 0 && rewardEnabled) {
          setRewardStatus("saving");
          void claimBeaverDamPerfectRewardAction(elapsedSeconds).then((result) => {
            if (result.error) setRewardStatus("error");
            else setRewardStatus(result.awarded ? "awarded" : "already-awarded");
          });
        }
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
        {status !== "intro" ? <div className="flex gap-2"><div className="rounded-2xl bg-slate-950/75 px-4 py-2 text-right text-white shadow-lg ring-1 ring-white/20"><p className="text-[10px] font-black uppercase text-cyan-200">Czas</p><p className="font-mono text-lg font-black tabular-nums">{formatBeaverDamTime(status === "complete" ? finalSeconds : elapsedSeconds)}</p></div><div className="rounded-2xl bg-white/90 px-4 py-2 text-right text-slate-950 shadow-lg"><p className="text-[10px] font-black uppercase text-teal-700">Tama</p><p className="text-lg font-black">{score}/{rounds.length}</p></div></div> : null}
      </div>

      {status === "intro" ? <div className="absolute inset-0 grid place-items-center bg-slate-950/35 p-5 backdrop-blur-[2px]">
        <div className="max-w-xl rounded-[2rem] border-4 border-white/80 bg-white/95 p-7 text-center shadow-2xl sm:p-10">
          <span className="text-5xl" aria-hidden>🪵</span>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Pomóż Chrupkowi naprawić tamę!</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">Na każdej kłodzie jest inne działanie. Wybierz właściwą odpowiedź i zbuduj pięć mocnych fragmentów tamy.</p>
          <GameDifficultyPicker value={difficulty} onChange={setDifficulty} descriptions={DIFFICULTY_DESCRIPTIONS} accent="cyan" />
          <button type="button" onClick={start} className="mt-6 min-h-14 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-cyan-400">Rozpocznij misję →</button>
        </div>
      </div> : null}

      {status === "playing" && round ? <div className="absolute inset-0 pt-24 sm:pt-28">
        <div className="mx-auto w-[92%] rounded-2xl border-2 border-white/70 bg-slate-950/80 px-4 py-3 text-center text-white shadow-xl backdrop-blur-md sm:ml-[4%] sm:w-[60%] sm:max-w-[720px] sm:px-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Runda {roundIndex + 1} z {rounds.length}</p>
          <h2 className="mt-1 text-lg font-black sm:text-2xl">{round.prompt}</h2>
        </div>

        <div className="beaver-log-grid mx-auto mt-5 grid w-[92%] grid-cols-1 gap-3 sm:ml-[4%] sm:w-[60%] sm:max-w-[720px] sm:grid-cols-2 sm:gap-4">
          {round.choices.map((choice, index) => {
            const selected = selectedId === choice.id;
            const stateClass = selected && feedback === "wrong" ? "beaver-log-wrong" : selected && feedback === "correct" ? "beaver-log-correct" : "";
            return <button key={choice.id} type="button" onClick={() => choose(choice.id)} disabled={feedback === "correct"} className={`beaver-answer-log group relative min-h-20 overflow-visible px-[16%] py-5 text-lg font-black text-amber-950 drop-shadow-[0_12px_12px_rgba(15,23,42,.35)] transition hover:-translate-y-1 hover:rotate-[-1deg] focus-visible:rounded-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-default sm:min-h-24 sm:text-xl ${stateClass}`} style={{ animationDelay: `${index * 120}ms` }}>
              <Image src="/materials/beaver-dam/v1/dam-answer-log-v1.png" alt="" fill sizes="(min-width: 640px) 28vw, 92vw" className="pointer-events-none object-contain" />
              <span className="relative z-10">{choice.expression}</span>
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
          <p className="mt-2 text-sm font-black text-teal-800">Czas ukończenia: {formatBeaverDamTime(finalSeconds)}</p>
          {mistakes === 0 && rewardEnabled ? <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900" aria-live="polite">{rewardStatus === "saving" ? "Zapisuję nagrodę…" : rewardStatus === "awarded" ? "🏆 Pierwsze bezbłędne zwycięstwo — zdobywasz 5 punktów!" : rewardStatus === "already-awarded" ? "Bezbłędnie! Nagroda 5 punktów za pierwszy idealny wynik została już wcześniej odebrana." : rewardStatus === "error" ? "Bezbłędnie! Nie udało się teraz zapisać punktów — spróbuj ponownie później." : "Bezbłędne ukończenie!"}</div> : null}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={start} className="min-h-12 rounded-xl bg-teal-600 px-6 font-black text-white hover:bg-teal-700">Zagraj ponownie</button>
            <button type="button" onClick={() => setStatus("intro")} className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-6 font-black text-slate-700 hover:border-slate-500">Zmień poziom</button>
          </div>
        </div>
      </div> : null}
    </div>
  </section>;
}
