import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AssignmentStudentRow = {
  assignments: {
    id: string;
    title: string;
    due_at: string | null;
    status: string;
    tests: {
      title: string;
      class_level: number;
      max_points: number;
    } | null;
  } | null;
};

export default async function StudentTestsPage() {
  await requireRole("student");
  const supabase = await createClient();
  const { data } = await supabase
    .from("assignment_students")
    .select("assignments(id, title, due_at, status, tests(title, class_level, max_points))")
    .returns<AssignmentStudentRow[]>();
  const assignments = (data ?? [])
    .map((row) => row.assignments)
    .filter((assignment): assignment is NonNullable<AssignmentStudentRow["assignments"]> =>
      Boolean(assignment),
    )
    .filter((assignment) => assignment.status === "published");

  return (
    <PageShell>
      <DashboardNav
        links={[
          { href: "/uczen", label: "Panel" },
          { href: "/uczen/szybki-test", label: "Szybki test" },
          { href: "/uczen/postepy", label: "Postępy" },
          { href: "/uczen/wyniki", label: "Wyniki" },
        ]}
      />
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Testy do wykonania</h1>
        <p className="mt-3 text-slate-600">
          Tutaj uczeń zobaczy testy przypisane przez nauczyciela w swojej szkole i grupie.
        </p>
        <div className="mt-6 space-y-3">
          {assignments.length === 0 && <p className="text-slate-600">Nie masz obecnie testów do wykonania.</p>}
          {assignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/uczen/testy/${assignment.id}`}
              className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">{assignment.title}</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                  Rozwiąż
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {assignment.tests?.title ?? "Test"} · klasa {assignment.tests?.class_level ?? "-"} ·{" "}
                {assignment.tests?.max_points ?? 0} pkt
              </p>
              {assignment.due_at && (
                <p className="mt-1 text-sm text-slate-500">Termin: {assignment.due_at}</p>
              )}
            </Link>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
