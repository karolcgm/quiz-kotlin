import Link from "next/link";
import { closeAssignmentAction } from "@/lib/actions/assignments";
import { formatSubmittedAt } from "@/lib/teacher/panelFilters";
import type { AssignmentProgressSummary } from "@/lib/teacher/assignmentProgress";

interface AssignmentListCardProps {
  assignment: {
    id: string;
    title: string;
    status: string;
    due_at: string | null;
    starts_at?: string | null;
    teacher_classes: { name: string; group_name: string } | null;
  };
  progress: AssignmentProgressSummary | undefined;
  statusLabel: string;
}

export function AssignmentListCard({ assignment, progress, statusLabel }: AssignmentListCardProps) {
  const submittedCount = progress?.submittedCount ?? 0;
  const totalCount = progress?.totalCount ?? 0;
  const percent = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;
  const isPublished = assignment.status === "published";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <Link
        href={`/nauczyciel/zadania/${assignment.id}`}
        className="block p-5 transition hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-violet-50/30"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-800">
              {assignment.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {assignment.teacher_classes?.name ?? "Klasa"} /{" "}
              {assignment.teacher_classes?.group_name ?? "grupa"}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
              assignment.status === "closed"
                ? "bg-slate-200 text-slate-700"
                : "bg-indigo-100 text-indigo-800"
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {(assignment.starts_at || assignment.due_at) && (
          <p className="mt-2 text-xs font-medium text-slate-500">
            {assignment.starts_at && <>Od: {formatSubmittedAt(assignment.starts_at)}</>}
            {assignment.starts_at && assignment.due_at && " · "}
            {assignment.due_at && <>Do: {formatSubmittedAt(assignment.due_at)}</>}
          </p>
        )}

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-600">
            <span>Oddania</span>
            <span>
              {submittedCount}/{totalCount}
              {totalCount > 0 && ` (${Math.round(percent)}%)`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <p className="mt-3 text-sm font-bold text-indigo-700 opacity-80 transition group-hover:opacity-100">
          Kto oddał, kto nie →
        </p>
      </Link>

      {isPublished && (
        <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3">
          <form action={closeAssignmentAction}>
            <input type="hidden" name="assignmentId" value={assignment.id} />
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Zakończ zadanie (archiwizuj test)
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
