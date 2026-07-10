"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  confirmPaperResultsAction,
  savePaperResultDraftAction,
} from "@/lib/actions/paperResults";
import type { AssessmentVersionCode } from "@/types/assessmentBlueprint";
import type {
  PaperResultRow,
  PaperResultsSlot,
  PaperResultsStudent,
} from "@/types/paperResults";

interface PaperResultsGridProps {
  lessonId: string;
  classId: string;
  assessmentVersionId: string;
  versionCode: AssessmentVersionCode;
  maxScore: number;
  slots: PaperResultsSlot[];
  students: PaperResultsStudent[];
  initialResults: PaperResultRow[];
}

function studentLabel(student: PaperResultsStudent): string {
  return (
    [student.first_name, student.last_name].filter(Boolean).join(" ") ||
    student.display_name ||
    student.email ||
    "Uczeń"
  );
}

function emptyItems(slots: PaperResultsSlot[]) {
  return slots.map((slot) => ({
    slotId: slot.slotId,
    position: slot.position,
    skillId: slot.skillId,
    score: 0,
    maxScore: slot.maxScore,
  }));
}

function buildInitialGrid(
  students: PaperResultsStudent[],
  slots: PaperResultsSlot[],
  initialResults: PaperResultRow[],
): Record<string, PaperResultRow> {
  const map: Record<string, PaperResultRow> = {};
  for (const student of students) {
    const existing = initialResults.find((r) => r.studentId === student.student_id);
    map[student.student_id] =
      existing ??
      ({
        studentId: student.student_id,
        status: "draft",
        totalScore: 0,
        maxScore: slots.reduce((s, slot) => s + slot.maxScore, 0),
        percentage: 0,
        mark: null,
        comment: null,
        versionCode: "A",
        items: emptyItems(slots),
      } satisfies PaperResultRow);
  }
  return map;
}

