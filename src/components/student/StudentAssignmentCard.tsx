import Link from "next/link";
import { Card } from "@/components/ui/Card";
import {
  canStudentOpenAssignment,
  getAssignmentWindowState,
  kindLabel,
  windowStateLabel,
} from "@/lib/assignments/window";
import { formatSubmittedAt } from "@/lib/teacher/panelFilters";

interface StudentAssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    starts_at: string | null;
    due_at: string | null;
    status: string;
    kind: string;
    max_attempts: number;
    time_limit_minutes: number | null;
    tests: {
      title: string;
      class_level: number;
      max_points: number;
    } | null;
  };
  badge: { label: string; className: string };
  windowState: ReturnType<typeof getAssignmentWindowState>;
  canOpen: boolean;
}

export function StudentAssignmentCard({
  assignment,
  badge,
  windowState,
  canOpen,
}: StudentAssignmentCardProps) {
  const content = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">{assignment.title}</h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {windowStateLabel(windowState)}
          </span>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {kindLabel(assignment.kind as "classwork" | "homework")} ·{" "}
        {assignment.tests?.title ?? "Test"} · klasa {assignment.tests?.class_level ?? "-"} ·{" "}
        {assignment.tests?.max_points ?? 0} pkt
      </p>
      {assignment.starts_at && (
        <p className="mt-1 text-sm text-slate-500">
          Dostępne od: {formatSubmittedAt(assignment.starts_at)}
        </p>
      )}
      {assignment.due_at && (
        <p className="mt-1 text-sm text-slate-500">
          Termin: {formatSubmittedAt(assignment.due_at)}
        </p>
      )}
      {assignment.time_limit_minutes && (
        <p className="mt-1 text-sm text-slate-500">Limit czasu: {assignment.time_limit_minutes} min</p>
      )}
      {windowState === "planned" && (
        <p className="mt-2 text-sm font-semibold text-indigo-700">
          Zadanie jest zaplanowane — otworzysz je po rozpoczęciu okna.
        </p>
      )}
      {windowState === "overdue" && !canOpen && (
        <p className="mt-2 text-sm font-semibold text-amber-800">Termin minął — brak możliwości oddania.</p>
      )}
    </>
  );

  if (!canOpen) {
    return (
      <div className="block rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-90">{content}</div>
    );
  }

  return (
    <Link
      href={`/uczen/testy/${assignment.id}`}
      className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
    >
      {content}
    </Link>
  );
}
