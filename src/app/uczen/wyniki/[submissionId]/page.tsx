import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { StudentRetakeRequestPanel } from "@/components/grading/StudentRetakeRequestPanel";
import { SkillProgressPanel } from "@/components/grading/SkillProgressPanel";
import { TestResultCelebration } from "@/components/grading/TestResultCelebration";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { aggregateProgress } from "@/lib/grading/progress";
import { gradeEmoji } from "@/lib/grading/celebration";

export const dynamic = "force-dynamic";

interface StudentSubmissionPageProps {
  params: Promise<{ submissionId: string }>;
  searchParams: Promise<{ error?: string; requested?: string }>;
}

export default async function StudentSubmissionPage({
  params,
  searchParams,
}: StudentSubmissionPageProps) {
  const student = await requireRole("student");
  const { submissionId } = await params;
  const { error, requested } = await searchParams;
  const supabase = await createClient();

  const [{ data: submission }, { data: score }, { data: answers }, { data: pendingRequest }] =
    await Promise.all([
      supabase
        .from("submissions")
        .select("id, assignment_id, total_score, max_score, percentage, attempt_number")
        .eq("id", submissionId)
        .single(),
      supabase
        .from("submission_scores")
        .select("mark_1_6, feedback_text, retake_allowed")
        .eq("submission_id", submissionId)
        .single(),
      supabase
        .from("submission_answers")
        .select("skill, score, max_score")
        .eq("submission_id", submissionId),
      supabase
        .from("retake_requests")
        .select("id")
        .eq("submission_id", submissionId)
        .eq("status", "pending")
        .maybeSingle(),
    ]);

  if (!submission || !score) {
    notFound();
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("max_attempts")
    .eq("id", submission.assignment_id)
    .single();

  const { count: completedCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("assignment_id", submission.assignment_id)
    .eq("student_id", student.id)
    .in("status", ["graded", "submitted"]);

  const attemptsExhausted = (completedCount ?? 0) >= (assignment?.max_attempts ?? 1);
  const canRequestRetake = attemptsExhausted && !score.retake_allowed;
  const resultEmoji = gradeEmoji(score.mark_1_6, submission.percentage);

  return (
    <div className="max-w-4xl">
      <div className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {decodeURIComponent(error)}
          </div>
        )}
        {requested && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            Prośba o poprawę została wysłana do nauczyciela.
          </div>
        )}

        <TestResultCelebration mark1To6={score.mark_1_6} percentage={submission.percentage} />

        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Twój wynik</p>
          <h1 className="mt-2 flex flex-wrap items-center gap-3 text-3xl font-bold text-slate-900">
            Ocena z testu
            <span className="text-4xl" aria-hidden="true">
              {resultEmoji}
            </span>
          </h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-sm text-slate-600">Ocena</p>
              <p className="text-4xl font-black text-indigo-700">{score.mark_1_6}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Wynik</p>
              <p className="text-4xl font-black text-slate-900">{submission.percentage}%</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Punkty</p>
              <p className="text-4xl font-black text-slate-900">
                {submission.total_score}/{submission.max_score}
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-white p-4 text-lg leading-relaxed text-slate-700">
            {score.feedback_text}
          </div>
        </Card>

        <StudentRetakeRequestPanel
          submissionId={submission.id}
          assignmentId={submission.assignment_id}
          retakeAllowed={score.retake_allowed}
          canRequestRetake={canRequestRetake}
          pendingRequest={Boolean(pendingRequest)}
        />

        <SkillProgressPanel
          title="Umiejętności w tym teście"
          description="Rozbicie wyniku pokazuje, które typy zadań poszły najlepiej."
          progress={aggregateProgress(
            (answers ?? []).map((answer) => ({ ...answer, source: "classwork" as const })),
          )}
        />
      </div>
    </div>
  );
}
