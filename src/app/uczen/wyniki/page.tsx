import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { studentNavCategories } from "@/data/dashboardNav";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { gradeEmoji } from "@/lib/grading/celebration";

export const dynamic = "force-dynamic";

type SubmissionRow = {
  id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  submitted_at: string | null;
  submission_scores: { mark_1_6: number; retake_allowed: boolean } | null;
};

export default async function StudentResultsPage() {
  await requireRole("student");
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, total_score, max_score, percentage, submitted_at, submission_scores(mark_1_6, retake_allowed)")
    .order("submitted_at", { ascending: false })
    .returns<SubmissionRow[]>();
  const submissions = data ?? [];

  return (
    <PageShell>
      <DashboardNav categories={studentNavCategories} />
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Moje wyniki</h1>
        <p className="mt-3 text-slate-600">
          Zaliczone testy, ocena 1-6, opis mocnych stron i możliwość poproszenia o poprawę.
        </p>
        <div className="mt-6 space-y-3">
          {submissions.length === 0 && <p className="text-slate-600">Nie masz jeszcze wyników.</p>}
          {submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/uczen/wyniki/${submission.id}`}
              className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold text-slate-900">
                  Wynik testu{" "}
                  {submission.submission_scores && (
                    <span aria-hidden="true">
                      {gradeEmoji(
                        submission.submission_scores.mark_1_6,
                        submission.percentage,
                      )}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {submission.submission_scores?.retake_allowed && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      Poprawa
                    </span>
                  )}
                  <span className="rounded-full bg-indigo-100 px-3 py-1 font-bold text-indigo-800">
                    {submission.percentage}%
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Punkty: {submission.total_score}/{submission.max_score}
              </p>
            </Link>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
