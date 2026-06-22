import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StudentAssignmentCard } from "@/components/student/StudentAssignmentCard";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  canStudentOpenAssignment,
  getAssignmentWindowState,
} from "@/lib/assignments/window";

export const dynamic = "force-dynamic";

type AssignmentStudentRow = {
  assignments: {
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
  } | null;
};

type SubmissionRow = {
  assignment_id: string;
  status: string;
  id: string;
};

function assignmentBadge(
  assignmentId: string,
  maxAttempts: number,
  submissions: SubmissionRow[],
  retakeAllowed: boolean,
): { label: string; className: string } {
  const related = submissions.filter((submission) => submission.assignment_id === assignmentId);
  const inProgress = related.some((submission) => submission.status === "in_progress");
  const completedCount = related.filter(
    (submission) => submission.status === "graded" || submission.status === "submitted",
  ).length;

  if (inProgress) {
    return { label: "W trakcie", className: "bg-amber-100 text-amber-900" };
  }

  if (retakeAllowed) {
    return { label: "Poprawa", className: "bg-emerald-100 text-emerald-900" };
  }

  if (completedCount >= maxAttempts) {
    return { label: "Rozwiązano", className: "bg-slate-200 text-slate-800" };
  }

  if (completedCount > 0) {
    return { label: "Kontynuuj", className: "bg-sky-100 text-sky-900" };
  }

  return { label: "Rozwiąż", className: "bg-emerald-100 text-emerald-800" };
}

export default async function StudentTestsPage() {
  const student = await requireRole("student");
  const supabase = await createClient();
  const [{ data }, { data: submissions }] = await Promise.all([
    supabase
      .from("assignment_students")
      .select(
        "assignments(id, title, starts_at, due_at, status, kind, max_attempts, time_limit_minutes, tests(title, class_level, max_points))",
      )
      .returns<AssignmentStudentRow[]>(),
    supabase
      .from("submissions")
      .select("assignment_id, status, id")
      .eq("student_id", student.id)
      .returns<SubmissionRow[]>(),
  ]);

  const assignments = (data ?? [])
    .map((row) => row.assignments)
    .filter((assignment): assignment is NonNullable<AssignmentStudentRow["assignments"]> =>
      Boolean(assignment),
    )
    .filter((assignment) => assignment.status === "published");

  const submissionList = submissions ?? [];
  const assignmentIds = assignments.map((assignment) => assignment.id);
  const now = new Date();

  const retakeByAssignment = new Map<string, boolean>();
  if (assignmentIds.length > 0) {
    const { data: latestSubmissions } = await supabase
      .from("submissions")
      .select("assignment_id, id")
      .eq("student_id", student.id)
      .in("assignment_id", assignmentIds)
      .in("status", ["graded", "submitted"])
      .order("attempt_number", { ascending: false });

    const latestByAssignment = new Map<string, string>();
    for (const row of latestSubmissions ?? []) {
      if (!latestByAssignment.has(row.assignment_id)) {
        latestByAssignment.set(row.assignment_id, row.id);
      }
    }

    const latestIds = [...latestByAssignment.values()];
    if (latestIds.length > 0) {
      const { data: scores } = await supabase
        .from("submission_scores")
        .select("submission_id, retake_allowed")
        .in("submission_id", latestIds);

      for (const [assignmentId, submissionId] of latestByAssignment.entries()) {
        const score = (scores ?? []).find((item) => item.submission_id === submissionId);
        retakeByAssignment.set(assignmentId, Boolean(score?.retake_allowed));
      }
    }
  }

  const planned = assignments.filter(
    (a) => getAssignmentWindowState({ status: a.status, starts_at: a.starts_at, due_at: a.due_at, now }) === "planned",
  );
  const active = assignments.filter(
    (a) => getAssignmentWindowState({ status: a.status, starts_at: a.starts_at, due_at: a.due_at, now }) === "active",
  );
  const overdue = assignments.filter(
    (a) => getAssignmentWindowState({ status: a.status, starts_at: a.starts_at, due_at: a.due_at, now }) === "overdue",
  );

  function renderAssignment(assignment: NonNullable<AssignmentStudentRow["assignments"]>) {
    const windowState = getAssignmentWindowState({
      status: assignment.status,
      starts_at: assignment.starts_at,
      due_at: assignment.due_at,
      now,
    });
    const inProgress = submissionList.some(
      (s) => s.assignment_id === assignment.id && s.status === "in_progress",
    );
    const retakeAllowed = retakeByAssignment.get(assignment.id) ?? false;
    const canOpen = canStudentOpenAssignment(windowState, { inProgress, retakeAllowed });

    return (
      <StudentAssignmentCard
        key={assignment.id}
        assignment={assignment}
        windowState={windowState}
        canOpen={canOpen}
        badge={assignmentBadge(assignment.id, assignment.max_attempts, submissionList, retakeAllowed)}
      />
    );
  }

  return (
    <Card>
      <h1 className="text-3xl font-bold text-slate-900">Zadania i testy</h1>
      <p className="mt-3 text-slate-600">
        Zaplanowane zadania widać wcześniej, ale otworzysz je dopiero w wyznaczonym czasie.
      </p>

      {active.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-emerald-800">Aktywne — do zrobienia</h2>
          <div className="mt-3 space-y-3">{active.map(renderAssignment)}</div>
        </section>
      )}

      {planned.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-indigo-800">Zaplanowane</h2>
          <div className="mt-3 space-y-3">{planned.map(renderAssignment)}</div>
        </section>
      )}

      {overdue.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-amber-800">Po terminie / zaległe</h2>
          <div className="mt-3 space-y-3">{overdue.map(renderAssignment)}</div>
        </section>
      )}

      {assignments.length === 0 && (
        <p className="mt-6 text-slate-600">Nie masz obecnie przypisanych zadań.</p>
      )}
    </Card>
  );
}
