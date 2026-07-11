"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { JoinCodeQr } from "@/components/live/JoinCodeQr";
import { TeacherSessionHistogram } from "@/components/live/TeacherSessionHistogram";
import { TeacherSessionParticipants } from "@/components/live/TeacherSessionParticipants";
import { TeacherSessionStageRail } from "@/components/live/TeacherSessionStageRail";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  changeLessonSessionStageAction,
  endLessonSessionAction,
  getLessonSessionExpiryAction,
  pauseLessonSessionAction,
  rotateLessonJoinCodeAction,
  setLessonSessionBoardOnlyModeAction,
  startLessonSessionAction,
} from "@/lib/actions/lessonSessions";
import { completeTopicFromLessonSessionAction } from "@/lib/actions/curriculumPlans";
import { buildBoardUrl, buildStudentJoinUrl } from "@/lib/live/boardView";
import { readStoredJoinCode, storeJoinCode } from "@/lib/live/teacherView";
import { useTeacherSessionSync } from "@/lib/live/useTeacherSessionSync";
import type { LessonSessionTeacherView } from "@/types/lessonSession";

interface TeacherSessionClientProps {
  sessionId: string;
  initialView: LessonSessionTeacherView;
  initialJoinCode?: string | null;
  initialExpiresAt?: string | null;
}

function formatElapsed(startedAt: string | null): string {
  if (!startedAt) return "—";
  const start = new Date(startedAt).getTime();
  const minutes = Math.max(0, Math.floor((Date.now() - start) / 60000));
  return `${minutes} min`;
}

