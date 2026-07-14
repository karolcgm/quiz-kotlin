"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { NumericLessonKeypad } from "@/components/lessons/models/NumericLessonKeypad";
import { GameDifficultyPicker } from "@/components/materials/games/GameDifficultyPicker";
import { claimVisualGamePerfectRewardAction } from "@/lib/actions/rewards";
import {
  shuffleItems,
  type GameDifficulty,
} from "@/lib/materials/gameDifficulty";
import { formatMissionTime } from "@/lib/materials/gameTime";

type Method = "NWD" | "NWW";
type Status = "intro" | "playing" | "complete";
type RewardStatus = "idle" | "saving" | "awarded" | "already-awarded" | "error";

export interface ExpeditionRound {
  id: string;
  title: string;
  story: string;
  a: number;
  b: number;
  method: Method;
  answer: number;
  unit: string;
  explanation: string;
}

const ROUND_POOLS: Record<GameDifficulty, readonly ExpeditionRound[]> = {
  easy: [
    {
      id: "e1",
      title: "Paczki śniadaniowe",
      story:
        "Rozdziel 12 batonów i 18 soków na jak najwięcej jednakowych paczek.",
      a: 12,
      b: 18,
      method: "NWD",
      answer: 6,
      unit: "paczek",
      explanation: "Największa liczba równych paczek to NWD(12,18)=6.",
    },
    {
      id: "e2",
      title: "Wspólny start",
      story:
        "Dwa pojazdy ruszają co 4 i 6 minut. Po ilu minutach znów ruszą razem?",
      a: 4,
      b: 6,
      method: "NWW",
      answer: 12,
      unit: "minut",
      explanation: "Pierwsza wspólna chwila to NWW(4,6)=12.",
    },
    {
      id: "e3",
      title: "Zestawy latarek",
      story:
        "Ułóż jak najwięcej identycznych zestawów z 16 latarek i 24 baterii.",
      a: 16,
      b: 24,
      method: "NWD",
      answer: 8,
      unit: "zestawów",
      explanation: "Największą liczbę identycznych zestawów daje NWD(16,24)=8.",
    },
    {
      id: "e4",
      title: "Sygnały bazy",
      story: "Sygnały migają co 5 i 10 sekund. Kiedy znów migną razem?",
      a: 5,
      b: 10,
      method: "NWW",
      answer: 10,
      unit: "sekund",
      explanation: "NWW(5,10)=10.",
    },
    {
      id: "e5",
      title: "Skrzynie próbek",
      story:
        "Rozdziel 20 kamieni i 30 próbek na największą liczbę jednakowych skrzyń.",
      a: 20,
      b: 30,
      method: "NWD",
      answer: 10,
      unit: "skrzyń",
      explanation: "NWD(20,30)=10.",
    },
  ],
  medium: [
    {
      id: "m1",
      title: "Paczki wyprawowe",
      story:
        "Rozdziel 48 batonów i 60 soków na jak najwięcej jednakowych paczek.",
      a: 48,
      b: 60,
      method: "NWD",
      answer: 12,
      unit: "paczek",
      explanation: "NWD(48,60)=12.",
    },
    {
      id: "m2",
      title: "Odjazd łazików",
      story:
        "Łaziki ruszają co 8 i 12 minut. Po ilu minutach znów wystartują razem?",
      a: 8,
      b: 12,
      method: "NWW",
      answer: 24,
      unit: "minuty",
      explanation: "NWW(8,12)=24.",
    },
    {
      id: "m3",
      title: "Zespoły badawcze",
      story:
        "Podziel 30 geologów i 45 biologów na największą liczbę takich samych zespołów.",
      a: 30,
      b: 45,
      method: "NWD",
      answer: 15,
      unit: "zespołów",
      explanation: "NWD(30,45)=15.",
    },
    {
      id: "m4",
      title: "Dwa nadajniki",
      story: "Nadajniki wysyłają sygnał co 6 i 10 sekund. Kiedy nadadzą razem?",
      a: 6,
      b: 10,
      method: "NWW",
      answer: 30,
      unit: "sekund",
      explanation: "NWW(6,10)=30.",
    },
    {
      id: "m5",
      title: "Równe zapasy",
      story:
        "Rozdziel 36 map i 54 kompasy na największą liczbę jednakowych zestawów.",
      a: 36,
      b: 54,
      method: "NWD",
      answer: 18,
      unit: "zestawów",
      explanation: "NWD(36,54)=18.",
    },
  ],
  hard: [
    {
      id: "h1",
      title: "Duży magazyn",
      story:
        "Rozdziel 84 racje i 126 napojów na największą liczbę jednakowych pakietów.",
      a: 84,
      b: 126,
      method: "NWD",
      answer: 42,
      unit: "pakiety",
      explanation: "NWD(84,126)=42.",
    },
    {
      id: "h2",
      title: "Orbity dronów",
      story:
        "Drony wracają nad bazę co 18 i 30 minut. Kiedy spotkają się ponownie?",
      a: 18,
      b: 30,
      method: "NWW",
      answer: 90,
      unit: "minut",
      explanation: "NWW(18,30)=90.",
    },
    {
      id: "h3",
      title: "Ekipy techniczne",
      story:
        "Podziel 96 mechaników i 144 operatorów na największą liczbę identycznych ekip.",
      a: 96,
      b: 144,
      method: "NWD",
      answer: 48,
      unit: "ekip",
      explanation: "NWD(96,144)=48.",
    },
    {
      id: "h4",
      title: "Okna łączności",
      story:
        "Łączność otwiera się co 24 i 36 minut. Po ilu minutach oba okna otworzą się razem?",
      a: 24,
      b: 36,
      method: "NWW",
      answer: 72,
      unit: "minuty",
      explanation: "NWW(24,36)=72.",
    },
    {
      id: "h5",
      title: "Kontenery medyczne",
      story:
        "Rozdziel 90 opatrunków i 150 ampułek na największą liczbę jednakowych kontenerów.",
      a: 90,
      b: 150,
      method: "NWD",
      answer: 30,
      unit: "kontenerów",
      explanation: "NWD(90,150)=30.",
    },
  ],
};

