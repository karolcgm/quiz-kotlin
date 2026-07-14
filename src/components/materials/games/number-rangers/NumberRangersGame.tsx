"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { GameDifficultyPicker } from "@/components/materials/games/GameDifficultyPicker";
import { claimVisualGamePerfectRewardAction } from "@/lib/actions/rewards";
import {
  buildNumberRangerRounds,
  type NumberRangerCreature,
  type NumberRangerRound,
} from "@/lib/materials/generators/numberRangers";
import type { GameDifficulty } from "@/lib/materials/gameDifficulty";
import { formatMissionTime } from "@/lib/materials/gameTime";

type Status = "intro" | "story" | "playing" | "chapter" | "camp" | "complete";
type RewardStatus = "idle" | "saving" | "awarded" | "already-awarded" | "error";
type Feedback = { tone: "correct" | "wrong" | "info"; message: string } | null;
type ThrowState = {
  id: string;
  left: number;
  top: number;
  launched: boolean;
};

type BurstState = { id: string; left: number; top: number } | null;

const DESCRIPTIONS: Record<GameDifficulty, string> = {
  easy: "Małe liczby i podstawowe pojęcia",
  medium: "Liczby trzycyfrowe i cechy podzielności",
  hard: "Duże liczby i dwie reguły naraz",
};

const CREATURE_SYMBOLS = ["🌿", "☁️", "🪨", "💧", "⚡", "💎", "🔥"] as const;

const CHAPTERS = [
  { name: "Leśne Sanktuarium", icon: "🌿", lore: "Pierwszy fragment ukrył się pośród wielokrotności i dzielników." },
  { name: "Źródła Światła", icon: "💧", lore: "Drugi fragment odpowiada tylko na prawidłowe cechy podzielności." },
  { name: "Astralne Obserwatorium", icon: "🪐", lore: "Trzeci fragment dryfuje wśród trudniejszych liczb." },
  { name: "Serce Galaktyki", icon: "✨", lore: "Ostatnia próba łączy całą wiedzę Łowcy Liczb." },
] as const;

const AMBIENT_SPARKS = [
  [8, 29], [17, 68], [28, 22], [38, 61], [49, 31], [58, 72],
  [69, 24], [77, 66], [88, 32], [94, 74], [44, 80], [82, 18],
] as const;

function playGameSound(kind: "throw" | "correct" | "wrong" | "chapter" | "complete", enabled: boolean) {
  if (!enabled || typeof window === "undefined" || typeof window.AudioContext !== "function") return;
  const context = new window.AudioContext();
  const patterns = {
    throw: [420, 620],
    correct: [660, 880, 1_120],
    wrong: [230, 160],
    chapter: [520, 780, 1_040],
    complete: [520, 660, 880, 1_180],
  } as const;
  patterns[kind].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime + index * 0.09;
    oscillator.type = kind === "wrong" ? "sawtooth" : "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.14);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.16);
  });
  window.setTimeout(() => void context.close(), 800);
}

