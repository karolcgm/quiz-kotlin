"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PremiumSimulationFrame,
  type PremiumSimulationMode,
} from "@/components/simulations/premium/PremiumSimulationFrame";

type MemoryTheme = "flat" | "solid";

interface MemoryCard {
  id: string;
  pairId: string;
  kind: "shape" | "label";
  label: string;
  revealed: boolean;
  matched: boolean;
}

const FLAT_SHAPES = [
  { id: "triangle", label: "Trójkąt", emoji: "△", color: "from-rose-400 to-orange-400" },
  { id: "square", label: "Kwadrat", emoji: "□", color: "from-indigo-400 to-violet-500" },
  { id: "rectangle", label: "Prostokąt", emoji: "▭", color: "from-cyan-400 to-blue-500" },
  { id: "circle", label: "Koło", emoji: "○", color: "from-emerald-400 to-teal-500" },
  { id: "pentagon", label: "Pięciokąt", emoji: "⬠", color: "from-amber-400 to-orange-500" },
  { id: "hexagon", label: "Sześciokąt", emoji: "⬡", color: "from-fuchsia-400 to-pink-500" },
];

const SOLID_SHAPES = [
  { id: "cube", label: "Sześcian", emoji: "🧊", color: "from-slate-400 to-slate-600" },
  { id: "sphere", label: "Kula", emoji: "⚪", color: "from-sky-300 to-blue-500" },
  { id: "cylinder", label: "Walec", emoji: "🛢", color: "from-amber-300 to-orange-500" },
  { id: "cone", label: "Stożek", emoji: "🔺", color: "from-rose-300 to-red-500" },
  { id: "pyramid", label: "Ostrosłup", emoji: "🔶", color: "from-violet-300 to-purple-600" },
  { id: "prism", label: "Graniastosłup", emoji: "📦", color: "from-teal-300 to-emerald-600" },
];

