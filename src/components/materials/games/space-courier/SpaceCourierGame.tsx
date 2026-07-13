"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { claimVisualGamePerfectRewardAction } from "@/lib/actions/rewards";
import { formatMissionTime } from "@/lib/materials/gameTime";
import { buildSpaceCourierRounds } from "@/lib/materials/generators/spaceCourier";

type GameStatus = "intro" | "playing" | "complete";
type RewardStatus = "idle" | "saving" | "awarded" | "already-awarded" | "error";

export function SpaceCourierGame({ rewardEnabled = false }: { rewardEnabled?: boolean }) {
  const rounds = useMemo(() => buildSpaceCourierRounds(), []);
  const [status, setStatus] = useState<GameStatus>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus>("idle");
  const round = rounds[roundIndex];

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const start = () => {
    setStatus("playing");
    setRoundIndex(0);
    setSelected([]);
    setScore(0);
    setMistakes(0);
    setElapsedSeconds(0);
    setFinalSeconds(0);
    setFeedback(null);
    setRewardStatus("idle");
  };

  const finish = (completionTime: number, finalMistakes: number) => {
    setFinalSeconds(completionTime);
    setStatus("complete");
    if (finalMistakes === 0 && rewardEnabled) {
      setRewardStatus("saving");
      void claimVisualGamePerfectRewardAction("space-courier", completionTime).then((result) => {
        if (result.error) setRewardStatus("error");
        else setRewardStatus(result.awarded ? "awarded" : "already-awarded");
      });
    }
  };

  const choose = (stepId: string) => {
    if (!round || feedback === "correct" || selected.includes(stepId)) return;
    const step = round.steps.find((item) => item.id === stepId);
    const expectedOrder = selected.length + 1;
    if (!step || step.order !== expectedOrder) {
      setMistakes((value) => value + 1);
      setSelected([]);
      setFeedback("wrong");
      return;
    }

    const nextSelected = [...selected, stepId];
    setSelected(nextSelected);
    setFeedback(null);
    if (nextSelected.length !== 3) return;

    setScore((value) => value + 1);
    setFeedback("correct");
    window.setTimeout(() => {
      if (roundIndex === rounds.length - 1) finish(elapsedSeconds, mistakes);
      else {
        setRoundIndex((value) => value + 1);
        setSelected([]);
        setFeedback(null);
      }
    }, 750);
  };

  return <section className="overflow-hidden rounded-[2rem] border border-violet-200 bg-slate-950 shadow-2xl" aria-label="Gra Kosmiczny Kurier">
    <div className="relative aspect-[16/9] min-h-[560px] overflow-hidden bg-indigo-950">
      <Image src="/materials/space-courier/v1/space-courier-scene-v1.png" alt="" fill sizes="(min-width: 1280px) 1100px, 100vw" className="object-cover" priority />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-slate-950/10" />
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-950/90 to-transparent p-4 text-white sm:p-6">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Misja kolejności działań</p><h1 className="text-xl font-black sm:text-3xl">Kosmiczny Kurier</h1></div>
        {status !== "intro" ? <div className="flex gap-2"><div className="rounded-2xl bg-slate-950/75 px-3 py-2 text-right ring-1 ring-white/20"><p className="text-[9px] font-black uppercase text-cyan-200">Czas</p><p className="font-mono text-lg font-black">{formatMissionTime(status === "complete" ? finalSeconds : elapsedSeconds)}</p></div><div className="rounded-2xl bg-cyan-100/95 px-3 py-2 text-right text-indigo-950"><p className="text-[9px] font-black uppercase">Dostawy</p><p className="text-lg font-black">{score}/{rounds.length}</p></div></div> : null}
      </header>

      {status === "intro" ? <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/35 p-5 backdrop-blur-[2px]"><div className="max-w-xl rounded-[2rem] border-4 border-cyan-100 bg-white/95 p-8 text-center shadow-2xl"><span className="text-6xl">🚀</span><h2 className="mt-3 text-3xl font-black text-slate-950">Wyznacz bezpieczną trasę!</h2><p className="mt-3 leading-relaxed text-slate-600">Klikaj etapy obliczenia w prawidłowej kolejności. Trzy dobre punkty tworzą trasę do planety, a jeden zły krok jest kosmiczną pułapką.</p><button type="button" onClick={start} className="mt-6 min-h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 text-lg font-black text-white shadow-xl">Rozpocznij lot →</button></div></div> : null}

      {status === "playing" && round ? <div className="absolute inset-0 z-10 pt-24 sm:pt-28">
        <div className="ml-[4%] w-[64%] max-w-[760px] rounded-2xl border border-white/30 bg-slate-950/72 p-3 text-center text-white shadow-xl backdrop-blur-md"><p className="text-[10px] font-black uppercase tracking-[.16em] text-cyan-200">Dostawa {roundIndex + 1}/{rounds.length} · wybierz krok {selected.length + 1}</p><h2 className="mt-1 font-mono text-xl font-black sm:text-3xl">{round.expression}</h2></div>

        <div className="relative ml-[4%] mt-5 grid w-[64%] max-w-[760px] grid-cols-2 gap-3 sm:gap-4">
          {round.steps.map((step, index) => {
            const active = selected.includes(step.id);
            return <button key={step.id} type="button" onClick={() => choose(step.id)} disabled={active || feedback === "correct"} className={`space-route-node relative min-h-20 rounded-2xl border-2 p-3 text-sm font-black shadow-xl backdrop-blur-md transition hover:-translate-y-1 sm:min-h-24 sm:text-lg ${active ? "border-emerald-200 bg-emerald-300 text-emerald-950 shadow-[0_0_28px_rgba(52,211,153,.7)]" : "border-cyan-200/60 bg-indigo-950/82 text-white hover:border-cyan-100 hover:bg-indigo-900/90"}`} style={{ animationDelay: `${index * 100}ms` }}><span className="mb-1 block text-[9px] uppercase tracking-[.18em] opacity-70">Punkt trasy {index + 1}</span>{step.label}</button>;
          })}
        </div>

        <div className="ml-[4%] mt-4 flex w-[64%] max-w-[760px] items-center gap-2 rounded-2xl bg-slate-950/65 p-3 text-white backdrop-blur-md" aria-label={`Zbudowana trasa: ${selected.length} z 3 etapów`}><span className="text-2xl">🛸</span>{[1, 2, 3].map((order) => <div key={order} className="flex flex-1 items-center gap-2"><span className={`h-2 flex-1 rounded-full ${selected.length >= order ? "space-route-beam bg-cyan-300" : "bg-white/20"}`} /><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${selected.length >= order ? "bg-emerald-300 text-emerald-950" : "bg-white/15"}`}>{order}</span></div>)}</div>
        <div className="ml-[4%] mt-3 min-h-12 w-[64%] max-w-[760px]" aria-live="polite">{feedback === "wrong" ? <p className="rounded-xl bg-rose-50/95 p-3 text-center text-sm font-bold text-rose-900">Trasa się urwała. {round.hint}</p> : feedback === "correct" ? <p className="rounded-xl bg-emerald-50/95 p-3 text-center text-sm font-black text-emerald-900">Trasa gotowa! Przesyłka dotarła z wynikiem {round.result}.</p> : null}</div>
      </div> : null}

      {status === "complete" ? <div className="absolute inset-0 z-40 grid place-items-center bg-indigo-950/55 p-5 backdrop-blur-sm"><div className="max-w-xl rounded-[2rem] border-4 border-cyan-200 bg-white/95 p-8 text-center shadow-2xl"><div className="text-6xl">🪐</div><p className="mt-2 text-xs font-black uppercase tracking-[.2em] text-violet-700">Wszystkie przesyłki dostarczone</p><h2 className="mt-1 text-4xl font-black text-slate-950">Kosmiczna precyzja!</h2><p className="mt-3 text-lg text-slate-600">Trasy: <strong className="text-slate-950">{score}/{rounds.length}</strong> · pomyłki: <strong className="text-slate-950">{mistakes}</strong> · czas: <strong className="text-slate-950">{formatMissionTime(finalSeconds)}</strong></p>{mistakes === 0 && rewardEnabled ? <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{rewardStatus === "saving" ? "Zapisuję nagrodę…" : rewardStatus === "awarded" ? "🏆 Pierwsze bezbłędne zwycięstwo — zdobywasz 5 punktów!" : rewardStatus === "already-awarded" ? "Idealnie! Nagroda za pierwszy bezbłędny wynik jest już w Twoim dorobku." : rewardStatus === "error" ? "Nie udało się teraz zapisać punktów." : "Bezbłędna misja!"}</p> : null}<button type="button" onClick={start} className="mt-6 min-h-12 rounded-xl bg-violet-600 px-6 font-black text-white">Zagraj ponownie</button></div></div> : null}
    </div>
  </section>;
}