export function PaperResultsGrid({
  lessonId,
  classId,
  assessmentVersionId,
  versionCode,
  maxScore,
  slots,
  students,
  initialResults,
}: PaperResultsGridProps) {
  const [grid, setGrid] = useState(() => buildInitialGrid(students, slots, initialResults));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refKey = (studentId: string, slotId: string) => `${studentId}:${slotId}`;

  const totals = useMemo(() => {
    let draftCount = 0;
    let confirmedCount = 0;
    let absentCount = 0;
    for (const row of Object.values(grid)) {
      if (row.status === "confirmed") confirmedCount += 1;
      else if (row.status === "absent") absentCount += 1;
      else draftCount += 1;
    }
    return { draftCount, confirmedCount, absentCount };
  }, [grid]);

  const persistStudent = useCallback(
    async (studentId: string) => {
      const row = grid[studentId];
      if (!row) return;

      setSaveState("saving");
      const result = await savePaperResultDraftAction({
        assessmentVersionId,
        classId,
        studentId,
        versionCode,
        status: row.status === "absent" ? "absent" : "draft",
        items: row.status === "absent" ? [] : row.items,
        comment: row.comment ?? undefined,
      });

      if (result.ok) {
        setSaveState("saved");
        setMessage(null);
      } else {
        setSaveState("error");
        setMessage(result.error ?? "Błąd zapisu.");
      }
    },
    [assessmentVersionId, classId, grid, versionCode],
  );

  const scheduleSave = useCallback(
    (studentId: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void persistStudent(studentId);
      }, 600);
    },
    [persistStudent],
  );

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  function updateScore(studentId: string, slotId: string, raw: string) {
    const value = raw.trim() === "" ? 0 : Number(raw);
    if (!Number.isFinite(value) || value < 0) return;

    setGrid((current) => {
      const row = current[studentId];
      if (!row || row.status === "absent" || row.status === "confirmed") return current;

      const items = row.items.map((item) =>
        item.slotId === slotId
          ? { ...item, score: Math.min(value, item.maxScore) }
          : item,
      );
      const total = items.reduce((sum, item) => sum + item.score, 0);
      const percentage = maxScore > 0 ? Math.round((total / maxScore) * 100) : 0;

      return {
        ...current,
        [studentId]: {
          ...row,
          status: "draft",
          items,
          totalScore: total,
          percentage,
        },
      };
    });
    scheduleSave(studentId);
  }

  function toggleAbsent(studentId: string) {
    setGrid((current) => {
      const row = current[studentId];
      if (!row || row.status === "confirmed") return current;
      const nextAbsent = row.status !== "absent";
      return {
        ...current,
        [studentId]: {
          ...row,
          status: nextAbsent ? "absent" : "draft",
          totalScore: nextAbsent ? null : 0,
          percentage: nextAbsent ? null : 0,
          items: nextAbsent ? [] : emptyItems(slots),
        },
      };
    });
    scheduleSave(studentId);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    studentIndex: number,
    slotIndex: number,
  ) {
    const moveFocus = (nextStudent: number, nextSlot: number) => {
      const student = students[nextStudent];
      const slot = slots[nextSlot];
      if (!student || !slot) return;
      const el = inputRefs.current.get(refKey(student.student_id, slot.slotId));
      el?.focus();
      el?.select();
    };

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(Math.min(studentIndex + 1, students.length - 1), slotIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(Math.max(studentIndex - 1, 0), slotIndex);
    } else if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
      if (slotIndex < slots.length - 1) {
        event.preventDefault();
        moveFocus(studentIndex, slotIndex + 1);
      }
    } else if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
      if (slotIndex > 0) {
        event.preventDefault();
        moveFocus(studentIndex, slotIndex - 1);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      moveFocus(Math.min(studentIndex + 1, students.length - 1), slotIndex);
    }
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmPaperResultsAction({
        assessmentVersionId,
        classId,
        lessonId,
      });
      if (result.ok) {
        setMessage(`Zatwierdzono ${result.count ?? 0} wyników.`);
        setGrid((current) => {
          const next = { ...current };
          for (const key of Object.keys(next)) {
            const row = next[key]!;
            if (row.status === "draft") {
              next[key] = { ...row, status: "confirmed" };
            }
          }
          return next;
        });
      } else {
        setMessage(result.error ?? "Nie udało się zatwierdzić wyników.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-700">
          Szkice: <strong>{totals.draftCount}</strong> · Zatwierdzone:{" "}
          <strong>{totals.confirmedCount}</strong> · Nieobecni: <strong>{totals.absentCount}</strong>
          {saveState === "saving" ? (
            <span className="ml-2 text-slate-500">Zapisywanie…</span>
          ) : saveState === "saved" ? (
            <span className="ml-2 text-emerald-700">Zapisano</span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="assess"
          size="md"
          disabled={pending || totals.draftCount + totals.absentCount === 0}
          onClick={handleConfirm}
        >
          Zatwierdź wyniki
        </Button>
      </Card>

      {message ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
          {message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-[720px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2">Uczeń</th>
              <th className="px-2 py-2 text-center">Nb.</th>
              {slots.map((slot) => (
                <th key={slot.slotId} className="px-2 py-2 text-center" title={slot.label}>
                  {slot.position}
                  <span className="block text-[10px] font-normal normal-case text-slate-400">
                    /{slot.maxScore}
                  </span>
                </th>
              ))}
              <th className="px-3 py-2 text-center">Σ</th>
              <th className="px-3 py-2 text-center">%</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, studentIndex) => {
              const row = grid[student.student_id]!;
              const isAbsent = row.status === "absent";
              const isConfirmed = row.status === "confirmed";

              return (
                <tr key={student.student_id} className="border-b border-slate-100">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium text-slate-900">
                    {studentLabel(student)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isAbsent}
                      disabled={isConfirmed}
                      onChange={() => toggleAbsent(student.student_id)}
                      aria-label={`Nieobecny: ${studentLabel(student)}`}
                      title="Nieobecny (nie liczy się jako 0 pkt)"
                    />
                  </td>
                  {slots.map((slot, slotIndex) => {
                    const item = row.items.find((i) => i.slotId === slot.slotId);
                    const key = refKey(student.student_id, slot.slotId);
                    return (
                      <td key={slot.slotId} className="px-2 py-1 text-center">
                        <input
                          ref={(el) => {
                            if (el) inputRefs.current.set(key, el);
                            else inputRefs.current.delete(key);
                          }}
                          type="number"
                          min={0}
                          max={slot.maxScore}
                          step={1}
                          disabled={isAbsent || isConfirmed}
                          value={isAbsent ? "" : (item?.score ?? 0)}
                          onChange={(e) =>
                            updateScore(student.student_id, slot.slotId, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, studentIndex, slotIndex)}
                          className="w-14 rounded-lg border border-slate-200 px-2 py-1 text-center tabular-nums disabled:bg-slate-100"
                          aria-label={`${studentLabel(student)} zadanie ${slot.position}`}
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center font-semibold tabular-nums">
                    {isAbsent ? "—" : (row.totalScore ?? 0)}
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums text-slate-600">
                    {isAbsent ? "—" : `${row.percentage ?? 0}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        Nawigacja: Tab / strzałki między komórkami, Enter w dół. Autosave co ~0,6 s. Nieobecność ≠ 0
        punktów.
      </p>
    </div>
  );
}
