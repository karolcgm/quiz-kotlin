import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  canStudentOpenAssignment,
  getAssignmentWindowState,
  kindLabel,
} from "@/lib/assignments/window";
import { formatSubmittedAt } from "@/lib/teacher/panelFilters";
import { gradeEmoji } from "@/lib/grading/celebration";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();
  const now = new Date();

  const [{ data: assignmentRows }, { data: submissions }, { data: latestGrade }] = await Promise.all([
    supabase
      .from("assignment_students")
      .select("assignments(id, title, starts_at, due_at, status, kind, max_attempts)")
      .returns<{ assignments: { id: string; title: string; starts_at: string | null; due_at: string | null; status: string; kind: string; max_attempts: number } | null }[]>(),
    supabase
      .from("submissions")
      .select("assignment_id, status")
      .eq("student_id", profile.id),
    supabase
      .from("submissions")
      .select("id, percentage, submitted_at, assignments(title, kind), submission_scores(mark_1_6)")
      .eq("student_id", profile.id)
      .in("status", ["submitted", "graded"])
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const assignments = (assignmentRows ?? [])
    .map((row) => row.assignments)
    .filter((a): a is NonNullable<typeof a> => Boolean(a && a.status === "published"));

  const submissionList = submissions ?? [];
  let activeCount = 0;
  let plannedCount = 0;
  let overdueCount = 0;

  for (const assignment of assignments) {
    const state = getAssignmentWindowState({
      status: assignment.status,
      starts_at: assignment.starts_at,
      due_at: assignment.due_at,
      now,
    });
    const inProgress = submissionList.some(
      (s) => s.assignment_id === assignment.id && s.status === "in_progress",
    );
    const completed = submissionList.some(
      (s) =>
        s.assignment_id === assignment.id &&
        (s.status === "submitted" || s.status === "graded"),
    );

    if (state === "planned") plannedCount += 1;
    if (state === "overdue" && !completed) overdueCount += 1;
    if (canStudentOpenAssignment(state, { inProgress }) && !completed) activeCount += 1;
  }

  const lastGrade = latestGrade as {
    id: string;
    percentage: number;
    submitted_at: string | null;
    assignments: { title: string; kind: string } | null;
    submission_scores: { mark_1_6: number } | null;
  } | null;

  return (
    <>
      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-indigo-600 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-50">Panel ucznia</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Cześć, {profile.firstName ?? profile.displayName ?? "uczniu"}
        </h1>
        <p className="mt-3 max-w-2xl text-emerald-50">
          Zadania, zaplanowane testy, oceny i zaległości — w jednym miejscu.
        </p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm font-semibold text-emerald-800">Do zrobienia teraz</p>
          <p className="mt-2 text-4xl font-bold text-emerald-950">{activeCount}</p>
          <Link href="/uczen/testy" className="mt-3 inline-block text-sm font-semibold text-emerald-800">
            Aktywne sprawdziany →
          </Link>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50">
          <p className="text-sm font-semibold text-indigo-800">Zaplanowane</p>
          <p className="mt-2 text-4xl font-bold text-indigo-950">{plannedCount}</p>
          <Link href="/uczen/testy" className="mt-3 inline-block text-sm font-semibold text-indigo-800">
            Zobacz harmonogram →
          </Link>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">Zaległe</p>
          <p className="mt-2 text-4xl font-bold text-amber-950">{overdueCount}</p>
          <Link href="/uczen/testy" className="mt-3 inline-block text-sm font-semibold text-amber-900">
            Sprawdź terminy →
          </Link>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-600">Ostatnia ocena</p>
          {lastGrade?.submission_scores ? (
            <>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {lastGrade.submission_scores.mark_1_6}{" "}
                <span aria-hidden="true">
                  {gradeEmoji(lastGrade.submission_scores.mark_1_6, lastGrade.percentage)}
                </span>
              </p>
              <p className="text-sm text-slate-600">
                {lastGrade.assignments?.title ?? "Test"} ·{" "}
                {lastGrade.assignments ? kindLabel(lastGrade.assignments.kind as "classwork" | "homework") : ""}
              </p>
              <Link href={`/uczen/wyniki/${lastGrade.id}`} className="mt-2 inline-block text-sm font-semibold text-indigo-700">
                Szczegóły →
              </Link>
            </>
          ) : (
            <p className="mt-2 text-slate-500">Brak ocen</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Szybki test</h2>
          <p className="mt-2 text-slate-600">Poćwicz samodzielnie z widgetów.</p>
          <Link href="/uczen/szybki-test" className="mt-4 inline-block font-semibold text-indigo-700">
            Ułóż szybki test
          </Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Moje wyniki</h2>
          <p className="mt-2 text-slate-600">Wszystkie oceny i prośby o poprawę.</p>
          <Link href="/uczen/wyniki" className="mt-4 inline-block font-semibold text-indigo-700">
            Zobacz wyniki
          </Link>
        </Card>
      </div>
    </>
  );
}
