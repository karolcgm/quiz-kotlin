import Link from "next/link";
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
  attempt_number: number;
  assignments: { title: string } | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
};

function formatSubmittedAt(value: string | null): string {
  if (!value) {
    return "Data niedostępna";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function studentLabel(profile: ProfileRow | undefined, fallbackId: string): string {
  if (!profile) {
    return `Uczeń ${fallbackId.slice(0, 8)}`;
  }

  return (
    profile.display_name ??
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ??
    `Uczeń ${fallbackId.slice(0, 8)}`
  );
}

export default async function TeacherResultsPage() {
  await requireRole("teacher");
  const supabase = await createClient();

  const [{ data }, { data: pendingRequests }] = await Promise.all([
    supabase
      .from("submissions")
      .select(
        "id, student_id, total_score, max_score, percentage, submitted_at, attempt_number, assignments(title)",
      )
      .order("submitted_at", { ascending: false })
      .returns<SubmissionRow[]>(),
    supabase
      .from("retake_requests")
      .select("submission_id")
      .eq("status", "pending"),
  ]);

  const submissions = data ?? [];
  const pendingSubmissionIds = new Set((pendingRequests ?? []).map((row) => row.submission_id));

  const studentIds = [...new Set(submissions.map((submission) => submission.student_id))];
  const profilesById = new Map<string, ProfileRow>();

  if (studentIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, display_name")
      .in("id", studentIds)
      .returns<ProfileRow[]>();

    for (const profile of profiles ?? []) {
      profilesById.set(profile.id, profile);
    }
  }

  return (
    <Card>
      <h1 className="text-3xl font-bold text-slate-900">Dziennik wyników</h1>
      <p className="mt-3 text-slate-600">
        Nazwa testu, uczeń i data oddania. Użyj POPRAW, aby zezwolić na ponowny test.
      </p>
      <div className="mt-6 space-y-3">
        {submissions.length === 0 && <p className="text-slate-600">Brak oddanych testów.</p>}
        {submissions.map((submission) => {
          const title = submission.assignments?.title ?? "Test bez nazwy";
          const student = studentLabel(profilesById.get(submission.student_id), submission.student_id);

          return (
            <Link
              key={submission.id}
              href={`/nauczyciel/wyniki/${submission.id}`}
              className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{student}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Oddano: {formatSubmittedAt(submission.submitted_at)}
                    {submission.attempt_number > 1 ? ` · Próba ${submission.attempt_number}` : ""}
                  </p>
                </div>
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
              <p className="mt-2 text-sm text-slate-600">
                Punkty: {submission.total_score}/{submission.max_score}
              </p>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
