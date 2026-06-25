"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PremiumSimulationFrame,
  type PremiumSimulationMode,
} from "@/components/simulations/premium/PremiumSimulationFrame";
import { SetSortingItemVisual } from "@/components/simulations/premium/SetSortingItemVisual";
import {
  getSetSortingTheme,
  SET_SORTING_THEMES,
  shuffleItems,
  type SetItemDef,
  type SetSortingThemeId,
} from "@/lib/simulations/setSortingThemes";

type PlacementMap = Record<string, string>;

function initialPlacements(items: SetItemDef[]): PlacementMap {
  return Object.fromEntries(items.map((item) => [item.id, "pool"]));
}

function findBucketAtPoint(x: number, y: number): string | null {
  const element = document.elementFromPoint(x, y);
  if (!element) return null;
  const bucket = element.closest("[data-set-bucket-id]");
  return bucket?.getAttribute("data-set-bucket-id") ?? null;
}

export function SortingSetsSimulator() {
  const [mode, setMode] = useState<PremiumSimulationMode>("demo");
  const [themeId, setThemeId] = useState<SetSortingThemeId>("polygons-sides");
  const theme = useMemo(() => getSetSortingTheme(themeId), [themeId]);
  const [items, setItems] = useState<SetItemDef[]>(() => theme.items);
  const [placements, setPlacements] = useState<PlacementMap>(() => initialPlacements(theme.items));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoverBucketId, setHoverBucketId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [exerciseScore, setExerciseScore] = useState({ correct: 0, total: 0 });
  const dragMovedRef = useRef(false);

  const resetTheme = useCallback(
    (nextThemeId: SetSortingThemeId, shuffle = false) => {
      const nextTheme = getSetSortingTheme(nextThemeId);
      const nextItems = shuffle ? shuffleItems(nextTheme.items) : nextTheme.items;
      setItems(nextItems);
      setPlacements(initialPlacements(nextItems));
      setSelectedId(null);
      setDraggingId(null);
      setDragPosition(null);
      setHoverBucketId(null);
      setFeedback(null);
      setFeedbackSuccess(false);
    },
    [],
  );

  useEffect(() => {
    resetTheme(themeId, mode !== "demo");
  }, [themeId, mode, resetTheme]);

  const assignItem = useCallback((itemId: string, bucketId: string) => {
    setPlacements((current) => ({ ...current, [itemId]: bucketId }));
    setSelectedId(null);
    setFeedback(null);
  }, []);

  const itemsInBucket = useCallback(
    (bucketId: string) => items.filter((item) => placements[item.id] === bucketId),
    [items, placements],
  );

  const poolItems = itemsInBucket("pool");

  const checkSorting = useCallback(() => {
    const sorted = items.filter((item) => placements[item.id] !== "pool");
    if (sorted.length < items.length) {
      setFeedback(`Na stole zostało jeszcze ${items.length - sorted.length} elementów do przypisania.`);
      setFeedbackSuccess(false);
      return;
    }

    const wrong = sorted.filter((item) => placements[item.id] !== item.correctBucketId);
    if (wrong.length === 0) {
      setFeedback("Idealnie! Wszystkie elementy trafiły do właściwych zbiorów!");
      setFeedbackSuccess(true);
      if (mode === "exercise") {
        setExerciseScore((score) => ({ correct: score.correct + 1, total: score.total + 1 }));
        window.setTimeout(() => {
          const nextTheme = SET_SORTING_THEMES[Math.floor(Math.random() * SET_SORTING_THEMES.length)];
          setThemeId(nextTheme.id);
        }, 1500);
      }
    } else {
      setFeedback(`Prawie — ${wrong.length} elementów jest w złym zbiorze. Popraw i sprawdź ponownie.`);
      setFeedbackSuccess(false);
      if (mode === "exercise") {
        setExerciseScore((score) => ({ ...score, total: score.total + 1 }));
      }
    }
  }, [items, mode, placements]);

  const showHints = mode === "demo";

  function handleItemPointerDown(itemId: string, event: React.PointerEvent<HTMLButtonElement>) {
    if (mode === "demo") {
      setSelectedId(itemId);
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragMovedRef.current = false;
    setDraggingId(itemId);
    setDragPosition({ x: event.clientX, y: event.clientY });
    setSelectedId(itemId);
  }

  function handleItemPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!draggingId) return;
    dragMovedRef.current = true;
    setDragPosition({ x: event.clientX, y: event.clientY });
    setHoverBucketId(findBucketAtPoint(event.clientX, event.clientY));
  }

  function handleItemPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    if (!draggingId) return;
    const bucketId = findBucketAtPoint(event.clientX, event.clientY);
    if (bucketId && bucketId !== "pool") {
      assignItem(draggingId, bucketId);
    } else if (!dragMovedRef.current && selectedId) {
      setSelectedId(draggingId);
    }
    setDraggingId(null);
    setDragPosition(null);
    setHoverBucketId(null);
  }

  function renderDraggableItem(item: SetItemDef, compact = false) {
    const isSelected = selectedId === item.id;
    const isDragging = draggingId === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onPointerDown={(event) => handleItemPointerDown(item.id, event)}
        onPointerMove={handleItemPointerMove}
        onPointerUp={handleItemPointerUp}
        onPointerCancel={handleItemPointerUp}
        className={`set-sort-item touch-none rounded-2xl border bg-white p-2 shadow-md transition ${
          compact ? "p-1.5" : "p-3"
        } ${isSelected ? "border-indigo-500 ring-4 ring-indigo-200" : "border-slate-200"} ${
          isDragging ? "opacity-40" : "hover:-translate-y-0.5 hover:shadow-lg"
        }`}
        aria-label={item.label}
      >
        <SetSortingItemVisual item={item} />
        {!compact && (
          <p className="mt-2 text-center text-xs font-bold text-slate-700">{item.label}</p>
        )}
      </button>
    );
  }

  return (
    <PremiumSimulationFrame
      slug="zbiory-sortowanie"
      title="Zbiory — sortowanie palcem"
      subtitle={theme.description}
      mode={mode}
      onModeChange={setMode}
      feedback={feedback}
      feedbackSuccess={feedbackSuccess}
      score={exerciseScore}
      controls={
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SET_SORTING_THEMES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setThemeId(option.id)}
                className={`rounded-xl px-3 py-2 text-xs font-bold sm:text-sm ${
                  themeId === option.id
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {option.title}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-600">
            {mode === "demo"
              ? "Tryb prezentacji: kliknij element, potem zbiór — albo przeciągnij palcem."
              : "Przeciągnij każdy element do właściwego zbioru, potem naciśnij Sprawdź."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => resetTheme(themeId, mode !== "demo")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
            >
              Potasuj / reset
            </button>
            {mode !== "demo" && (
              <button
                type="button"
                onClick={checkSorting}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white"
              >
                Sprawdź
              </button>
            )}
            {mode === "demo" && selectedId && (
              <button
                type="button"
                onClick={() => assignItem(selectedId, "pool")}
                className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold text-white"
              >
                Wróć na stół
              </button>
            )}
          </div>
        </div>
      }
    >
      <div
        className={`grid gap-4 ${theme.buckets.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}
      >
        {theme.buckets.map((bucket) => {
          const bucketItems = itemsInBucket(bucket.id);
          const isHover = hoverBucketId === bucket.id;
          return (
            <div
              key={bucket.id}
              data-set-bucket-id={bucket.id}
              onPointerUp={() => {
                if (mode === "demo" && selectedId) {
                  assignItem(selectedId, bucket.id);
                }
              }}
              className={`min-h-[180px] rounded-[1.5rem] border-2 border-dashed p-4 transition sm:min-h-[220px] ${
                isHover ? "border-indigo-500 bg-indigo-50/80 scale-[1.01]" : "border-white/40 bg-white/50"
              }`}
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-r px-4 py-2 ${bucket.gradient}`}>
                <div>
                  <p className="text-sm font-black text-white sm:text-base">{bucket.label}</p>
                  {showHints && <p className="text-xs text-white/80">{bucket.hint}</p>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {bucketItems.map((item) => renderDraggableItem(item, true))}
                {bucketItems.length === 0 && (
                  <p className="text-sm font-medium text-slate-400">Upuść tutaj</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        data-set-bucket-id="pool"
        className="mt-6 rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-slate-50/80 p-5"
      >
        <p className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Stół — elementy do sortowania</p>
        <div className="flex flex-wrap justify-center gap-4">
          {poolItems.map((item) => renderDraggableItem(item))}
          {poolItems.length === 0 && (
            <p className="py-8 text-sm font-medium text-slate-400">Wszystko posortowane — sprawdź odpowiedź!</p>
          )}
        </div>
      </div>

      {draggingId && dragPosition && (
        <div
          className="pointer-events-none fixed z-50 rounded-2xl border-2 border-indigo-400 bg-white p-3 shadow-2xl"
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
            transform: "translate(-50%, -50%) scale(1.05)",
          }}
        >
          <SetSortingItemVisual item={items.find((item) => item.id === draggingId)!} />
        </div>
      )}
    </PremiumSimulationFrame>
  );
}