function buildDeck(theme: MemoryTheme): MemoryCard[] {
  const shapes = theme === "solid" ? SOLID_SHAPES : FLAT_SHAPES;
  const picked = shapes.slice(0, 6);
  const cards: MemoryCard[] = [];

  for (const shape of picked) {
    cards.push({
      id: `${shape.id}-shape`,
      pairId: shape.id,
      kind: "shape",
      label: shape.emoji,
      revealed: false,
      matched: false,
    });
    cards.push({
      id: `${shape.id}-label`,
      pairId: shape.id,
      kind: "label",
      label: shape.label,
      revealed: false,
      matched: false,
    });
  }

  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export function GeometryMemorySimulator() {
  const [mode, setMode] = useState<PremiumSimulationMode>("demo");
  const [theme, setTheme] = useState<MemoryTheme>("flat");
  const [cards, setCards] = useState<MemoryCard[]>(() => buildDeck("flat"));
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [moves, setMoves] = useState(0);
  const [exerciseScore, setExerciseScore] = useState({ correct: 0, total: 0 });
  const [dealPhase, setDealPhase] = useState(true);

  const matchedCount = useMemo(() => cards.filter((c) => c.matched).length / 2, [cards]);
  const totalPairs = cards.length / 2;

  const resetGame = useCallback((nextTheme = theme) => {
    setCards(buildDeck(nextTheme));
    setSelected([]);
    setBusy(false);
    setMoves(0);
    setFeedback(null);
    setDealPhase(true);
    window.setTimeout(() => setDealPhase(false), 900);
  }, [theme]);

  useEffect(() => {
    resetGame(theme);
  }, [theme, mode, resetGame]);

  const flipCard = useCallback(
    (cardId: string) => {
      if (busy || mode === "demo") return;
      const card = cards.find((c) => c.id === cardId);
      if (!card || card.revealed || card.matched) return;

      const nextSelected = [...selected, cardId];
      const nextCards = cards.map((c) => (c.id === cardId ? { ...c, revealed: true } : c));
      setCards(nextCards);
      setSelected(nextSelected);

      if (nextSelected.length < 2) return;

      setBusy(true);
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextSelected;
      const first = nextCards.find((c) => c.id === firstId)!;
      const second = nextCards.find((c) => c.id === secondId)!;
      const isMatch =
        first.pairId === second.pairId && first.kind !== second.kind;

      window.setTimeout(() => {
        if (isMatch) {
          setCards((current) =>
            current.map((c) =>
              c.pairId === first.pairId ? { ...c, matched: true, revealed: true } : c,
            ),
          );
          setFeedback("Para pasuje! Świetna pamięć!");
          setFeedbackSuccess(true);
          if (mode === "exercise") {
            setExerciseScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
          }
        } else {
          setCards((current) =>
            current.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, revealed: false } : c,
            ),
          );
          setFeedback("Nie ta para — karty zakrywają się z powrotem.");
          setFeedbackSuccess(false);
          if (mode === "exercise") {
            setExerciseScore((s) => ({ ...s, total: s.total + 1 }));
          }
        }
        setSelected([]);
        setBusy(false);
      }, 900);
    },
    [busy, cards, mode, selected],
  );

  useEffect(() => {
    if (matchedCount === totalPairs && totalPairs > 0 && mode !== "demo") {
      setFeedback(`Ukończono grę w ${moves} ruchach!`);
      setFeedbackSuccess(true);
    }
  }, [matchedCount, totalPairs, moves, mode]);

  return (
    <PremiumSimulationFrame
      slug="memory-figury"
      title="Memory — figury geometryczne"
      subtitle="Dopasuj rysunek figury do jej nazwy. Wybierz bryły lub figury płaskie."
      mode={mode}
      onModeChange={setMode}
      feedback={feedback}
      feedbackSuccess={feedbackSuccess}
      score={exerciseScore}
      controls={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTheme("flat")}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${theme === "flat" ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
            >
              Figury płaskie
            </button>
            <button
              type="button"
              onClick={() => setTheme("solid")}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${theme === "solid" ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
            >
              Bryły
            </button>
          </div>
          <div className="flex gap-3 text-sm font-semibold text-slate-600">
            <span>Pary: {matchedCount}/{totalPairs}</span>
            <span>Ruchy: {moves}</span>
          </div>
          <button
            type="button"
            onClick={() => resetGame(theme)}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
          >
            Nowa rozgrywka
          </button>
        </div>
      }
    >
      {mode === "demo" && (
        <p className="mb-4 rounded-xl bg-indigo-50 px-4 py-3 text-center text-sm font-medium text-indigo-900">
          Tryb prezentacji — przełącz na Zadanie lub Ćwiczenie, aby grać w memory.
        </p>
      )}
      <div className="memory-grid grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {cards.map((card, index) => {
          const faceUp = card.revealed || card.matched || mode === "demo";
          const shapeMeta = (theme === "solid" ? SOLID_SHAPES : FLAT_SHAPES).find(
            (s) => s.id === card.pairId,
          );
          return (
            <button
              key={card.id}
              type="button"
              disabled={mode === "demo" || card.matched || busy}
              onClick={() => flipCard(card.id)}
              className={`memory-card relative min-h-[160px] w-full rounded-2xl transition duration-500 [transform-style:preserve-3d] sm:min-h-[200px] ${
                faceUp ? "memory-card-flipped" : ""
              } ${card.matched ? "memory-card-matched opacity-80" : ""} ${dealPhase ? "memory-card-deal" : ""}`}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div className="memory-card-back absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg">
                <span className="text-5xl font-black text-white/30 sm:text-6xl">LL</span>
              </div>
              <div
                className={`memory-card-front absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br ${shapeMeta?.color ?? "from-slate-400 to-slate-600"} p-4 shadow-lg sm:p-5`}
              >
                {card.kind === "shape" ? (
                  <span className="text-7xl leading-none sm:text-8xl">{card.label}</span>
                ) : (
                  <span className="px-2 text-center text-3xl font-black leading-tight text-white sm:text-4xl">
                    {card.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </PremiumSimulationFrame>
  );
}
