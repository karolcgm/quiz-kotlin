import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AssignmentRow = {
  id: string;
  title: string;
  due_at: string | null;
  status: string;
};

type SubmissionRow = {
  id: string;
  percentage: number;
  submitted_at: string | null;
  assignments: { title: string } | null;
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

function startOfTodayIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

function endOfTodayIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
}

export default async function TeacherDashboardPage() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const [{ data: todayAssignments }, { data: recentSubmissions }, { count: pendingRetakes }] =
    await Promise.all([
      supabase
        .from("assignments")
        .select("id, title, due_at, status")
        .gte("due_at", startOfTodayIso())
        .lt("due_at", endOfTodayIso())
        .order("due_at", { ascending: true })
        .limit(5)
        .returns<AssignmentRow[]>(),
      supabase
        .from("submissions")
        .select("id, percentage, submitted_at, assignments(title)")
        .order("submitted_at", { ascending: false })
        .limit(5)
        .returns<SubmissionRow[]>(),
      supabase
        .from("retake_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const assignments = todayAssignments ?? [];
  const submissions = recentSubmissions ?? [];

  return (
    <>
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">
          LekcjaLab — matematyka, którą widać
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          Dzień dobry, {profile.displayName ?? profile.email}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-indigo-100">
          Symulacja → pytanie → test → przypisanie → wynik → poprawa. Zacznij od pomocy na lekcji,
          potem zbuduj test.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/nauczyciel/testy/nowy"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Nowy test
          </Link>
          <Link
            href="/nauczyciel/powiadomienia/wyslij"
            className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Wyślij wiadomość
          </Link>
          <Link
            href="/nauczyciel/uczniowie"
            className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Dodaj klasę
          </Link>
          <Link
            href="/symulacje"
            className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Katalog symulacji
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Dzisiejsze zadania</h2>
          <p className="mt-2 text-sm text-slate-600">Terminy na dziś</p>
          <div className="mt-4 space-y-2">
            {assignments.length === 0 && (
              <p className="text-sm text-slate-500">Brak terminów na dziś.</p>
            )}
            {assignments.map((assignment) => (
              <Link
                key={assignment.id}
                href="/nauczyciel/zadania"
                className="block rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <p className="font-semibold text-slate-900">{assignment.title}</p>
                {assignment.due_at && (
                  <p className="text-slate-500">{formatSubmittedAt(assignment.due_at)}</p>
                )}
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-900">Ostatnie wyniki</h2>
          <p className="mt-2 text-sm text-slate-600">Najnowsze oddania testów</p>
          <div className="mt-4 space-y-2">
            {submissions.length === 0 && (
              <p className="text-sm text-slate-500">Brak wyników do wyświetlenia.</p>
            )}
            {submissions.map((submission) => (
              <Link
                key={submission.id}
                href={`/nauczyciel/wyniki/${submission.id}`}
                className="block rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <p className="font-semibold text-slate-900">
                  {submission.assignments?.title ?? "Test bez nazwy"}
                </p>
                <p className="text-slate-500">
                  {formatSubmittedAt(submission.submitted_at)} · {submission.percentage}%
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/nauczyciel/wyniki"
            className="mt-4 inline-block text-sm font-semibold text-indigo-700"
          >
            Dziennik wyników →
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-900">Prośby o poprawę</h2>
          <p className="mt-2 text-sm text-slate-600">Uczniowie czekają na zgodę POPRAW</p>
          <p className="mt-6 text-4xl font-bold text-slate-900">{pendingRetakes ?? 0}</p>
          <Link
            href="/nauczyciel/wyniki"
            className="mt-4 inline-block text-sm font-semibold text-indigo-700"
          >
            Przejdź do wyników →
          </Link>
        </Card>
      </div>
    </>
  );
}
