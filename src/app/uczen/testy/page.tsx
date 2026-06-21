import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AssignmentStudentRow = {
  assignments: {
    id: string;
    title: string;
    due_at: string | null;
    status: string;
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
        "assignments(id, title, due_at, status, max_attempts, time_limit_minutes, tests(title, class_level, max_points))",
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

  return (
    <Card>
        <h1 className="text-3xl font-bold text-slate-900">Testy do wykonania</h1>
        <p className="mt-3 text-slate-600">
          Tutaj uczeń zobaczy testy przypisane przez nauczyciela w swojej szkole i grupie.
        </p>
        <div className="mt-6 space-y-3">
          {assignments.length === 0 && <p className="text-slate-600">Nie masz obecnie testów do wykonania.</p>}
          {assignments.map((assignment) => {
            const badge = assignmentBadge(
              assignment.id,
              assignment.max_attempts,
              submissionList,
              retakeByAssignment.get(assignment.id) ?? false,
            );

            return (
              <Link
                key={assignment.id}
                href={`/uczen/testy/${assignment.id}`}
                className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-slate-900">{assignment.title}</h2>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {assignment.tests?.title ?? "Test"} · klasa {assignment.tests?.class_level ?? "-"} ·{" "}
                  {assignment.tests?.max_points ?? 0} pkt
                </p>
                {assignment.time_limit_minutes && (
                  <p className="mt-1 text-sm text-slate-500">Limit czasu: {assignment.time_limit_minutes} min</p>
                )}
                {assignment.due_at && (
                  <p className="mt-1 text-sm text-slate-500">
                    Termin: {new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(assignment.due_at))}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </Card>
  );
}
