"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { GameDifficultyPicker } from "@/components/materials/games/GameDifficultyPicker";
import { claimVisualGamePerfectRewardAction } from "@/lib/actions/rewards";
import {
  buildFactorVaultRounds,
  type FactorVaultRound,
} from "@/lib/materials/generators/factorVault";
import type { GameDifficulty } from "@/lib/materials/gameDifficulty";
import { formatMissionTime } from "@/lib/materials/gameTime";

type Status = "intro" | "playing" | "complete";
type Feedback = "correct" | "wrong" | null;
type RewardStatus = "idle" | "saving" | "awarded" | "already-awarded" | "error";

const DESCRIPTIONS: Record<GameDifficulty, string> = {
  easy: "3 pierścienie, liczby do 30",
  medium: "3–4 pierścienie, liczby do 70",
  hard: "4 pierścienie, liczby do 210",
};

const RING_SIZES = [100, 80, 60, 40] as const;
const OPTION_POSITIONS = [
  { left: "50%", top: "4%" },
  { left: "96%", top: "50%" },
  { left: "50%", top: "96%" },
  { left: "4%", top: "50%" },
] as const;

function initialSelections(round?: FactorVaultRound) {
  return round?.rings.map(() => 0) ?? [];
}

export function FactorVaultGame({ rewardEnabled = false }: { rewardEnabled?: boolean }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("medium");
  const [rounds, setRounds] = useState<FactorVaultRound[]>([]);
  const [status, setStatus] = useState<Status>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [selections, setSelections] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus>("idle");

  const round = rounds[roundIndex];
  const selectedFactors = useMemo(
    () => round?.rings.map((ring, index) => ring.options[selections[index] ?? 0]) ?? [],
    [round, selections],
  );
  const currentProduct = selectedFactors.reduce((product, value) => product * value, 1);
  const missionProgress = rounds.length === 0
    ? 0
    : Math.round(((roundIndex + (feedback === "correct" ? 1 : 0)) / rounds.length) * 100);

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const start = () => {
    const nextRounds = buildFactorVaultRounds(difficulty);
    setRounds(nextRounds);
    setRoundIndex(0);
    setSelections(initialSelections(nextRounds[0]));
    setFeedback(null);
    setMistakes(0);
    setScore(0);
    setElapsedSeconds(0);
    setFinalSeconds(0);
    setRewardStatus("idle");
    setStatus("playing");
  };

  const chooseOption = (ringIndex: number, optionIndex: number) => {
    if (feedback) return;
    setSelections((values) => values.map((value, index) => index === ringIndex ? optionIndex : value));
  };

  const rotateRing = (ringIndex: number, direction: -1 | 1) => {
    if (!round || feedback) return;
    const optionCount = round.rings[ringIndex].options.length;
    setSelections((values) => values.map((value, index) => (
      index === ringIndex ? (value + direction + optionCount) % optionCount : value
    )));
  };

  const openVault = () => {
    if (!round || feedback) return;
    if (currentProduct !== round.target) {
      setMistakes((value) => value + 1);
      setFeedback("wrong");
      window.setTimeout(() => setFeedback(null), 900);
      return;
    }

    setScore((value) => value + 1);
    setFeedback("correct");
    window.setTimeout(() => {
      if (roundIndex === rounds.length - 1) {
        setFinalSeconds(elapsedSeconds);
        setStatus("complete");
        if (mistakes === 0 && rewardEnabled) {
          setRewardStatus("saving");
          void claimVisualGamePerfectRewardAction("factor-vault", elapsedSeconds).then((result) => {
            if (result.error) setRewardStatus("error");
            else setRewardStatus(result.awarded ? "awarded" : "already-awarded");
          });
        }
      } else {
        const nextIndex = roundIndex + 1;
        setRoundIndex(nextIndex);
        setSelections(initialSelections(rounds[nextIndex]));
        setFeedback(null);
      }
    }, 850);
  };

  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-cyan-200 bg-slate-950 shadow-2xl"
      aria-label="Gra Skarbiec Czynników"
    >
      <div className="relative min-h-[820px] overflow-hidden lg:min-h-[760px]">
        <Image
          src="/materials/factor-vault/v1/factor-vault-scene-v1.png"
          alt="Podwodny skarbiec z mosiężnymi pierścieniami i turkusowym światłem"
          fill
          sizes="(min-width: 1280px) 1100px, 100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/5 to-slate-950/70" aria-hidden />

        {status === "intro" ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
            <div className="max-w-2xl rounded-[2rem] border-4 border-cyan-100 bg-white/95 p-6 text-center shadow-2xl sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">Dział II · gra logiczna</p>
              <h1 className="mt-2 text-4xl font-black text-slate-950 sm:text-5xl">Skarbiec Czynników</h1>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-slate-600">
                Każdy pierścień musi wskazać <b>jeden czynnik pierwszy</b>. Obracaj pierścienie tak,
                aby iloczyn wybranych liczb był równy liczbie na środku skarbca.
              </p>
              <div className="mx-auto mt-4 max-w-md rounded-2xl bg-cyan-50 p-4 text-cyan-950 ring-1 ring-cyan-200">
                <p className="text-xs font-black uppercase tracking-[.12em] text-cyan-700">Przykład</p>
                <p className="mt-1 text-xl font-black">12 = 2 × 2 × 3</p>
                <p className="mt-1 text-sm font-semibold">Trzy pierścienie ustawiamy kolejno na 2, 2 i 3.</p>
              </div>
              <GameDifficultyPicker
                value={difficulty}
                onChange={setDifficulty}
                descriptions={DESCRIPTIONS}
                accent="cyan"
              />
              <button
                type="button"
                onClick={start}
                className="mt-6 min-h-14 rounded-2xl bg-gradient-to-r from-cyan-700 to-teal-600 px-8 text-lg font-black text-white shadow-lg"
              >
                Zanurkuj do skarbca →
              </button>
            </div>
          </div>
        ) : null}

        {status === "playing" && round ? (
          <div className="absolute inset-0 flex flex-col p-3 sm:p-5">
            <div className="rounded-2xl border border-cyan-100/30 bg-slate-950/82 p-3 text-white shadow-xl backdrop-blur-md sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Komora {roundIndex + 1}/{rounds.length}</p>
                  <h2 className="mt-1 text-xl font-black sm:text-3xl">Ustaw czynniki liczby {round.target}</h2>
                </div>
                <div className="flex gap-2 text-center">
                  <div className="rounded-xl bg-white/10 px-3 py-1.5">
                    <span className="block text-[9px] font-black uppercase text-cyan-200">Czas</span>
                    <b className="font-mono">{formatMissionTime(elapsedSeconds)}</b>
                  </div>
                  <div className="rounded-xl bg-amber-200 px-3 py-1.5 text-amber-950">
                    <span className="block text-[9px] font-black uppercase">Iloczyn</span>
                    <b>{currentProduct}</b>
                  </div>
                  <div className="rounded-xl bg-cyan-200 px-3 py-1.5 text-cyan-950">
                    <span className="block text-[9px] font-black uppercase">Cel</span>
                    <b>{round.target}</b>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="h-3 flex-1 overflow-hidden rounded-full bg-white/15"
                  role="progressbar"
                  aria-label="Postęp otwierania skarbca"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={missionProgress}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-amber-300 transition-[width] duration-500"
                    style={{ width: `${missionProgress}%` }}
                  />
                </div>
                <b className="text-xs text-cyan-100">{missionProgress}%</b>
              </div>
            </div>

            <div className="mt-3 grid flex-1 items-center gap-3 lg:grid-cols-[1fr_300px]">
              <div className="relative mx-auto aspect-square w-[min(92vw,500px)] max-w-full" aria-label={`Zamek liczby ${round.target}`}>
                {round.rings.map((ring, ringIndex) => {
                  const size = RING_SIZES[ringIndex];
                  const selection = selections[ringIndex] ?? 0;
                  return (
                    <div
                      key={ring.id}
                      className="absolute left-1/2 top-1/2 rounded-full border-4 border-cyan-100/75 bg-slate-950/15 shadow-[inset_0_0_28px_rgba(34,211,238,.2),0_0_18px_rgba(34,211,238,.15)] transition-transform duration-500"
                      style={{
                        width: `${size}%`,
                        height: `${size}%`,
                        transform: `translate(-50%, -50%) rotate(${-selection * 90}deg)`,
                      }}
                    >
                      {ring.options.map((option, optionIndex) => (
                        <button
                          key={`${ring.id}-${option}`}
                          type="button"
                          onClick={() => chooseOption(ringIndex, optionIndex)}
                          aria-label={`Pierścień ${ringIndex + 1}: wybierz ${option}`}
                          aria-pressed={selection === optionIndex}
                          className={`absolute grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-base font-black shadow-lg transition sm:size-12 sm:text-lg ${selection === optionIndex ? "border-amber-100 bg-amber-300 text-amber-950 ring-4 ring-amber-300/25" : "border-cyan-100/80 bg-slate-950/90 text-white hover:bg-cyan-900"}`}
                          style={{
                            ...OPTION_POSITIONS[optionIndex],
                            transform: `translate(-50%, -50%) rotate(${selection * 90}deg)`,
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  );
                })}
                <div className="absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-amber-100 bg-slate-950/90 text-center text-white shadow-[0_0_35px_rgba(251,191,36,.4)] sm:size-36">
                  <div><span className="block text-[10px] font-black uppercase tracking-[.14em] text-cyan-200">Cel</span><b className="text-4xl text-amber-200 sm:text-5xl">{round.target}</b></div>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-100/30 bg-slate-950/85 p-4 text-white backdrop-blur-md">
                <p className="text-xs font-black uppercase tracking-[.14em] text-cyan-200">Panel pierścieni</p>
                <div className="mt-3 space-y-2">
                  {round.rings.map((ring, ringIndex) => (
                    <div key={`${ring.id}-control`} className="grid grid-cols-[44px_1fr_44px] items-center gap-2 rounded-xl bg-white/10 p-2">
                      <button type="button" onClick={() => rotateRing(ringIndex, -1)} className="grid size-11 place-items-center rounded-lg bg-cyan-900 font-black" aria-label={`Obróć pierścień ${ringIndex + 1} w lewo`}>←</button>
                      <div className="text-center"><span className="block text-[9px] font-black uppercase text-cyan-200">Pierścień {ringIndex + 1}</span><b className="text-2xl text-amber-200">{selectedFactors[ringIndex]}</b></div>
                      <button type="button" onClick={() => rotateRing(ringIndex, 1)} className="grid size-11 place-items-center rounded-lg bg-cyan-900 font-black" aria-label={`Obróć pierścień ${ringIndex + 1} w prawo`}>→</button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl bg-white/10 p-3 text-center">
                  <span className="block text-[9px] font-black uppercase text-cyan-200">Twoje działanie</span>
                  <b className="text-lg">{selectedFactors.join(" × ")} = {currentProduct}</b>
                </div>
                <button
                  type="button"
                  onClick={openVault}
                  className="mt-3 min-h-14 w-full rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 text-lg font-black text-amber-950 shadow-lg"
                >
                  🔐 Otwórz skarbiec
                </button>
              </div>
            </div>

            {feedback ? (
              <p role="status" className={`absolute left-1/2 top-[45%] z-30 w-[min(90%,620px)] -translate-x-1/2 rounded-2xl p-4 text-center font-black shadow-2xl ${feedback === "correct" ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}>
                {feedback === "correct"
                  ? `Zamek otwarty! ${round.target} = ${selectedFactors.join(" × ")}.`
                  : `Jeszcze nie. ${selectedFactors.join(" × ")} = ${currentProduct}, a potrzebujesz ${round.target}.`}
              </p>
            ) : null}
          </div>
        ) : null}

        {status === "complete" ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-[3px]">
            <div className="max-w-lg rounded-[2rem] border-4 border-amber-200 bg-white/95 p-8 text-center shadow-2xl">
              <div className="text-6xl" aria-hidden>🗝️</div>
              <p className="mt-1 text-2xl" aria-label={`${mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1} gwiazdki`}>
                {mistakes === 0 ? "⭐⭐⭐" : mistakes <= 2 ? "⭐⭐☆" : "⭐☆☆"}
              </p>
              <h2 className="mt-2 text-4xl font-black text-slate-950">Skarbiec otwarty!</h2>
              <p className="mt-3 text-lg text-slate-600">Komory: <b>{score}/{rounds.length}</b> · pomyłki: <b>{mistakes}</b>.</p>
              {mistakes === 0 && rewardEnabled ? (
                <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">
                  {rewardStatus === "saving" ? "Zapisuję nagrodę…" : rewardStatus === "awarded" ? "🏆 Pierwsze bezbłędne otwarcie — zdobywasz 5 punktów!" : rewardStatus === "already-awarded" ? "Perfekcyjnie! Nagroda za ten skarbiec jest już zapisana." : rewardStatus === "error" ? "Nie udało się teraz zapisać punktów." : "Bezbłędne otwarcie!"}
                </p>
              ) : null}
              <div className="mx-auto mt-4 max-w-xs rounded-2xl bg-cyan-50 p-3">
                <span className="block text-xs font-black uppercase text-cyan-700">Czas wyprawy</span>
                <b className="font-mono text-2xl text-slate-950">{formatMissionTime(finalSeconds)}</b>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={start} className="min-h-12 rounded-xl bg-cyan-700 px-6 font-black text-white">Zagraj ponownie</button>
                <button type="button" onClick={() => setStatus("intro")} className="min-h-12 rounded-xl border-2 border-slate-300 px-6 font-black text-slate-700">Zmień poziom</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
