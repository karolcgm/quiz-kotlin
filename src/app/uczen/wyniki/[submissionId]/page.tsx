import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { SkillProgressPanel } from "@/components/grading/SkillProgressPanel";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { aggregateProgress } from "@/lib/grading/progress";

export const dynamic = "force-dynamic";

interface StudentSubmissionPageProps {
  params: Promise<{ submissionId: string }>;
}

export default async function StudentSubmissionPage({ params }: StudentSubmissionPageProps) {
  await requireRole("student");
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
      .select("mark_1_6, feedback_text, retake_allowed")
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
    <PageShell className="max-w-4xl">
      <div className="space-y-6">
        <Card>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Twój wynik</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Ocena z testu</h1>
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
        <p className="mt-4 font-semibold text-slate-700">
          {score.retake_allowed
            ? "Nauczyciel odblokował poprawę tego testu."
            : "Poprawa nie jest obecnie odblokowana."}
        </p>
        </Card>
        <SkillProgressPanel
          title="Umiejętności w tym teście"
          description="Rozbicie wyniku pokazuje, które typy zadań poszły najlepiej."
          progress={aggregateProgress(
            (answers ?? []).map((answer) => ({ ...answer, source: "classwork" as const })),
          )}
        />
      </div>
    </PageShell>
  );
}
