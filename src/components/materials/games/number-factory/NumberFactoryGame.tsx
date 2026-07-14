"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GameDifficultyPicker } from "@/components/materials/games/GameDifficultyPicker";
import { claimVisualGamePerfectRewardAction } from "@/lib/actions/rewards";
import {
  shuffleItems,
  type GameDifficulty,
} from "@/lib/materials/gameDifficulty";
import { formatMissionTime } from "@/lib/materials/gameTime";

type Status = "intro" | "playing" | "complete";
type Decision = "catch" | "pass";
type RewardStatus = "idle" | "saving" | "awarded" | "already-awarded" | "error";

export interface NumberFactoryRound {
  id: string;
  rule: string;
  number: number;
  shouldCatch: boolean;
  explanation: string;
}

const FACTORY_POOLS: Record<GameDifficulty, readonly NumberFactoryRound[]> = {
  easy: [
    {
      id: "e1",
      rule: "Podzielne przez 2",
      number: 36,
      shouldCatch: true,
      explanation: "36 kończy się cyfrą parzystą.",
    },
    {
      id: "e2",
      rule: "Podzielne przez 5",
      number: 42,
      shouldCatch: false,
      explanation: "42 nie kończy się cyfrą 0 ani 5.",
    },
    {
      id: "e3",
      rule: "Liczby pierwsze",
      number: 17,
      shouldCatch: true,
      explanation: "17 ma dokładnie dwa dzielniki.",
    },
    {
      id: "e4",
      rule: "Wielokrotności 4",
      number: 18,
      shouldCatch: false,
      explanation: "18 nie jest wielokrotnością 4.",
    },
    {
      id: "e5",
      rule: "Liczby złożone",
      number: 21,
      shouldCatch: true,
      explanation: "21 = 3×7.",
    },
    {
      id: "e6",
      rule: "Dzielniki 24",
      number: 5,
      shouldCatch: false,
      explanation: "24 nie dzieli się przez 5 bez reszty.",
    },
  ],
  medium: [
    {
      id: "m1",
      rule: "Podzielne przez 3",
      number: 372,
      shouldCatch: true,
      explanation: "Suma cyfr 3+7+2 wynosi 12.",
    },
    {
      id: "m2",
      rule: "Podzielne przez 4",
      number: 1_238,
      shouldCatch: false,
      explanation: "38 nie dzieli się przez 4.",
    },
    {
      id: "m3",
      rule: "Podzielne przez 9",
      number: 2_745,
      shouldCatch: true,
      explanation: "Suma cyfr wynosi 18.",
    },
    {
      id: "m4",
      rule: "Liczby pierwsze",
      number: 91,
      shouldCatch: false,
      explanation: "91 = 7×13.",
    },
    {
      id: "m5",
      rule: "Wielokrotności 12",
      number: 84,
      shouldCatch: true,
      explanation: "84 = 7×12.",
    },
    {
      id: "m6",
      rule: "Dzielniki 60",
      number: 8,
      shouldCatch: false,
      explanation: "60 nie dzieli się przez 8 bez reszty.",
    },
  ],
  hard: [
    {
      id: "h1",
      rule: "Podzielne przez 100",
      number: 45_600,
      shouldCatch: true,
      explanation: "Liczba kończy się dwoma zerami.",
    },
    {
      id: "h2",
      rule: "Podzielne przez 9",
      number: 84_713,
      shouldCatch: false,
      explanation: "Suma cyfr wynosi 23.",
    },
    {
      id: "h3",
      rule: "Podzielne przez 4",
      number: 73_516,
      shouldCatch: true,
      explanation: "Dwie ostatnie cyfry tworzą 16.",
    },
    {
      id: "h4",
      rule: "Liczby pierwsze",
      number: 121,
      shouldCatch: false,
      explanation: "121 = 11×11.",
    },
    {
      id: "h5",
      rule: "Wielokrotności 18",
      number: 234,
      shouldCatch: true,
      explanation: "234 = 13×18.",
    },
    {
      id: "h6",
      rule: "Dzielniki 210",
      number: 14,
      shouldCatch: true,
      explanation: "210 = 14×15.",
    },
  ],
};

