import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { TeacherGradeEditor } from "@/components/grading/TeacherGradeEditor";
import { SkillProgressPanel } from "@/components/grading/SkillProgressPanel";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { aggregateProgress } from "@/lib/grading/progress";

export const dynamic = "force-dynamic";

interface TeacherSubmissionPageProps {
  params: Promise<{ submissionId: string }>;
}

export default async function TeacherSubmissionPage({ params }: TeacherSubmissionPageProps) {
  await requireRole("teacher");
  const { submissionId } = await params;
  const supabase = await createClient();

  const [{ data: submission }, { data: score }, { data: answers }] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, total_score, max_score, percentage, attempt_number")
      .eq("id", submissionId)
      .single(),
    supabase
      .from("submission_scores")
      .select("mark_1_6, feedback_text, retake_allowed, is_teacher_override")
      .eq("submission_id", submissionId)
      .single(),
    supabase
      .from("submission_answers")
      .select("skill, score, max_score")
      .eq("submission_id", submissionId),
  ]);

  if (!submission || !score) {
    notFound();
  }

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <h1 className="text-3xl font-bold text-slate-900">Wynik ucznia</h1>
          <div className="mt-6 grid gap-3">
            <p className="text-lg">
              Punkty: <strong>{submission.total_score}/{submission.max_score}</strong>
            </p>
            <p className="text-lg">
              Wynik: <strong>{submission.percentage}%</strong>
            </p>
            <p className="text-lg">
              Ocena: <strong>{score.mark_1_6}</strong>
            </p>
            <p className="text-lg">
              Próba: <strong>{submission.attempt_number}</strong>
            </p>
          </div>
          <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-slate-800">
            {score.feedback_text}
          </div>
        </Card>

        <TeacherGradeEditor
          submissionId={submission.id}
          mark1To6={score.mark_1_6}
          feedbackText={score.feedback_text}
          retakeAllowed={score.retake_allowed}
        />
      </div>
      <div className="mt-6">
        <SkillProgressPanel
          title="Umiejętności w tym oddaniu"
          description="Nauczyciel widzi, z których obszarów uczeń zdobył punkty, a które warto poprawić."
          progress={aggregateProgress(
            (answers ?? []).map((answer) => ({ ...answer, source: "classwork" as const })),
          )}
        />
      </div>
    </PageShell>
  );
}
