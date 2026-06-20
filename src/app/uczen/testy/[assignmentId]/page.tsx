import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { CompletedTestPanel, StartTestPanel } from "@/components/tests/StartTestPanel";
import { TestRunner } from "@/components/tests/TestRunner";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { TestWidgetParams } from "@/types/testWidget";

export const dynamic = "force-dynamic";

interface StudentAssignmentPageProps {
  params: Promise<{ assignmentId: string }>;
  searchParams: Promise<{ error?: string }>;
}

type AssignmentRow = {
  id: string;
  test_id: string;
  title: string;
  max_attempts: number;
  time_limit_minutes: number | null;
  due_at: string | null;
};

type SubmissionRow = {
  id: string;
  status: string;
  attempt_number: number;
  started_at: string;
  submitted_at: string | null;
  percentage: number;
  timed_out: boolean;
};

type TestRow = {
  id: string;
  title: string;
  instruction: string | null;
};

type TestItemRow = {
  id: string;
  simulation_slug: string;
  title: string;
  prompt: string;
  points: number;
  params: TestWidgetParams;
};

function computeExpiresAt(startedAt: string, timeLimitMinutes: number | null): string | null {
  if (!timeLimitMinutes) {
    return null;
  }

  return new Date(new Date(startedAt).getTime() + timeLimitMinutes * 60_000).toISOString();
}

export default async function StudentAssignmentPage({ params, searchParams }: StudentAssignmentPageProps) {
  const student = await requireRole("student");
  const { assignmentId } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, test_id, title, max_attempts, time_limit_minutes, due_at")
    .eq("id", assignmentId)
    .single<AssignmentRow>();

  if (!assignment) {
    notFound();
  }

  const [{ data: test }, { data: items }, { data: submissions }] = await Promise.all([
    supabase
      .from("tests")
      .select("id, title, instruction")
      .eq("id", assignment.test_id)
      .single<TestRow>(),
    supabase
      .from("test_items")
      .select("id, simulation_slug, title, prompt, points, params")
      .eq("test_id", assignment.test_id)
      .order("position", { ascending: true })
      .returns<TestItemRow[]>(),
    supabase
      .from("submissions")
      .select("id, status, attempt_number, started_at, submitted_at, percentage, timed_out")
      .eq("assignment_id", assignmentId)
      .eq("student_id", student.id)
      .order("attempt_number", { ascending: false })
      .returns<SubmissionRow[]>(),
  ]);

  if (!test) {
    notFound();
  }

  const submissionList = submissions ?? [];
  const inProgress = submissionList.find((submission) => submission.status === "in_progress");
  const completed = submissionList.filter(
    (submission) => submission.status === "graded" || submission.status === "submitted",
  );
  const latestCompleted = completed[0];
  const completedCount = completed.length;

  let retakeAllowed = false;
  if (latestCompleted) {
    const { data: scoreRow } = await supabase
      .from("submission_scores")
      .select("retake_allowed")
      .eq("submission_id", latestCompleted.id)
      .maybeSingle();
    retakeAllowed = Boolean(scoreRow?.retake_allowed);
  }

  const attemptsExhausted = completedCount >= assignment.max_attempts && !retakeAllowed;
  const canStartNewAttempt = !attemptsExhausted && !inProgress;

  if (inProgress) {
    const expiresAt = computeExpiresAt(inProgress.started_at, assignment.time_limit_minutes);

    return (
      <PageShell>
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {decodeURIComponent(error)}
          </div>
        )}
        <TestRunner
          assignmentId={assignment.id}
          submissionId={inProgress.id}
          title={assignment.title || test.title}
          instruction={test.instruction}
          items={items ?? []}
          expiresAt={expiresAt}
          timeLimitMinutes={assignment.time_limit_minutes}
        />
      </PageShell>
    );
  }

  if (attemptsExhausted && latestCompleted) {
    return (
      <PageShell>
        <CompletedTestPanel
          assignmentId={assignment.id}
          title={assignment.title || test.title}
          latestSubmissionId={latestCompleted.id}
          percentage={latestCompleted.percentage}
          submittedAt={latestCompleted.submitted_at}
          timedOut={latestCompleted.timed_out}
          canRetry={false}
        />
      </PageShell>
    );
  }

  if (canStartNewAttempt) {
    return (
      <PageShell>
        <StartTestPanel
          assignmentId={assignment.id}
          title={assignment.title || test.title}
          timeLimitMinutes={assignment.time_limit_minutes}
          maxAttempts={assignment.max_attempts}
          completedAttempts={completedCount}
          dueAt={assignment.due_at}
        />
      </PageShell>
    );
  }

  redirect("/uczen/testy");
}
