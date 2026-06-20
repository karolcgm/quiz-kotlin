import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
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
  const { data } = await supabase
    .from("submissions")
    .select("id, student_id, total_score, max_score, percentage, submitted_at")
    .order("submitted_at", { ascending: false })
    .returns<SubmissionRow[]>();
  const submissions = data ?? [];

  return (
    <PageShell>
      <DashboardNav
        links={[
          { href: "/nauczyciel", label: "Panel" },
          { href: "/nauczyciel/testy", label: "Testy" },
          { href: "/nauczyciel/zadania", label: "Przypisania" },
        ]}
      />
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Wyniki uczniów</h1>
        <p className="mt-3 text-slate-600">
          Wyniki będą grupowane po teście, szkole, klasie i uczniu. Nauczyciel może poprawić opis,
          ocenę 1-6 i odblokować poprawę.
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
                <span className="rounded-full bg-indigo-100 px-3 py-1 font-bold text-indigo-800">
                  {submission.percentage}%
                </span>
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