export function buildNumberFactoryRounds(
  difficulty: GameDifficulty,
  random: () => number = Math.random,
) {
  return shuffleItems(FACTORY_POOLS[difficulty], random).slice(0, 5);
}

const DESCRIPTIONS: Record<GameDifficulty, string> = {
  easy: "Małe liczby i proste reguły",
  medium: "Liczby dwu- i czterocyfrowe",
  hard: "Duże liczby i mieszane pojęcia",
};

export function NumberFactoryGame({ rewardEnabled = false }: { rewardEnabled?: boolean }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("medium");
  const [rounds, setRounds] = useState<NumberFactoryRound[]>([]);
  const [status, setStatus] = useState<Status>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus>("idle");
  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | "timing" | null
  >(null);
  const round = rounds[roundIndex];
  const inCatchZone = progress >= 38 && progress <= 82;
  const tick = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
  const missionProgress =
    rounds.length === 0
      ? 0
      : Math.round(
          ((roundIndex + (feedback === "correct" ? 1 : 0)) / rounds.length) *
            100,
        );

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(
      () => setElapsedSeconds((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [status]);

  const finishRound = useCallback(
    (correct: boolean, reason: "wrong" | "timing" = "wrong") => {
      if (feedback) return;
      setFeedback(correct ? "correct" : reason);
      if (correct) {
        setScore((value) => value + 1);
        setStreak((value) => {
          const next = value + 1;
          setBestStreak((best) => Math.max(best, next));
          return next;
        });
      } else {
        setMistakes((value) => value + 1);
        setStreak(0);
      }
      window.setTimeout(() => {
        if (roundIndex === rounds.length - 1) {
          setFinalSeconds(elapsedSeconds);
          setStatus("complete");
          const finalMistakes = mistakes + (correct ? 0 : 1);
          if (finalMistakes === 0 && rewardEnabled) {
            setRewardStatus("saving");
            void claimVisualGamePerfectRewardAction("number-factory", elapsedSeconds).then((result) => {
              if (result.error) setRewardStatus("error");
              else setRewardStatus(result.awarded ? "awarded" : "already-awarded");
            });
          }
        } else {
          setRoundIndex((value) => value + 1);
          setProgress(0);
          setFeedback(null);
        }
      }, 750);
    },
    [elapsedSeconds, feedback, mistakes, rewardEnabled, roundIndex, rounds.length],
  );

  useEffect(() => {
    if (status !== "playing" || !round || feedback) return;
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = value + tick;
        if (next >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => finishRound(!round.shouldCatch), 0);
          return 100;
        }
        return next;
      });
    }, 120);
    return () => window.clearInterval(timer);
  }, [feedback, finishRound, round, status, tick]);

  const start = () => {
    setRounds(buildNumberFactoryRounds(difficulty));
    setRoundIndex(0);
    setProgress(0);
    setScore(0);
    setMistakes(0);
    setStreak(0);
    setBestStreak(0);
    setElapsedSeconds(0);
    setFinalSeconds(0);
    setRewardStatus("idle");
    setFeedback(null);
    setStatus("playing");
  };

  const decide = (decision: Decision) => {
    if (!round || feedback) return;
    if (decision === "catch" && !inCatchZone) {
      setMistakes((value) => value + 1);
      setStreak(0);
      setFeedback("timing");
      window.setTimeout(() => setFeedback(null), 650);
      return;
    }
    finishRound((decision === "catch") === round.shouldCatch);
  };

  const tokenPosition = useMemo(
    () => `calc(4% + ${progress * 0.76}%)`,
    [progress],
  );

  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-teal-200 bg-slate-950 shadow-2xl"
      aria-label="Gra Fabryka Liczb"
    >
      <div className="relative aspect-[16/9] min-h-[560px] overflow-hidden">
        <Image
          src="/materials/number-factory/v1/number-factory-scene-v1.png"
          alt="Chrupek obsługuje taśmę i mechaniczną łapkę w Fabryce Liczb"
          fill
          sizes="(min-width: 1280px) 1100px, 100vw"
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-transparent to-slate-950/10"
          aria-hidden
        />

        {status === "intro" ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/25 p-4 backdrop-blur-[2px]">
            <div className="max-w-xl rounded-[2rem] border-4 border-white/80 bg-white/95 p-7 text-center shadow-2xl">
              <p className="text-xs font-black uppercase tracking-[.18em] text-teal-700">
                Dział II · gra zręcznościowa
              </p>
              <h1 className="mt-2 text-4xl font-black text-slate-950">
                Fabryka Liczb
              </h1>
              <p className="mt-3 leading-relaxed text-slate-600">
                Na taśmie jedzie liczba. Przeczytaj regułę. Jeśli liczba pasuje,
                uruchom łapkę dopiero w podświetlonej strefie. Jeśli nie pasuje
                — przepuść ją do recyklingu.
              </p>
              <GameDifficultyPicker
                value={difficulty}
                onChange={setDifficulty}
                descriptions={DESCRIPTIONS}
                accent="cyan"
              />
              <button
                type="button"
                onClick={start}
                className="mt-6 min-h-14 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 text-lg font-black text-white shadow-lg"
              >
                Uruchom taśmę →
              </button>
            </div>
          </div>
        ) : null}

        {status === "playing" && round ? (
          <div className="absolute inset-0 pt-4 sm:pt-6">
            <div className="mx-auto w-[94%] rounded-2xl bg-slate-950/88 p-3 text-white shadow-xl backdrop-blur-md sm:w-[90%] sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">
                    Zlecenie {roundIndex + 1}/{rounds.length}
                  </p>
                  <h2 className="mt-1 text-xl font-black sm:text-3xl">
                    Łapka sortuje: {round.rule}
                  </h2>
                </div>
                <div className="flex flex-wrap justify-end gap-2 text-center">
                  <div className="rounded-xl bg-white/10 px-3 py-1.5">
                    <span className="block text-[9px] font-black uppercase text-cyan-200">
                      Czas
                    </span>
                    <b className="font-mono">
                      {formatMissionTime(elapsedSeconds)}
                    </b>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-1.5">
                    <span className="block text-[9px] font-black uppercase text-cyan-200">
                      Seria
                    </span>
                    <b>×{streak}</b>
                  </div>
                  <div className="rounded-xl bg-cyan-200 px-3 py-1.5 text-cyan-950">
                    <span className="block text-[9px] font-black uppercase">
                      Wynik
                    </span>
                    <b>
                      {score}/{rounds.length}
                    </b>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="h-3 flex-1 overflow-hidden rounded-full bg-white/15"
                  role="progressbar"
                  aria-label="Postęp zmiany w fabryce"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={missionProgress}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300 transition-[width] duration-500"
                    style={{ width: `${missionProgress}%` }}
                  />
                </div>
                <b className="text-xs text-cyan-100">{missionProgress}%</b>
              </div>
              <div
                className="mt-2 flex justify-center gap-2"
                aria-label="Plan pięciu zleceń"
              >
                {rounds.map((item, index) => (
                  <span
                    key={item.id}
                    className={`grid size-6 place-items-center rounded-full text-[10px] font-black transition ${index < roundIndex || (index === roundIndex && feedback === "correct") ? "bg-emerald-300 text-emerald-950" : index === roundIndex ? "bg-amber-300 text-amber-950 ring-2 ring-white" : "bg-white/15 text-white/70"}`}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
            </div>
            <div
              className="absolute left-[10%] right-[22%] top-[58%] h-24"
              aria-label={`Na taśmie liczba ${round.number}`}
            >
              <div
                className="absolute left-[38%] top-0 h-full w-[44%] rounded-2xl border-4 border-dashed border-cyan-200/80 bg-cyan-300/15"
                aria-hidden
              >
                <span className="absolute inset-x-0 -top-8 text-center text-xs font-black uppercase text-white">
                  strefa łapki
                </span>
              </div>
              <div
                className="absolute top-2 grid size-20 -translate-x-1/2 place-items-center rounded-full border-4 border-slate-300 bg-white text-center text-2xl font-black text-slate-950 shadow-2xl transition-[left] duration-100 ease-linear sm:size-24 sm:text-3xl"
                style={{ left: tokenPosition }}
              >
                {round.number.toLocaleString("pl-PL")}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-4 mx-auto grid w-[92%] gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => decide("catch")}
                className={`min-h-16 rounded-2xl border-4 text-xl font-black shadow-xl transition ${inCatchZone ? "border-cyan-200 bg-cyan-300 text-cyan-950 scale-[1.02]" : "border-white/60 bg-slate-950/80 text-white"}`}
              >
                🦾 Uruchom łapkę
              </button>
              <button
                type="button"
                onClick={() => decide("pass")}
                className="min-h-16 rounded-2xl border-4 border-amber-200 bg-amber-300 text-xl font-black text-amber-950 shadow-xl"
              >
                Przepuść liczbę
              </button>
            </div>
            {feedback ? (
              <p
                role="status"
                className={`absolute left-1/2 top-[36%] w-[min(90%,620px)] -translate-x-1/2 rounded-2xl p-4 text-center font-black shadow-xl ${feedback === "correct" ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}
              >
                {feedback === "correct"
                  ? `Dobrze! ${round.explanation}`
                  : feedback === "timing"
                    ? "Łapka została uruchomiona poza podświetloną strefą."
                    : `Ta decyzja nie pasuje. ${round.explanation}`}
              </p>
            ) : null}
          </div>
        ) : null}

        {status === "complete" ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[3px]">
            <div className="max-w-lg rounded-[2rem] border-4 border-amber-200 bg-white/95 p-8 text-center shadow-2xl">
              <div className="text-6xl" aria-hidden>
                ⚙️
              </div>
              <p
                className="text-2xl"
                aria-label={`${mistakes === 0 ? 3 : score >= 4 ? 2 : 1} gwiazdki`}
              >
                {mistakes === 0 ? "⭐⭐⭐" : score >= 4 ? "⭐⭐☆" : "⭐☆☆"}
              </p>
              <h2 className="mt-2 text-4xl font-black text-slate-950">
                Zmiana zakończona!
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                Poprawnie posortowane:{" "}
                <b>
                  {score}/{rounds.length}
                </b>
                . Pomyłki lub zbyt wczesne ruchy: <b>{mistakes}</b>.
              </p>
              {mistakes === 0 && rewardEnabled ? (
                <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">
                  {rewardStatus === "saving"
                    ? "Zapisuję nagrodę…"
                    : rewardStatus === "awarded"
                      ? "🏆 Pierwsza bezbłędna zmiana — zdobywasz 5 punktów!"
                      : rewardStatus === "already-awarded"
                        ? "Perfekcyjna zmiana! Nagroda za pierwszy bezbłędny wynik jest już zapisana."
                        : rewardStatus === "error"
                          ? "Nie udało się teraz zapisać punktów."
                          : "Bezbłędna zmiana!"}
                </p>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-teal-50 p-3">
                  <span className="block text-xs font-black uppercase text-teal-700">
                    Najlepsza seria
                  </span>
                  <b className="text-2xl text-slate-950">×{bestStreak}</b>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <span className="block text-xs font-black uppercase text-amber-700">
                    Czas zmiany
                  </span>
                  <b className="font-mono text-2xl text-slate-950">
                    {formatMissionTime(finalSeconds)}
                  </b>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={start}
                  className="min-h-12 rounded-xl bg-teal-600 px-6 font-black text-white"
                >
                  Zagraj ponownie
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("intro")}
                  className="min-h-12 rounded-xl border-2 border-slate-300 px-6 font-black text-slate-700"
                >
                  Zmień poziom
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
