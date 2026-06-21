import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { teacherNavCategories } from "@/data/dashboardNav";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SubmissionRow = {
  id: string;
  student_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  submitted_at: string | null;
};

export default async function TeacherResultsPage() {
  await requireRole("teacher");
  const supabase = await createClient();

  const [{ data }, { data: pendingRequests }] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, student_id, total_score, max_score, percentage, submitted_at")
      .order("submitted_at", { ascending: false })
      .returns<SubmissionRow[]>(),
    supabase
      .from("retake_requests")
      .select("submission_id")
      .eq("status", "pending"),
  ]);

  const submissions = data ?? [];
  const pendingSubmissionIds = new Set((pendingRequests ?? []).map((row) => row.submission_id));

  return (
    <PageShell>
      <DashboardNav categories={teacherNavCategories} />
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Wyniki uczniów</h1>
        <p className="mt-3 text-slate-600">
          Sprawdź wyniki, użyj przycisku POPRAW, aby zezwolić na ponowny test, i odpowiedz na prośby
          uczniów.
        </p>
        <div className="mt-6 space-y-3">
          {submissions.length === 0 && <p className="text-slate-600">Brak oddanych testów.</p>}
          {submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/nauczyciel/wyniki/${submission.id}`}
              className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold text-slate-900">Oddanie {submission.id.slice(0, 8)}</span>
                <div className="flex items-center gap-2">
                  {pendingSubmissionIds.has(submission.id) && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                      Prośba o poprawę
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
