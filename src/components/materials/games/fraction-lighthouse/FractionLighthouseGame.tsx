"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GameDifficultyPicker } from "@/components/materials/games/GameDifficultyPicker";
import { claimVisualGamePerfectRewardAction } from "@/lib/actions/rewards";
import type { GameDifficulty } from "@/lib/materials/gameDifficulty";
import { formatMissionTime } from "@/lib/materials/gameTime";
import { buildFractionLighthouseRounds, type FractionLightRound } from "@/lib/materials/generators/fractionLighthouse";

type GameStatus = "intro" | "playing" | "complete";
type RewardStatus = "idle" | "saving" | "awarded" | "already-awarded" | "error";

const FALL_POSITIONS = [8, 30, 52, 74];

export const FRACTION_LIGHTHOUSE_TIME_LIMITS: Record<GameDifficulty, number> = {
  easy: 10,
  medium: 8,
  hard: 5,
};

const DIFFICULTY_DESCRIPTIONS: Record<GameDifficulty, string> = {
  easy: "10 sekund",
  medium: "8 sekund",
  hard: "5 sekund",
};

export function FractionLighthouseGame({ rewardEnabled = false }: { rewardEnabled?: boolean }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("medium");
  const [rounds, setRounds] = useState<FractionLightRound[]>([]);
  const [status, setStatus] = useState<GameStatus>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [caught, setCaught] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [waveSeconds, setWaveSeconds] = useState(8);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "miss" | null>(null);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus>("idle");
  const round = rounds[roundIndex];
  const waveDuration = FRACTION_LIGHTHOUSE_TIME_LIMITS[difficulty];

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
      setWaveSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== "playing" || !round) return;
    const timeout = window.setTimeout(() => {
      setMistakes((value) => value + 1);
      setFeedback("miss");
      setWrong([]);
      setCaught([]);
      setWaveSeconds(waveDuration);
      if (roundIndex === rounds.length - 1) {
        setFinalSeconds((value) => value || elapsedSeconds + waveDuration);
        setStatus("complete");
      } else {
        setRoundIndex((value) => value + 1);
      }
    }, waveDuration * 1000);
    return () => window.clearTimeout(timeout);
    // Timeout ma zostać uruchomiony od nowa wyłącznie dla nowej fali.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, status, waveDuration]);

  const start = () => {
    setRounds(buildFractionLighthouseRounds());
    setStatus("playing");
    setRoundIndex(0);
    setCaught([]);
    setWrong([]);
    setScore(0);
    setMistakes(0);
    setElapsedSeconds(0);
    setFinalSeconds(0);
    setWaveSeconds(waveDuration);
    setFeedback(null);
    setRewardStatus("idle");
  };

  const finish = (completionTime: number, finalMistakes: number) => {
    setFinalSeconds(completionTime);
    setStatus("complete");
    if (finalMistakes === 0 && rewardEnabled) {
      setRewardStatus("saving");
      void claimVisualGamePerfectRewardAction("fraction-lighthouse", completionTime).then((result) => {
        if (result.error) setRewardStatus("error");
        else setRewardStatus(result.awarded ? "awarded" : "already-awarded");
      });
    }
  };

  const choose = (choiceId: string) => {
    if (!round || caught.includes(choiceId)) return;
    const choice = round.choices.find((item) => item.id === choiceId);
    if (!choice) return;
    if (!choice.correct) {
      setMistakes((value) => value + 1);
      setWrong((value) => value.includes(choiceId) ? value : [...value, choiceId]);
      setFeedback("wrong");
      return;
    }

    const nextCaught = [...caught, choiceId];
    setCaught(nextCaught);
    setFeedback(null);
    const correctCount = round.choices.filter((item) => item.correct).length;
    if (nextCaught.length !== correctCount) return;

    setScore((value) => value + 1);
    setFeedback("correct");
    window.setTimeout(() => {
      if (roundIndex === rounds.length - 1) finish(elapsedSeconds, mistakes);
      else {
        setRoundIndex((value) => value + 1);
        setCaught([]);
        setWrong([]);
        setWaveSeconds(waveDuration);
        setFeedback(null);
      }
    }, 650);
  };

  return <section className="overflow-hidden rounded-[2rem] border border-indigo-200 bg-slate-950 shadow-2xl" aria-label="Gra Latarnia Ułamków">
    <div className="relative aspect-[16/9] min-h-[560px] overflow-hidden bg-indigo-950">
      <Image src="/materials/fraction-lighthouse/v1/fraction-lighthouse-scene-v1.png" alt="" fill sizes="(min-width: 1280px) 1100px, 100vw" className="object-cover" priority />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-slate-950/10" />
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-950/90 to-transparent p-4 text-white sm:p-6">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Misja refleksu i ułamków</p><h1 className="text-xl font-black sm:text-3xl">Latarnia Ułamków</h1></div>
        {status !== "intro" ? <div className="flex gap-2"><div className="rounded-2xl bg-slate-950/75 px-3 py-2 text-right ring-1 ring-white/20"><p className="text-[9px] font-black uppercase text-cyan-200">Czas</p><p className="font-mono text-lg font-black">{formatMissionTime(status === "complete" ? finalSeconds : elapsedSeconds)}</p></div><div className="rounded-2xl bg-amber-100/95 px-3 py-2 text-right text-amber-950"><p className="text-[9px] font-black uppercase">Światło</p><p className="text-lg font-black">{score}/{rounds.length}</p></div></div> : null}
      </header>

      {status === "intro" ? <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/35 p-5 backdrop-blur-[2px]"><div className="max-w-xl rounded-[2rem] border-4 border-amber-100 bg-white/95 p-7 text-center shadow-2xl sm:p-8"><span className="text-5xl">💡</span><h2 className="mt-2 text-3xl font-black text-slate-950">Rozświetl latarnię!</h2><p className="mt-2 leading-relaxed text-slate-600">Z góry spadają ułamki. Klikaj tylko te, które są równe ułamkowi z polecenia. Wyższy poziom daje mniej czasu na każdą falę.</p><GameDifficultyPicker value={difficulty} onChange={setDifficulty} descriptions={DIFFICULTY_DESCRIPTIONS} accent="indigo" /><button type="button" onClick={start} className="mt-5 min-h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 text-lg font-black text-white shadow-xl">Uruchom latarnię →</button></div></div> : null}

      {status === "playing" && round ? <div className="absolute inset-0 z-10 pt-24 sm:pt-28">
        <div className="ml-[4%] w-[64%] max-w-[760px] rounded-2xl border border-white/40 bg-slate-950/75 p-3 text-center text-white shadow-xl backdrop-blur-md"><p className="text-[10px] font-black uppercase tracking-[.16em] text-amber-200">Fala {roundIndex + 1}/{rounds.length} · zostało {waveSeconds} s</p><h2 className="mt-1 text-lg font-black sm:text-2xl">{round.prompt}</h2></div>
        <div key={round.id} className="absolute inset-x-[3%] bottom-16 top-44 sm:right-[28%]" aria-label="Spadające ułamki">
          {round.choices.map((choice, index) => <button key={choice.id} type="button" onClick={() => choose(choice.id)} disabled={caught.includes(choice.id)} aria-label={choice.label} className={`fraction-light-drop absolute top-0 grid h-20 w-20 place-items-center rounded-full border-4 text-xl font-black shadow-[0_0_30px_rgba(250,204,21,.55)] backdrop-blur-sm transition sm:h-24 sm:w-24 sm:text-2xl ${caught.includes(choice.id) ? "border-emerald-200 bg-emerald-300 text-emerald-950 opacity-0" : wrong.includes(choice.id) ? "border-rose-200 bg-rose-400/90 text-white" : "border-amber-100 bg-amber-200/95 text-indigo-950 hover:scale-110"}`} style={{ left: `${FALL_POSITIONS[index]}%`, animationDelay: `${index * 180}ms` }}>{choice.label}</button>)}
        </div>
        <div className="absolute bottom-3 left-[4%] min-h-12 w-[62%]" aria-live="polite">{feedback === "wrong" ? <p className="rounded-xl bg-rose-50/95 p-3 text-center text-sm font-bold text-rose-900">To światło nie pasuje. {round.hint}</p> : feedback === "correct" ? <p className="rounded-xl bg-emerald-50/95 p-3 text-center text-sm font-black text-emerald-900">Dobrze! Wiązka latarni jest mocniejsza.</p> : feedback === "miss" ? <p className="rounded-xl bg-amber-50/95 p-3 text-center text-sm font-bold text-amber-900">Fala minęła — następna już nadlatuje.</p> : null}</div>
      </div> : null}

      {status === "complete" ? <div className="absolute inset-0 z-40 grid place-items-center bg-indigo-950/55 p-5 backdrop-blur-sm"><div className="max-w-xl rounded-[2rem] border-4 border-amber-200 bg-white/95 p-8 text-center shadow-2xl"><div className="text-6xl">🌟</div><p className="mt-2 text-xs font-black uppercase tracking-[.2em] text-amber-700">Latarnia rozświetlona</p><h2 className="mt-1 text-4xl font-black text-slate-950">Świetna obserwacja!</h2><p className="mt-3 text-lg text-slate-600">Fale: <strong className="text-slate-950">{score}/{rounds.length}</strong> · pomyłki: <strong className="text-slate-950">{mistakes}</strong> · czas: <strong className="text-slate-950">{formatMissionTime(finalSeconds)}</strong></p>{mistakes === 0 && rewardEnabled ? <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{rewardStatus === "saving" ? "Zapisuję nagrodę…" : rewardStatus === "awarded" ? "🏆 Pierwsze bezbłędne zwycięstwo — zdobywasz 5 punktów!" : rewardStatus === "already-awarded" ? "Idealnie! Nagroda za pierwszy bezbłędny wynik jest już w Twoim dorobku." : rewardStatus === "error" ? "Nie udało się teraz zapisać punktów." : "Bezbłędna misja!"}</p> : null}<div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={start} className="min-h-12 rounded-xl bg-indigo-600 px-6 font-black text-white">Zagraj ponownie</button><button type="button" onClick={() => setStatus("intro")} className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-6 font-black text-slate-700 hover:border-slate-500">Zmień poziom</button></div></div></div> : null}
    </div>
  </section>;
}