export function buildExpeditionRounds(
  difficulty: GameDifficulty,
  random: () => number = Math.random,
) {
  return shuffleItems(ROUND_POOLS[difficulty], random);
}

function factors(value: number) {
  const result: number[] = [];
  let remaining = value;
  for (let divisor = 2; divisor * divisor <= remaining; divisor += 1) {
    while (remaining % divisor === 0) {
      result.push(divisor);
      remaining /= divisor;
    }
  }
  if (remaining > 1) result.push(remaining);
  return result;
}

function matchedFactorIndexes(
  left: readonly number[],
  right: readonly number[],
) {
  const usedRight = new Set<number>();
  const leftMatches = new Set<number>();
  const rightMatches = new Set<number>();
  left.forEach((factor, leftIndex) => {
    const rightIndex = right.findIndex(
      (candidate, index) => candidate === factor && !usedRight.has(index),
    );
    if (rightIndex < 0) return;
    leftMatches.add(leftIndex);
    rightMatches.add(rightIndex);
    usedRight.add(rightIndex);
  });
  return { leftMatches, rightMatches };
}

const DESCRIPTIONS: Record<GameDifficulty, string> = {
  easy: "Proste pary i krótkie rytmy",
  medium: "Paczki, zespoły i pojazdy",
  hard: "Większe liczby i dłuższe rozkłady",
};