export function NumberRangersGame({ rewardEnabled = false }: { rewardEnabled?: boolean }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("medium");
  const [rounds, setRounds] = useState<NumberRangerRound[]>([]);
  const [status, setStatus] = useState<Status>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [caughtIds, setCaughtIds] = useState<string[]>([]);
  const [capsules, setCapsules] = useState(6);
  const [hearts, setHearts] = useState(3);
  const [completedFragments, setCompletedFragments] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hints, setHints] = useState(0);
  const [scannerActive, setScannerActive] = useState(false);
  const [roundLocked, setRoundLocked] = useState(false);
  const [throwing, setThrowing] = useState<ThrowState | null>(null);
  const [burst, setBurst] = useState<BurstState>(null);
  const [reactionId, setReactionId] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus>("idle");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const round = rounds[roundIndex];
  const caughtInRound = caughtIds.length;
  const totalTargets = rounds.reduce((sum, item) => sum + item.targetCount, 0);
  const missionProgress = rounds.length === 0 || !round
    ? 0
    : Math.round(((roundIndex + caughtInRound / round.targetCount) / rounds.length) * 100);
  const remainingTargets = round ? round.targetCount - caughtInRound : 0;
  const capsuleDots = useMemo(() => Array.from({ length: capsules }, (_, index) => index), [capsules]);
  const chapter = CHAPTERS[roundIndex] ?? CHAPTERS[0];
  const sceneSrc = status === "intro" || status === "story" || status === "chapter" || status === "camp"
    ? "/materials/number-rangers/v1/number-rangers-prologue-v1.png"
    : roundIndex >= 2
      ? "/materials/number-rangers/v1/number-rangers-cosmic-arena-v1.png"
      : "/materials/number-rangers/v1/number-rangers-scene-v1.png";

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const start = () => {
    setRounds(buildNumberRangerRounds(difficulty));
    setRoundIndex(0);
    setCaughtIds([]);
    setCapsules(6);
    setHearts(3);
    setCompletedFragments(0);
    setScore(0);
    setMistakes(0);
    setStreak(0);
    setBestStreak(0);
    setHints(0);
    setScannerActive(false);
    setRoundLocked(false);
    setThrowing(null);
    setBurst(null);
    setReactionId(null);
    setScreenShake(false);
    setFeedback(null);
    setElapsedSeconds(0);
    setFinalSeconds(0);
    setRewardStatus("idle");
    setStatus("story");
  };

  const beginAdventure = () => {
    playGameSound("chapter", soundEnabled);
    setStatus("playing");
  };

  const finishGame = (completionTime: number) => {
    setFinalSeconds(completionTime);
    setStatus("complete");
    setCompletedFragments(4);
    playGameSound("complete", soundEnabled);
    if (mistakes === 0 && hints === 0 && rewardEnabled) {
      setRewardStatus("saving");
      void claimVisualGamePerfectRewardAction("number-rangers", completionTime).then((result) => {
        if (result.error) setRewardStatus("error");
        else setRewardStatus(result.awarded ? "awarded" : "already-awarded");
      });
    }
  };

  const moveToNextRound = () => {
    if (roundIndex === rounds.length - 1) {
      finishGame(elapsedSeconds);
      return;
    }
    setCompletedFragments(roundIndex + 1);
    playGameSound("chapter", soundEnabled);
    setStatus("chapter");
  };

  const continueAdventure = () => {
    setRoundIndex((value) => value + 1);
    setCaughtIds([]);
    setCapsules(6);
    setHearts(3);
    setFeedback(null);
    setRoundLocked(false);
    setReactionId(null);
    setStatus("playing");
  };

  const restartRoundFromCamp = () => {
    setScore((value) => Math.max(0, value - caughtIds.length));
    setCaughtIds([]);
    setCapsules(6);
    setHearts(3);
    setStreak(0);
    setRoundLocked(false);
    setReactionId(null);
    setFeedback({ tone: "info", message: `Wskazówka Chrupka: ${round?.explanation ?? "Sprawdź każdą liczbę jeszcze raz."}` });
    setStatus("playing");
    window.setTimeout(() => setFeedback(null), 2400);
  };

  const resolveThrow = (creature: NumberRangerCreature) => {
    setThrowing(null);

    if (creature.correct) {
      const nextCaught = [...caughtIds, creature.id];
      const nextStreak = streak + 1;
      setCaughtIds(nextCaught);
      setScore((value) => value + 1);
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      setBurst({ id: creature.id, left: creature.left, top: creature.top });
      playGameSound("correct", soundEnabled);
      if (typeof navigator.vibrate === "function") navigator.vibrate(35);
      setFeedback({ tone: "correct", message: `Uratowany Liczwork ${creature.value.toLocaleString("pl-PL")} wraca do swojej krainy!` });
      window.setTimeout(() => setBurst(null), 720);

      if (nextCaught.length === round?.targetCount) {
        setRoundLocked(true);
        window.setTimeout(moveToNextRound, 1050);
      } else {
        window.setTimeout(() => setFeedback(null), 650);
      }
      return;
    }

    const nextHearts = hearts - 1;
    setMistakes((value) => value + 1);
    setHearts(nextHearts);
    setStreak(0);
    setReactionId(creature.id);
    setScreenShake(true);
    playGameSound("wrong", soundEnabled);
    if (typeof navigator.vibrate === "function") navigator.vibrate([45, 35, 45]);
    setFeedback({ tone: "wrong", message: `${creature.value.toLocaleString("pl-PL")} nie pasuje do tej misji. Kapsuła odbiła się!` });
    window.setTimeout(() => setScreenShake(false), 360);
    window.setTimeout(() => setReactionId(null), 900);
    if (nextHearts <= 0) {
      setRoundLocked(true);
      window.setTimeout(() => setStatus("camp"), 850);
    } else {
      window.setTimeout(() => setFeedback(null), 900);
    }
  };

  const throwCapsule = (creature: NumberRangerCreature) => {
    if (throwing || roundLocked || caughtIds.includes(creature.id)) return;

    const nextCapsules = Math.max(0, capsules - 1);
    playGameSound("throw", soundEnabled);
    setCapsules(nextCapsules);
    setThrowing({
      id: creature.id,
      left: creature.left,
      top: creature.top,
      launched: false,
    });
    setFeedback({ tone: "info", message: `Rzut w liczbę ${creature.value.toLocaleString("pl-PL")}…` });

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setThrowing((value) => value ? { ...value, launched: true } : value);
      });
    });

    window.setTimeout(() => {
      resolveThrow(creature);
      if (nextCapsules === 0 && !(creature.correct && remainingTargets === 1) && (creature.correct || hearts > 1)) {
        window.setTimeout(() => {
          setCapsules(3);
          setFeedback({ tone: "info", message: "Stacja doładowała 3 kapsuły." });
          window.setTimeout(() => setFeedback(null), 850);
        }, 950);
      }
    }, 570);
  };

  const useScanner = () => {
    if (scannerActive || roundLocked || throwing) return;
    setHints((value) => value + 1);
    setScannerActive(true);
    setFeedback({ tone: "info", message: "Skaner przez chwilę podświetla właściwe okazy." });
    window.setTimeout(() => {
      setScannerActive(false);
      setFeedback(null);
    }, 2200);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-cyan-200 bg-slate-950 shadow-2xl" aria-label="Gra Łowcy Liczb">
      <div className={`relative min-h-[900px] overflow-hidden lg:min-h-[780px] ${screenShake ? "number-ranger-screen-shake" : ""}`}>
        <Image
          src={sceneSrc}
          alt={roundIndex >= 2 && status === "playing" ? "Kosmiczne obserwatorium z przyjaznymi Liczworkami" : "Magiczna kraina Łowców Liczb i Kryształ Ładu"}
          fill
          sizes="(min-width: 1280px) 1100px, 100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/70" aria-hidden />

        {status !== "playing" ? <button type="button" onClick={() => setSoundEnabled((value) => !value)} className="absolute right-4 top-4 z-50 grid size-11 place-items-center rounded-full border border-white/40 bg-slate-950/70 text-xl text-white shadow-lg" aria-label={soundEnabled ? "Wyłącz dźwięk" : "Włącz dźwięk"}>{soundEnabled ? "🔊" : "🔇"}</button> : null}

        {status === "intro" ? (
          <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
            <div className="max-w-2xl rounded-[2rem] border-4 border-cyan-100 bg-white/95 p-6 text-center shadow-2xl sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">Dział II · kampania fabularna</p>
              <h1 className="mt-2 text-4xl font-black text-slate-950 sm:text-5xl">Łowcy Liczb</h1>
              <p className="mt-1 text-sm font-black uppercase tracking-[.16em] text-violet-700">Kryształ Ładu</p>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-slate-600">
                Kryształ utrzymujący porządek liczb pękł na cztery części. Liczworki zgubiły drogę do swoich krain.
                <b> Nie walczysz z nimi</b> — Kapsuła Mocy skanuje poprawną liczbę i bezpiecznie otwiera portal do domu.
              </p>
              <div className="mt-4 grid gap-3 text-left sm:grid-cols-3">
                <div className="rounded-2xl bg-cyan-50 p-3 text-sm font-bold text-cyan-950"><span className="text-xl">👀</span><br />Najpierw sprawdź wszystkie liczby.</div>
                <div className="rounded-2xl bg-violet-50 p-3 text-sm font-bold text-violet-950"><span className="text-xl">◉</span><br />Dotknij celu, aby wykonać rzut.</div>
                <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-950"><span className="text-xl">📡</span><br />Skaner pomaga, ale przerywa idealną serię.</div>
              </div>
              <div className="mx-auto mt-4 max-w-md rounded-2xl bg-slate-100 p-3 text-sm font-semibold text-slate-700">
                Przykład: dla reguły „podzielne przez 5” łapiemy <b className="text-emerald-700">20</b>, ale zostawiamy <b className="text-rose-700">23</b>.
              </div>
              <GameDifficultyPicker value={difficulty} onChange={setDifficulty} descriptions={DESCRIPTIONS} accent="violet" />
              <button type="button" onClick={start} className="mt-6 min-h-14 rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 px-8 text-lg font-black text-white shadow-lg">
                Poznaj historię →
              </button>
            </div>
          </div>
        ) : null}

        {status === "story" ? (
          <div className="absolute inset-0 z-40 flex items-end justify-end bg-gradient-to-r from-slate-950/10 via-slate-950/15 to-slate-950/75 p-4 sm:p-8">
            <div className="max-w-xl rounded-[2rem] border-2 border-cyan-100/70 bg-slate-950/88 p-6 text-white shadow-2xl backdrop-blur-md sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-200">Prolog · Noc Rozdarcia</p>
              <h2 className="mt-2 text-3xl font-black sm:text-5xl">Kryształ Ładu pękł.</h2>
              <p className="mt-4 leading-relaxed text-slate-200">
                Cztery fragmenty przeleciały przez portale. Bez nich Liczworki nie pamiętają, do których rodzin liczb należą.
                Każdy błędny rzut je płoszy, dlatego masz trzy serca i musisz działać uważnie.
              </p>
              <div className="mt-4 rounded-2xl border border-amber-200/40 bg-amber-200/10 p-4">
                <p className="text-xs font-black uppercase tracking-[.14em] text-amber-200">🦫 Chrupek, przewodnik wyprawy</p>
                <p className="mt-1 font-bold">„Rozpoznaj ich liczby. Każdy uratowany stworek odda Kryształowi odrobinę światła!”</p>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2" aria-label="Cztery krainy wyprawy">
                {CHAPTERS.map((item) => <div key={item.name} className="rounded-xl bg-white/10 p-2 text-center"><span className="text-2xl" aria-hidden>{item.icon}</span><span className="mt-1 block text-[9px] font-black uppercase text-cyan-100">{item.name}</span></div>)}
              </div>
              <button type="button" onClick={beginAdventure} className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-500 to-amber-400 px-7 text-lg font-black text-slate-950 shadow-[0_0_30px_rgba(34,211,238,.35)]">Wyrusz z Chrupkiem →</button>
            </div>
          </div>
        ) : null}

        {status === "playing" && round ? (
          <div className="absolute inset-0 z-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              {AMBIENT_SPARKS.map(([left, top], index) => <span key={`${left}-${top}`} className="number-ranger-ambient-spark absolute size-1.5 rounded-full bg-cyan-100 shadow-[0_0_12px_rgba(103,232,249,.9)]" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * 0.28}s` }} />)}
            </div>
            <header className="absolute inset-x-0 top-0 z-30 p-3 text-white sm:p-5">
              <div className="rounded-2xl border border-cyan-100/30 bg-slate-950/84 p-3 shadow-xl backdrop-blur-md sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-200">{chapter.icon} {chapter.name} · misja {roundIndex + 1}/{rounds.length}</p>
                    <h2 className="mt-1 text-xl font-black sm:text-3xl">{round.instruction}</h2>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 text-center">
                    <div className="rounded-xl bg-white/10 px-3 py-1.5"><span className="block text-[9px] font-black uppercase text-cyan-200">Czas</span><b className="font-mono">{formatMissionTime(elapsedSeconds)}</b></div>
                    <div className="rounded-xl bg-rose-950/70 px-3 py-1.5"><span className="block text-[9px] font-black uppercase text-rose-200">Życie</span><b aria-label={`${hearts} serca`}>{"❤️".repeat(hearts)}{"🖤".repeat(3 - hearts)}</b></div>
                    <div className="rounded-xl bg-white/10 px-3 py-1.5"><span className="block text-[9px] font-black uppercase text-cyan-200">Seria</span><b>×{streak}</b></div>
                    <div className="rounded-xl bg-amber-200 px-3 py-1.5 text-amber-950"><span className="block text-[9px] font-black uppercase">Złapano</span><b>{caughtInRound}/{round.targetCount}</b></div>
                    <button type="button" onClick={() => setSoundEnabled((value) => !value)} className="grid size-11 place-items-center rounded-xl bg-white/10 text-lg" aria-label={soundEnabled ? "Wyłącz dźwięk" : "Włącz dźwięk"}>{soundEnabled ? "🔊" : "🔇"}</button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Postęp łowów" aria-valuemin={0} aria-valuemax={100} aria-valuenow={missionProgress}>
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-amber-300 transition-[width] duration-500" style={{ width: `${missionProgress}%` }} />
                  </div>
                  <b className="min-w-10 text-right text-xs text-cyan-100">{missionProgress}%</b>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2" aria-label={`${completedFragments} z 4 fragmentów Kryształu Ładu`}>
                  <span className="mr-1 text-[9px] font-black uppercase tracking-[.14em] text-violet-200">Kryształ Ładu</span>
                  {CHAPTERS.map((item, index) => <span key={item.name} className={`grid size-7 rotate-45 place-items-center rounded-md border transition ${index < completedFragments ? "border-amber-100 bg-gradient-to-br from-cyan-300 via-white to-amber-300 shadow-[0_0_14px_rgba(251,191,36,.7)]" : index === roundIndex ? "border-cyan-200 bg-cyan-300/20 animate-pulse" : "border-white/20 bg-white/5"}`}><span className="-rotate-45 text-[10px]">{index < completedFragments ? "✦" : index + 1}</span></span>)}
                </div>
              </div>
            </header>

            <div className="absolute inset-x-0 bottom-24 top-32 sm:bottom-28 sm:top-36" aria-label="Polana stworków z liczbami">
              {round.creatures.map((creature, index) => {
                const caught = caughtIds.includes(creature.id);
                const highlighted = scannerActive && creature.correct && !caught;
                return (
                  <button
                    key={creature.id}
                    type="button"
                    onClick={() => throwCapsule(creature)}
                    disabled={caught || Boolean(throwing) || roundLocked}
                    aria-label={caught ? `Złapano liczbę ${creature.value}` : `Rzuć kapsułę w liczbę ${creature.value}`}
                    className={`number-ranger-creature absolute z-10 grid size-[4.5rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 font-black shadow-2xl transition sm:size-20 ${caught ? "scale-0 border-emerald-100 bg-emerald-300 opacity-0" : highlighted ? "border-cyan-100 bg-cyan-200 text-cyan-950 ring-8 ring-cyan-300/45" : "border-white/90 bg-slate-950/85 text-white hover:scale-110 hover:bg-violet-900"}`}
                    style={{ left: `${creature.left}%`, top: `${creature.top}%`, animationDelay: `${creature.delay}s` }}
                  >
                    <span className="absolute -top-5 text-2xl drop-shadow-lg" aria-hidden>{CREATURE_SYMBOLS[index]}</span>
                    <span className="text-base sm:text-lg">{creature.value.toLocaleString("pl-PL")}</span>
                    <span className="absolute -bottom-2 h-2 w-10 rounded-full bg-cyan-300/30 blur-sm" aria-hidden />
                    {reactionId === creature.id ? <span className="number-ranger-reaction absolute -right-3 -top-8 grid size-9 place-items-center rounded-full bg-rose-200 text-xl text-rose-950 shadow-xl" aria-hidden>!</span> : null}
                  </button>
                );
              })}

              {burst ? <div key={burst.id} className="number-ranger-capture-burst pointer-events-none absolute z-30 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-cyan-100 text-4xl text-white shadow-[0_0_45px_rgba(34,211,238,.95)]" style={{ left: `${burst.left}%`, top: `${burst.top}%` }} aria-hidden><span>✦</span></div> : null}

              {throwing ? (
                <>
                  <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                    <line x1="50%" y1="94%" x2={`${throwing.left}%`} y2={`${throwing.top}%`} stroke="rgba(165,243,252,.65)" strokeWidth="3" strokeDasharray="8 10" />
                  </svg>
                  <div
                    className="absolute z-40 size-11 rounded-full border-4 border-cyan-100 bg-gradient-to-br from-amber-300 via-teal-400 to-violet-600 shadow-[0_0_28px_rgba(34,211,238,.9)] transition-all duration-500 ease-out"
                    style={{ left: throwing.launched ? `${throwing.left}%` : "50%", top: throwing.launched ? `${throwing.top}%` : "94%", transform: `translate(-50%, -50%) rotate(${throwing.launched ? 620 : 0}deg) scale(${throwing.launched ? 0.75 : 1})` }}
                    aria-hidden
                  >
                    <span className="absolute inset-[30%] rounded-full border-2 border-white/90 bg-slate-950/70" />
                  </div>
                </>
              ) : null}
            </div>

            {feedback ? (
              <p role="status" className={`absolute left-1/2 top-[29%] z-40 w-[min(90%,620px)] -translate-x-1/2 rounded-2xl p-3 text-center font-black shadow-2xl ${feedback.tone === "correct" ? "bg-emerald-200 text-emerald-950" : feedback.tone === "wrong" ? "bg-rose-200 text-rose-950" : "bg-cyan-100 text-cyan-950"}`}>
                {feedback.message}
              </p>
            ) : null}

            <div className="absolute inset-x-0 bottom-3 z-30 mx-auto grid w-[94%] gap-2 sm:grid-cols-[1fr_auto]">
              <div className="rounded-2xl border border-cyan-100/30 bg-slate-950/86 p-3 text-white shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div><span className="block text-[9px] font-black uppercase tracking-[.14em] text-cyan-200">Kapsuły Mocy</span><div className="mt-1 flex min-h-5 gap-1.5" aria-label={`${capsules} kapsuł`}>{capsuleDots.map((dot) => <span key={dot} className="size-4 rounded-full border-2 border-cyan-100 bg-gradient-to-br from-amber-300 to-violet-500" />)}</div></div>
                  <p className="text-right text-xs font-bold text-slate-200">{remainingTargets === 1 ? "Został 1 właściwy stworek." : `Zostały ${remainingTargets} właściwe stworki.`}<br /><span className="text-cyan-200">Dotknij liczby, aby rzucić.</span></p>
                </div>
              </div>
              <button type="button" onClick={useScanner} disabled={scannerActive || roundLocked || Boolean(throwing)} className="min-h-16 rounded-2xl border-2 border-amber-100 bg-amber-300 px-5 font-black text-amber-950 shadow-xl disabled:opacity-50">📡 Skaner</button>
            </div>
          </div>
        ) : null}

        {status === "chapter" && round ? (
          <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
            <div className="max-w-xl rounded-[2rem] border-4 border-cyan-100 bg-slate-950/92 p-7 text-center text-white shadow-[0_0_60px_rgba(34,211,238,.35)] sm:p-9">
              <div className="number-ranger-fragment mx-auto grid size-24 rotate-45 place-items-center rounded-2xl border-4 border-amber-100 bg-gradient-to-br from-cyan-300 via-white to-amber-300 shadow-[0_0_45px_rgba(251,191,36,.75)]" aria-hidden><span className="-rotate-45 text-5xl text-violet-700">✦</span></div>
              <p className="mt-7 text-xs font-black uppercase tracking-[.2em] text-cyan-200">Rozdział {roundIndex + 1} ukończony</p>
              <h2 className="mt-2 text-4xl font-black">Fragment Kryształu odzyskany!</h2>
              <p className="mt-3 leading-relaxed text-slate-200">{round.explanation} Dzięki poprawnym wyborom Liczworki wróciły do domu, a Kryształ odzyskał część swojej mocy.</p>
              <div className="mt-5 flex justify-center gap-3" aria-label={`${completedFragments} z 4 fragmentów zebranych`}>
                {CHAPTERS.map((item, index) => <span key={item.name} className={`grid size-12 rotate-45 place-items-center rounded-xl border-2 ${index < completedFragments ? "border-amber-100 bg-gradient-to-br from-cyan-300 to-amber-300 text-violet-900" : "border-white/20 bg-white/5 text-white/40"}`}><span className="-rotate-45 text-xl">{index < completedFragments ? "✦" : index + 1}</span></span>)}
              </div>
              <div className="mt-6 rounded-2xl bg-white/10 p-4 text-left"><p className="text-xs font-black uppercase tracking-[.14em] text-amber-200">Następna kraina</p><p className="mt-1 text-xl font-black">{CHAPTERS[roundIndex + 1]?.icon} {CHAPTERS[roundIndex + 1]?.name}</p><p className="mt-1 text-sm text-slate-300">{CHAPTERS[roundIndex + 1]?.lore}</p></div>
              <button type="button" onClick={continueAdventure} className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-amber-300 px-6 text-lg font-black text-slate-950">Otwórz następny portal →</button>
            </div>
          </div>
        ) : null}

        {status === "camp" && round ? (
          <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-[3px]">
            <div className="max-w-xl rounded-[2rem] border-4 border-amber-200 bg-white/96 p-7 text-center shadow-2xl sm:p-9">
              <div className="text-6xl" aria-hidden>🏕️</div>
              <p className="mt-2 text-xs font-black uppercase tracking-[.2em] text-amber-700">Obóz ratunkowy Chrupka</p>
              <h2 className="mt-2 text-4xl font-black text-slate-950">Spokojnie, odnawiamy serca.</h2>
              <p className="mt-3 leading-relaxed text-slate-600">Liczworki są bezpieczne. Wrócisz do początku tej krainy z trzema sercami i nowym zapasem kapsuł.</p>
              <div className="mt-5 rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4 text-left text-cyan-950"><p className="text-xs font-black uppercase tracking-[.14em] text-cyan-700">🦫 Wskazówka Chrupka</p><p className="mt-1 font-bold">{round.explanation}</p></div>
              <div className="mt-4 text-3xl" aria-label="Trzy odnowione serca">❤️ ❤️ ❤️</div>
              <button type="button" onClick={restartRoundFromCamp} className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 text-lg font-black text-amber-950">Wróć do misji z pełnym życiem →</button>
            </div>
          </div>
        ) : null}

        {status === "complete" ? (
          <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-[3px]">
            <div className="max-w-xl rounded-[2rem] border-4 border-amber-200 bg-white/95 p-8 text-center shadow-[0_0_70px_rgba(251,191,36,.45)]">
              <div className="number-ranger-restored-crystal mx-auto grid size-28 rotate-45 place-items-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-cyan-300 via-white to-amber-300 shadow-[0_0_55px_rgba(103,232,249,.9)]" aria-hidden><span className="-rotate-45 text-6xl text-violet-700">✦</span></div>
              <p className="mt-1 text-2xl" aria-label={`${mistakes === 0 && hints === 0 ? 3 : mistakes <= 2 ? 2 : 1} gwiazdki`}>{mistakes === 0 && hints === 0 ? "⭐⭐⭐" : mistakes <= 2 ? "⭐⭐☆" : "⭐☆☆"}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-[.2em] text-violet-700">Finał kampanii</p>
              <h2 className="mt-1 text-4xl font-black text-slate-950">Kryształ Ładu znów świeci!</h2>
              <p className="mt-3 text-lg text-slate-600">Wszystkie Liczworki wróciły do swoich krain. Rozpoznane okazy: <b>{score}/{totalTargets}</b> · nietrafione rzuty: <b>{mistakes}</b> · skanery: <b>{hints}</b>.</p>
              {mistakes === 0 && hints === 0 && rewardEnabled ? (
                <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">
                  {rewardStatus === "saving" ? "Zapisuję nagrodę…" : rewardStatus === "awarded" ? "🏆 Pierwsze idealne łowy — zdobywasz 5 punktów!" : rewardStatus === "already-awarded" ? "Idealne łowy! Nagroda jest już zapisana." : rewardStatus === "error" ? "Nie udało się teraz zapisać punktów." : "Idealna seria!"}
                </p>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-violet-50 p-3"><span className="block text-xs font-black uppercase text-violet-700">Najlepsza seria</span><b className="text-2xl">×{bestStreak}</b></div><div className="rounded-2xl bg-cyan-50 p-3"><span className="block text-xs font-black uppercase text-cyan-700">Czas</span><b className="font-mono text-2xl">{formatMissionTime(finalSeconds)}</b></div></div>
              <div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={start} className="min-h-12 rounded-xl bg-violet-600 px-6 font-black text-white">Zagraj ponownie</button><button type="button" onClick={() => setStatus("intro")} className="min-h-12 rounded-xl border-2 border-slate-300 px-6 font-black text-slate-700">Zmień poziom</button></div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
