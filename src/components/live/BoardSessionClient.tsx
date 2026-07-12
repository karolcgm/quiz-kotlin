"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BoardConnectionBadge } from "@/components/live/BoardConnectionBadge";
import { BoardEndedSummary } from "@/components/live/BoardEndedSummary";
import { BoardLobby } from "@/components/live/BoardLobby";
import { BoardPauseOverlay } from "@/components/live/BoardPauseOverlay";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { changeLessonSessionStageAction, endLessonSessionAction } from "@/lib/actions/lessonSessions";
import { completeTopicFromLessonSessionAction } from "@/lib/actions/curriculumPlans";
import { useBoardSessionSync } from "@/lib/live/useBoardSessionSync";
import type { LessonSessionBoardView } from "@/types/lessonSession";

interface BoardSessionClientProps {
  sessionId: string;
  initialView: LessonSessionBoardView;
  joinCode?: string | null;
  startPresentation?: boolean;
}

export function BoardSessionClient({ sessionId, initialView, joinCode, startPresentation = false }: BoardSessionClientProps) {
  const { view, connection, refresh } = useBoardSessionSync(sessionId, initialView);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commandPending, setCommandPending] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    const node = containerRef.current;
    if (!node) return;

    if (!document.fullscreenElement) {
      await node.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!startPresentation || document.fullscreenElement || !containerRef.current) return;
    void containerRef.current.requestFullscreen?.().catch(() => undefined);
  }, [startPresentation]);

  const showStage =
    view.status !== "lobby" && view.status !== "ended" && view.activeStage !== null;

  const moveStage = async (stageIndex: number) => {
    setCommandPending(true);
    try {
      await changeLessonSessionStageAction({ sessionId, stageIndex });
      await refresh();
    } finally {
      setCommandPending(false);
    }
  };

  const endSession = async () => {
    if (!window.confirm("Zakończyć lekcję Live?")) return;
    setCommandPending(true);
    try {
      await endLessonSessionAction(sessionId, true);
      await completeTopicFromLessonSessionAction(sessionId);
      await refresh();
    } finally {
      setCommandPending(false);
    }
  };

  return (
    <div ref={containerRef} className="group/board flex min-h-screen flex-col bg-slate-950" data-board-presentation={isFullscreen || undefined}>
      {!isFullscreen ? <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{view.lessonTitle}</p>
          <p className="text-xs text-slate-400">{view.topicId}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <BoardConnectionBadge state={connection} />
          {connection === "offline" ? (
            <button
              type="button"
              onClick={() => void refresh()}
              className="min-h-10 rounded-xl border border-white/20 px-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Połącz ponownie
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="min-h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {isFullscreen ? "Wyjdź z pełnego ekranu" : "Pełny ekran"}
          </button>
        </div>
      </header> : null}

      {isFullscreen ? (
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className="absolute right-5 top-5 z-30 min-h-11 rounded-xl border border-white/15 bg-slate-950/70 px-4 text-sm font-semibold text-white opacity-0 shadow-lg backdrop-blur transition group-hover/board:opacity-100 focus:opacity-100"
        >
          Wyjdź z pełnego ekranu (Esc)
        </button>
      ) : null}

      {startPresentation && !isFullscreen ? (
        <div className="absolute right-5 top-5 z-30">
          <button type="button" onClick={() => void toggleFullscreen()} className="min-h-12 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-xl hover:bg-indigo-500">Pełny ekran</button>
        </div>
      ) : null}

      <main onDoubleClick={() => void toggleFullscreen()} className="relative flex flex-1 flex-col justify-center overflow-auto" aria-label="Obszar prezentacji — kliknij dwukrotnie, aby przełączyć pełny ekran">
        {view.status === "lobby" ? (
          <BoardLobby
            sessionId={sessionId}
            lessonTitle={view.lessonTitle}
            topicId={view.topicId}
            studentGoal={view.studentGoal}
            joinCode={joinCode}
            stageCount={view.stageCount}
          />
        ) : null}

        {view.status === "ended" ? (
          <BoardEndedSummary
            lessonTitle={view.lessonTitle}
            topicId={view.topicId}
            stageSummaries={view.stageSummaries}
            participantCount={view.participantCount}
          />
        ) : null}

        {showStage && view.activeStage ? (
          <BoardStageDisplay
            stage={view.activeStage}
            stageIndex={view.activeStageIndex}
            stageCount={view.stageCount}
            solutionRevealed={view.solutionRevealed}
            summary={view.activeStageSummary}
          />
        ) : null}

        {view.boardOnlyMode ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4">
            <p className="rounded-full bg-slate-800/90 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10">
              Tryb tylko tablica — tablety wstrzymane
            </p>
          </div>
        ) : null}
      </main>

      {(isFullscreen || startPresentation) && showStage ? (
        <footer className="shrink-0 border-t border-white/15 bg-slate-950 px-4 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" disabled={commandPending || view.activeStageIndex <= 0} onClick={() => void moveStage(view.activeStageIndex - 1)} className="min-h-12 rounded-xl border border-white/20 px-4 text-sm font-bold text-white disabled:opacity-40">← Poprzedni</button>
            {view.activeStageIndex < view.stageCount - 1 ? <button type="button" disabled={commandPending} onClick={() => void moveStage(view.activeStageIndex + 1)} className="min-h-12 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white disabled:opacity-40">Następny →</button> : <button type="button" disabled={commandPending} onClick={() => void endSession()} className="min-h-12 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white disabled:opacity-40">Zakończ lekcję</button>}
          </div>
        </footer>
      ) : null}

      {view.status === "paused" ? <BoardPauseOverlay /> : null}

      {connection === "offline" && view.status !== "ended" ? (
        <div className="border-t border-rose-500/30 bg-rose-950/40 px-4 py-2 text-center text-sm text-rose-100">
          Utracono połączenie — wyświetlamy ostatni znany etap. Przywracamy synchronizację…
        </div>
      ) : null}
    </div>
  );
}