export function ExpeditionNwdNwwGame({ rewardEnabled = false }: { rewardEnabled?: boolean }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("medium");
  const [rounds, setRounds] = useState<ExpeditionRound[]>([]);
  const [status, setStatus] = useState<Status>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [method, setMethod] = useState<Method | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus>("idle");
  const round = rounds[roundIndex];
  const leftFactors = useMemo(() => factors(round?.a ?? 1), [round?.a]);
  const rightFactors = useMemo(() => factors(round?.b ?? 1), [round?.b]);
  const matches = useMemo(
    () => matchedFactorIndexes(leftFactors, rightFactors),
    [leftFactors, rightFactors],
  );
  const smallerSide = round && round.a <= round.b ? "left" : "right";
  const missionProgress =
    rounds.length === 0
      ? 0
      : Math.round(
          ((roundIndex + (feedback === "correct" ? 1 : 0)) / rounds.length) *
            100,
        );
  const activeStep = !method ? 1 : !answer ? 2 : 3;

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(
      () => setElapsedSeconds((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [status]);

  const start = () => {
    setRounds(buildExpeditionRounds(difficulty));
    setRoundIndex(0);
    setMethod(null);
    setAnswer("");
    setFeedback(null);
    setScore(0);
    setMistakes(0);
    setStreak(0);
    setBestStreak(0);
    setElapsedSeconds(0);
    setFinalSeconds(0);
    setRewardStatus("idle");
    setStatus("playing");
  };

  const updateAnswer = (value: string) => {
    setAnswer(value.replace(/\D/g, "").slice(0, 4));
    setFeedback(null);
  };

  const check = () => {
    if (!round) return;
    const correct = method === round.method && Number(answer) === round.answer;
    setFeedback(correct ? "correct" : "wrong");
    if (!correct) {
      setMistakes((value) => value + 1);
      setStreak(0);
      return;
    }
    setScore((value) => value + 1);
    setStreak((value) => {
      const next = value + 1;
      setBestStreak((best) => Math.max(best, next));
      return next;
    });
    window.setTimeout(() => {
      if (roundIndex === rounds.length - 1) {
        setFinalSeconds(elapsedSeconds);
        setStatus("complete");
        if (mistakes === 0 && rewardEnabled) {
          setRewardStatus("saving");
          void claimVisualGamePerfectRewardAction("expedition-nwd-nww", elapsedSeconds).then((result) => {
            if (result.error) setRewardStatus("error");
            else setRewardStatus(result.awarded ? "awarded" : "already-awarded");
          });
        }
      } else {
        setRoundIndex((value) => value + 1);
        setMethod(null);
        setAnswer("");
        setFeedback(null);
      }
    }, 900);
  };

  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-amber-200 bg-slate-950 shadow-2xl"
      aria-label="Gra Baza Wyprawy NWD i NWW"
    >
      <div className="relative aspect-[16/9] min-h-[620px] overflow-hidden">
        <Image
          src="/materials/expedition-nwd-nww/v1/expedition-nwd-nww-scene-v1.png"
          alt="Chrupek przygotowuje paczki i dwa pojazdy wyprawowe"
          fill
          sizes="(min-width: 1280px) 1100px, 100vw"
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-slate-950/10"
          aria-hidden
        />

        {status === "intro" ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/25 p-4 backdrop-blur-[2px]">
            <div className="max-w-xl rounded-[2rem] border-4 border-white/80 bg-white/95 p-7 text-center shadow-2xl">
              <p className="text-xs font-black uppercase tracking-[.18em] text-amber-700">
                Dział II · gra decyzyjna
              </p>
              <h1 className="mt-2 text-4xl font-black text-slate-950">
                Baza Wyprawy
              </h1>
              <p className="mt-3 leading-relaxed text-slate-600">
                Najpierw zdecyduj: NWD dla największej liczby jednakowych
                zestawów czy NWW dla pierwszej wspólnej chwili. Potem skorzystaj
                z pokazanych rozkładów i oblicz wynik.
              </p>
              <GameDifficultyPicker
                value={difficulty}
                onChange={setDifficulty}
                descriptions={DESCRIPTIONS}
                accent="indigo"
              />
              <button
                type="button"
                onClick={start}
                className="mt-6 min-h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 text-lg font-black text-white shadow-lg"
              >
                Rozpocznij wyprawę →
              </button>
            </div>
          </div>
        ) : null}

        {status === "playing" && round ? (
          <div className="absolute inset-0 overflow-y-auto p-3 pt-4 sm:p-6">
            <div className="mx-auto max-w-3xl rounded-[2rem] border-4 border-white/70 bg-slate-950/88 p-5 text-white shadow-2xl backdrop-blur-md sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">
                    Etap wyprawy {roundIndex + 1}/{rounds.length}
                  </p>
                  <h2 className="mt-1 text-3xl font-black">{round.title}</h2>
                </div>
                <div className="flex gap-2 text-center">
                  <div className="rounded-xl bg-white/10 px-3 py-1.5">
                    <span className="block text-[9px] font-black uppercase text-amber-200">
                      Czas
                    </span>
                    <b className="font-mono">
                      {formatMissionTime(elapsedSeconds)}
                    </b>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-1.5">
                    <span className="block text-[9px] font-black uppercase text-amber-200">
                      Seria
                    </span>
                    <b>×{streak}</b>
                  </div>
                  <div className="rounded-xl bg-amber-200 px-3 py-1.5 text-amber-950">
                    <span className="block text-[9px] font-black uppercase">
                      Punkty
                    </span>
                    <b>
                      {score}/{rounds.length}
                    </b>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="h-3 flex-1 overflow-hidden rounded-full bg-white/15"
                  role="progressbar"
                  aria-label="Postęp wyprawy"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={missionProgress}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300 transition-[width] duration-500"
                    style={{ width: `${missionProgress}%` }}
                  />
                </div>
                <b className="text-xs text-amber-100">{missionProgress}%</b>
              </div>
              <div
                className="mt-3 grid grid-cols-3 gap-2"
                aria-label="Kroki planowania"
              >
                <span
                  className={`rounded-lg px-2 py-1 text-center text-xs font-black ${activeStep >= 1 ? "bg-amber-200 text-amber-950" : "bg-white/10"}`}
                >
                  1. Rozpoznaj
                </span>
                <span
                  className={`rounded-lg px-2 py-1 text-center text-xs font-black ${activeStep >= 2 ? "bg-amber-200 text-amber-950" : "bg-white/10"}`}
                >
                  2. Rozłóż
                </span>
                <span
                  className={`rounded-lg px-2 py-1 text-center text-xs font-black ${activeStep >= 3 ? "bg-amber-200 text-amber-950" : "bg-white/10"}`}
                >
                  3. Oblicz
                </span>
              </div>
              <p className="mt-4 rounded-2xl bg-white/10 p-4 text-lg font-bold leading-relaxed">
                {round.story}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {(["NWD", "NWW"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={value}
                    aria-pressed={method === value}
                    onClick={() => {
                      setMethod(value);
                      setFeedback(null);
                    }}
                    className={`min-h-16 rounded-2xl border-4 text-2xl font-black transition ${method === value ? "border-amber-200 bg-amber-300 text-amber-950 shadow-[0_0_24px_rgba(252,211,77,.35)]" : "border-white/30 bg-white/10 hover:border-white/60"}`}
                  >
                    {value}
                    <span className="mt-1 block text-xs font-bold">
                      {value === "NWD" ? "jednakowe grupy" : "wspólna chwila"}
                    </span>
                  </button>
                ))}
              </div>
              {method ? (
                <div className="mt-5 rounded-3xl bg-white p-4 text-slate-950">
                  <p className="text-center text-sm font-black uppercase tracking-[.14em] text-indigo-700">
                    Rozkłady pomagające w obliczeniu
                  </p>
                  <p className="mt-1 text-center text-xs font-bold text-slate-500">
                    {method === "NWD"
                      ? "Wspólne czynniki są podświetlone."
                      : "Wspólne czynniki w mniejszej liczbie są skreślone. Pomnóż nieskreślone."}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        {
                          value: round.a,
                          list: leftFactors,
                          matches: matches.leftMatches,
                          side: "left",
                        },
                        {
                          value: round.b,
                          list: rightFactors,
                          matches: matches.rightMatches,
                          side: "right",
                        },
                      ] as const
                    ).map((factorization) => (
                      <div
                        key={factorization.side}
                        className="rounded-2xl bg-indigo-50 p-3 text-center"
                      >
                        <b className="text-xl">{factorization.value} = </b>
                        <span className="inline-flex flex-wrap items-center justify-center gap-1">
                          {factorization.list.map((factor, index) => {
                            const common = factorization.matches.has(index);
                            const crossed =
                              method === "NWW" &&
                              factorization.side === smallerSide &&
                              common;
                            return (
                              <span
                                key={`${factorization.side}-${index}`}
                                className={`rounded-lg px-2 py-1 text-xl font-black ${method === "NWD" && common ? "bg-emerald-200 text-emerald-950 ring-2 ring-emerald-400" : crossed ? "bg-slate-200 text-slate-400 line-through decoration-rose-500 decoration-2" : "bg-white text-indigo-950"}`}
                              >
                                {factor}
                              </span>
                            );
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <label className="mx-auto mt-4 block max-w-sm text-center text-lg font-black">
                    Wynik w {round.unit}
                    <input
                      aria-label={`Wynik w ${round.unit}`}
                      inputMode="none"
                      value={answer}
                      onChange={(event) => updateAnswer(event.target.value)}
                      className="mt-2 min-h-14 w-full rounded-2xl border-4 border-amber-300 bg-amber-50 text-center text-3xl font-black"
                    />
                  </label>
                  <div className="mx-auto mt-3 max-w-xl">
                    <NumericLessonKeypad
                      onKey={(key) =>
                        updateAnswer(
                          key === "backspace"
                            ? answer.slice(0, -1)
                            : `${answer}${key}`,
                        )
                      }
                      label="Klawiatura wyniku wyprawy"
                    />
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                disabled={!method || !answer || feedback === "correct"}
                onClick={check}
                className="mt-5 min-h-14 w-full rounded-2xl bg-amber-300 text-lg font-black text-amber-950 disabled:opacity-30"
              >
                Sprawdź plan wyprawy
              </button>
              {feedback ? (
                <p
                  role="status"
                  className={`mt-4 rounded-2xl p-4 text-center font-black ${feedback === "correct" ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}
                >
                  {feedback === "correct"
                    ? round.explanation
                    : `Sprawdź, czy sytuacja opisuje jednakowe grupy, czy wspólną chwilę. Następnie ponownie oblicz wynik.`}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {status === "complete" ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[3px]">
            <div className="max-w-lg rounded-[2rem] border-4 border-amber-200 bg-white/95 p-8 text-center shadow-2xl">
              <div className="text-6xl" aria-hidden>
                🏕️
              </div>
              <p
                className="text-2xl"
                aria-label={`${mistakes === 0 ? 3 : score >= 4 ? 2 : 1} gwiazdki`}
              >
                {mistakes === 0 ? "⭐⭐⭐" : score >= 4 ? "⭐⭐☆" : "⭐☆☆"}
              </p>
              <h2 className="mt-2 text-4xl font-black text-slate-950">
                Wyprawa gotowa!
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                Poprawnie zaplanowane etapy:{" "}
                <b>
                  {score}/{rounds.length}
                </b>
                . Nietrafione próby: <b>{mistakes}</b>.
              </p>
              {mistakes === 0 && rewardEnabled ? (
                <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">
                  {rewardStatus === "saving"
                    ? "Zapisuję nagrodę…"
                    : rewardStatus === "awarded"
                      ? "🏆 Pierwsza bezbłędna wyprawa — zdobywasz 5 punktów!"
                      : rewardStatus === "already-awarded"
                        ? "Wzorowa wyprawa! Nagroda za pierwszy bezbłędny wynik jest już zapisana."
                        : rewardStatus === "error"
                          ? "Nie udało się teraz zapisać punktów."
                          : "Bezbłędna wyprawa!"}
                </p>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-indigo-50 p-3">
                  <span className="block text-xs font-black uppercase text-indigo-700">
                    Najlepsza seria
                  </span>
                  <b className="text-2xl text-slate-950">×{bestStreak}</b>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <span className="block text-xs font-black uppercase text-amber-700">
                    Czas wyprawy
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
                  className="min-h-12 rounded-xl bg-indigo-600 px-6 font-black text-white"
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
