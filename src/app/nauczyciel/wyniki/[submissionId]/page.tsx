import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { TeacherGradeEditor } from "@/components/grading/TeacherGradeEditor";
import { TeacherRetakePanel } from "@/components/grading/TeacherRetakePanel";
import { SkillProgressPanel } from "@/components/grading/SkillProgressPanel";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { aggregateProgress } from "@/lib/grading/progress";
import type { RetakeRequest } from "@/types/notification";

export const dynamic = "force-dynamic";

interface TeacherSubmissionPageProps {
  params: Promise<{ submissionId: string }>;
  searchParams: Promise<{ error?: string; approved?: string }>;
}

type RetakeRequestRow = {
  id: string;
  message: string | null;
  status: RetakeRequest["status"];
  created_at: string;
};

export default async function TeacherSubmissionPage({
  params,
  searchParams,
}: TeacherSubmissionPageProps) {
  await requireRole("teacher");
  const { submissionId } = await params;
  const { error, approved } = await searchParams;
  const supabase = await createClient();

  const [{ data: submission }, { data: score }, { data: answers }, { data: retakeRows }] =
    await Promise.all([
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
      supabase
        .from("retake_requests")
        .select("id, message, status, created_at")
        .eq("submission_id", submissionId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .returns<RetakeRequestRow[]>(),
    ]);

  if (!submission || !score) {
    notFound();
  }

  const pendingRequests: RetakeRequest[] = (retakeRows ?? []).map((row) => ({
    id: row.id,
    submissionId,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }));

  return (
    <>
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {decodeURIComponent(error)}
        </div>
      )}
      {approved && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Poprawa została odblokowana. Uczeń otrzymał powiadomienie.
        </div>
      )}
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

        <div className="space-y-6">
          <TeacherRetakePanel
            submissionId={submission.id}
            retakeAllowed={score.retake_allowed}
            pendingRequests={pendingRequests}
          />
          <TeacherGradeEditor
            submissionId={submission.id}
            mark1To6={score.mark_1_6}
            feedbackText={score.feedback_text}
          />
        </div>
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
    </>
  );
}
