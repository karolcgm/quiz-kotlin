import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { studentNavCategories } from "@/data/dashboardNav";
import { Card } from "@/components/ui/Card";
import { SkillProgressPanel } from "@/components/grading/SkillProgressPanel";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { aggregateProgress } from "@/lib/grading/progress";

export const dynamic = "force-dynamic";

type AnswerRow = {
  skill: string;
  score: number;
  max_score: number;
};

type PracticeAttemptRow = {
  id: string;
  percentage: number;
  total_score: number;
  max_score: number;
  created_at: string;
};

export default async function StudentProgressPage() {
  await requireRole("student");
  const supabase = await createClient();
  const [{ data: classworkAnswers }, { data: practiceAnswers }, { data: attempts }] = await Promise.all([
    supabase.from("submission_answers").select("skill, score, max_score").returns<AnswerRow[]>(),
    supabase.from("practice_answers").select("skill, score, max_score").returns<AnswerRow[]>(),
    supabase
      .from("practice_attempts")
      .select("id, percentage, total_score, max_score, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<PracticeAttemptRow[]>(),
  ]);
  const progress = aggregateProgress([
    ...(classworkAnswers ?? []).map((answer) => ({ ...answer, source: "classwork" as const })),
    ...(practiceAnswers ?? []).map((answer) => ({ ...answer, source: "practice" as const })),
  ]);

  return (
    <PageShell>
      <DashboardNav categories={studentNavCategories} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <SkillProgressPanel
          title="Moje postępy"
          description="Wyniki są liczone razem z klasówek od nauczyciela i szybkich testów ucznia."
          progress={progress}
        />
        <Card>
          <h2 className="text-2xl font-bold text-slate-900">Ostatnie szybkie testy</h2>
          <div className="mt-4 space-y-3">
            {(attempts ?? []).length === 0 && (
              <p className="text-slate-600">Nie masz jeszcze zapisanych szybkich testów.</p>
            )}
            {(attempts ?? []).map((attempt) => (
              <div key={attempt.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">Szybki test</p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700">
                    {attempt.percentage}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Punkty: {attempt.total_score}/{attempt.max_score}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