export function TeacherSessionClient({
  sessionId,
  initialView,
  initialJoinCode,
  initialExpiresAt,
}: TeacherSessionClientProps) {
  const { view, connection, refresh, applyView } = useTeacherSessionSync(sessionId, initialView);
  const [joinCode, setJoinCode] = useState(
    () => initialJoinCode ?? readStoredJoinCode(sessionId) ?? null,
  );
  const [commandError, setCommandError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt ?? null);
  const [now, setNow] = useState(() => Date.now());
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [recordSkillEvidence, setRecordSkillEvidence] = useState(true);
  const [markTopicCompleted, setMarkTopicCompleted] = useState(true);
  const [pending, startTransition] = useTransition();

  const stages = view.stageSnapshot.stages;
  const liveMinutes = stages.reduce((sum, stage) => sum + (stage.liveMinutes ?? stage.estimatedMinutes), 0);
  const activeStage = stages[view.activeStageIndex] ?? null;
  const isEnded = view.status === "ended";
  const isPaused = view.status === "paused";
  const isLobby = view.status === "lobby";
  const remainingSeconds = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000)) : null;

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const expectedOperatorIndex = useMemo(() => {
    if (!activeStage) return null;
    const questionId = activeStage.questions[0]?.questionInstanceId;
    if (!questionId) return null;
    const keyEntry = view.answerKey.questions.find((entry) => entry.questionInstanceId === questionId);
    return keyEntry?.answerSpec.firstStepOperatorIndex ?? null;
  }, [activeStage, view.answerKey.questions]);

  const boardHref = useMemo(
    () => buildBoardUrl(sessionId, joinCode ?? undefined),
    [sessionId, joinCode],
  );

  const runCommand = (
    command: () => Promise<{
      ok: boolean;
      error?: string;
      sequenceNumber?: number;
      status?: string;
      activeStageIndex?: number;
      solutionRevealed?: boolean;
    }>,
  ) => {
    setCommandError(null);
    startTransition(async () => {
      const result = await command();
      if (!result.ok) {
        setCommandError(result.error ?? "Operacja nie powiodła się.");
        return;
      }
      if (result.sequenceNumber !== undefined) {
        applyView({
          sequenceNumber: result.sequenceNumber,
          status: (result.status as LessonSessionTeacherView["status"]) ?? view.status,
          activeStageIndex: result.activeStageIndex ?? view.activeStageIndex,
          solutionRevealed: result.solutionRevealed ?? view.solutionRevealed,
        });
      }
      await refresh();
      setExpiresAt(await getLessonSessionExpiryAction(sessionId));
    });
  };

  const handleRotateCode = () => {
    startTransition(async () => {
      setCommandError(null);
      const result = await rotateLessonJoinCodeAction(sessionId);
      if (!result.ok || !result.joinCode) {
        setCommandError(result.error ?? "Nie udało się wygenerować kodu.");
        return;
      }
      setJoinCode(result.joinCode);
      storeJoinCode(sessionId, result.joinCode);
    });
  };

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="learn">Pulpit sesji</Badge>
          <Badge tone="brand">{view.topicId}</Badge>
          <Badge tone={isEnded ? "assess" : isPaused ? "warning" : "success"}>{view.status}</Badge>
          {view.boardOnlyMode ? <Badge tone="warning">Tylko tablica</Badge> : null}
          <span className="text-xs text-slate-500">
            seq {view.sequenceNumber} · {connection}
          </span>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[var(--ink)]">{view.lessonTitle}</h1>
            <p className="text-sm text-[var(--ink-muted)]">
              {view.schoolName} · {view.className} / {view.groupName}
            </p>
            <p className="text-sm text-[var(--ink-muted)]">
              Segment Live: {liveMinutes} min · slajd {view.activeStageIndex + 1} z {stages.length} · czas: {formatElapsed(view.startedAt)}
            </p>
            <p className={`text-sm font-bold ${remainingSeconds !== null && remainingSeconds <= 300 ? "text-rose-700" : "text-indigo-700"}`}>
              {isEnded ? "Sesja zakończona" : remainingSeconds === null ? "Limit 45 minut rozpocznie się po kliknięciu „Rozpocznij segment”" : `Do automatycznego zakończenia: ${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={boardHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Otwórz tablicę
            </Link>
            <Link
              href={`${boardHref}${boardHref.includes("?") ? "&" : "?"}presentation=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Pełny ekran na tablicy
            </Link>
            <button
              type="button"
              disabled={pending || isEnded}
              onClick={handleRotateCode}
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >
              Nowy kod
            </button>
          </div>
        </div>
      </header>

      {commandError ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800" role="alert">
          {commandError}
        </p>
      ) : null}

      <Card className="space-y-4">
        <TeacherSessionStageRail
          stages={stages}
          activeIndex={view.activeStageIndex}
          disabled={pending || isEnded}
          onSelect={(index) =>
            runCommand(() =>
              changeLessonSessionStageAction({
                sessionId,
                stageIndex: index,
              }),
            )
          }
        />

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={pending || isEnded || view.activeStageIndex <= 0}
            onClick={() =>
              runCommand(() =>
                changeLessonSessionStageAction({
                  sessionId,
                  stageIndex: view.activeStageIndex - 1,
                }),
              )
            }
            className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            Wstecz
          </button>
          <button
            type="button"
            disabled={pending || isEnded || view.activeStageIndex >= stages.length - 1}
            onClick={() =>
              runCommand(() =>
                changeLessonSessionStageAction({
                  sessionId,
                  stageIndex: view.activeStageIndex + 1,
                }),
              )
            }
            className="min-h-11 rounded-xl bg-[var(--brand-600)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-700)] disabled:opacity-50"
          >
            Dalej
          </button>
          {isLobby ? (
            <button
              type="button"
              disabled={pending || isEnded}
              onClick={() => runCommand(() => startLessonSessionAction(sessionId))}
              className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Rozpocznij segment
            </button>
          ) : isPaused ? (
            <button
              type="button"
              disabled={pending || isEnded}
              onClick={() => runCommand(() => startLessonSessionAction(sessionId))}
              className="min-h-11 rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              Wznów
            </button>
          ) : (
            <button
              type="button"
              disabled={pending || isEnded || isLobby}
              onClick={() => runCommand(() => pauseLessonSessionAction(sessionId))}
              className="min-h-11 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            >
              Wstrzymaj segment
            </button>
          )}
          <button
            type="button"
            disabled={pending || isEnded || view.solutionRevealed}
            onClick={() =>
              runCommand(() =>
                changeLessonSessionStageAction({
                  sessionId,
                  stageIndex: view.activeStageIndex,
                  revealSolution: true,
                }),
              )
            }
            className="min-h-11 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
          >
            Odsłoń rozwiązanie
          </button>
          <button
            type="button"
            disabled={pending || isEnded}
            onClick={() =>
              runCommand(() => setLessonSessionBoardOnlyModeAction(sessionId, !view.boardOnlyMode))
            }
            className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            {view.boardOnlyMode ? "Włącz tablety" : "Tylko tablica"}
          </button>
          {!isEnded ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => setShowEndConfirm(true)}
              className="min-h-11 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-900 hover:bg-rose-100 disabled:opacity-50"
            >
              Zakończ
            </button>
          ) : (
            <Link
              href={`/nauczyciel/sesje/${sessionId}/podsumowanie`}
              className="inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Podsumowanie klasy
            </Link>
          )}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <Card className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Podgląd tablicy</h2>
            {activeStage ? (
              <div className="overflow-hidden rounded-2xl bg-slate-950 p-4">
                <BoardStageDisplay
                  stage={activeStage}
                  stageIndex={view.activeStageIndex}
                  stageCount={stages.length}
                  solutionRevealed={view.solutionRevealed}
                  summary={
                    view.activeStageSubmittedCount > 0
                      ? {
                          submittedCount: view.activeStageSubmittedCount,
                          correctCount: view.solutionRevealed
                            ? view.activeStageHistogram
                                .filter((bucket) => bucket.selectedOperatorIndex === expectedOperatorIndex)
                                .reduce((sum, bucket) => sum + bucket.count, 0)
                            : null,
                        }
                      : undefined
                  }
                />
              </div>
            ) : null}
          </Card>

          {isLobby && joinCode ? (
            <Card>
              <JoinCodeQr joinUrl={buildStudentJoinUrl(sessionId)} joinCode={joinCode} size={180} />
            </Card>
          ) : null}
        </div>

        <aside className="space-y-5">
          <Card>
            <TeacherSessionParticipants
              participants={view.participants}
              participantCount={view.participantCount}
            />
            {view.helpRequestedCount > 0 ? (
              <p className="mt-3 text-xs font-semibold text-amber-700">
                {view.helpRequestedCount} prośb o pomoc
              </p>
            ) : null}
          </Card>

          <Card>
            <TeacherSessionHistogram
              buckets={view.activeStageHistogram}
              expectedOperatorIndex={expectedOperatorIndex}
              solutionRevealed={view.solutionRevealed}
            />
          </Card>
        </aside>
      </div>

      {showEndConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Zakończyć lekcję?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Uczniowie nie będą mogli wysyłać odpowiedzi. Na tablicy pojawi się podsumowanie sesji.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300"
                checked={recordSkillEvidence}
                onChange={(event) => setRecordSkillEvidence(event.target.checked)}
              />
              <span className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Zapisz w mapie umiejętności</span>
                <span className="mt-0.5 block text-slate-600">
                  Niska waga (0,25) — sygnał diagnostyczny z lekcji na żywo, nie ocena.
                </span>
              </span>
            </label>
            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-emerald-300"
                checked={markTopicCompleted}
                onChange={(event) => setMarkTopicCompleted(event.target.checked)}
              />
              <span className="text-sm text-emerald-950">
                <span className="font-semibold">Oznacz temat jako wykonany</span>
                <span className="mt-0.5 block text-emerald-800">Zaktualizuje plan wyłącznie tej klasy.</span>
              </span>
            </label>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold"
                onClick={() => setShowEndConfirm(false)}
              >
                Anuluj
              </button>
              <button
                type="button"
                disabled={pending}
                className="min-h-11 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                onClick={() => {
                  setShowEndConfirm(false);
                  startTransition(async () => {
                    setCommandError(null);
                    const result = await endLessonSessionAction(sessionId, recordSkillEvidence);
                    if (!result.ok) {
                      setCommandError(result.error ?? "Nie udało się zakończyć sesji.");
                      return;
                    }
                    if (markTopicCompleted) {
                      try {
                        await completeTopicFromLessonSessionAction(sessionId);
                      } catch (error) {
                        setCommandError(error instanceof Error ? error.message : "Sesja zakończona, ale nie oznaczono tematu.");
                      }
                    }
                    await refresh();
                  });
                }}
              >
                Zakończ sesję
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
