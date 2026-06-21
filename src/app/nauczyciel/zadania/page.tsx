import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { teacherNavCategories } from "@/data/dashboardNav";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TestRow = {
  id: string;
  title: string;
};

type AssignmentRow = {
  id: string;
  title: string;
  status: string;
  due_at: string | null;
  teacher_classes: { name: string; group_name: string } | null;
};

interface TeacherAssignmentsPageProps {
  searchParams: Promise<{ sent?: string }>;
}

export default async function TeacherAssignmentsPage({ searchParams }: TeacherAssignmentsPageProps) {
  const teacher = await requireRole("teacher");
  const { sent } = await searchParams;
  const supabase = await createClient();
  const [{ data: tests }, { data: assignments }] = await Promise.all([
    supabase.from("tests").select("id, title").eq("status", "published").returns<TestRow[]>(),
    supabase
      .from("assignments")
      .select("id, title, status, due_at, teacher_classes(name, group_name)")
      .order("created_at", { ascending: false })
      .returns<AssignmentRow[]>(),
  ]);

  return (
    <PageShell>
      <DashboardNav categories={teacherNavCategories} />
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Wysłane testy</h1>
        <p className="mt-3 text-slate-600">
          Opublikowanie testu nie wysyła go automatycznie uczniom. Wybierz test poniżej i wskaż
          grupę lub konkretnych uczniów.
        </p>

        {sent === "1" && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-900">
            Test wysłany uczniom. Pojawi się u nich w zakładce Testy.
          </div>
        )}

        <div className="mt-6 space-y-3">
          <h2 className="text-xl font-bold text-slate-900">Opublikowane testy do wysłania</h2>
          {(tests ?? []).length === 0 && (
            <p className="text-slate-600">Brak opublikowanych testów.</p>
          )}
          {(tests ?? []).map((test) => (
            <div
              key={test.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
            >
              <span className="font-semibold text-slate-900">{test.title}</span>
              <Link
                href={`/nauczyciel/testy/${test.id}/wyslij`}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Wyślij do uczniów
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">Historia wysyłek</h2>
          {(assignments ?? []).length === 0 && <p className="text-slate-600">Brak wysłanych testów.</p>}
          {(assignments ?? []).map((assignment) => (
            <div key={assignment.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-800">
                  {assignment.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {assignment.teacher_classes?.name ?? "Klasa"} /{" "}
                {assignment.teacher_classes?.group_name ?? "grupa"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
