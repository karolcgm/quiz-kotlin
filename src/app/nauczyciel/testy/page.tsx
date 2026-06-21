import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { teacherNavCategories } from "@/data/dashboardNav";
import { Card } from "@/components/ui/Card";
import { TestListActions } from "@/components/tests/TestListActions";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TestRow = {
  id: string;
  title: string;
  status: string;
  class_level: number;
  max_points: number;
  created_at: string;
};

interface TeacherTestsPageProps {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}

function statusLabel(status: string): string {
  if (status === "published") {
    return "Opublikowany";
  }

  if (status === "draft") {
    return "Szkic";
  }

  return status;
}

export default async function TeacherTestsPage({ searchParams }: TeacherTestsPageProps) {
  const teacher = await requireRole("teacher");
  const { saved, deleted } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tests")
    .select("id, title, status, class_level, max_points, created_at")
    .eq("teacher_id", teacher.id)
    .order("created_at", { ascending: false })
    .returns<TestRow[]>();
  const tests = data ?? [];

  return (
    <PageShell>
      <DashboardNav categories={teacherNavCategories} />
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Moje testy</h1>
        <p className="mt-3 text-slate-600">
          Szkice są widoczne tylko dla Ciebie. Opublikowany test trzeba jeszcze{" "}
          <strong>wysłać</strong> do grupy uczniów lub wybranych osób — wtedy uczeń go zobaczy.
        </p>

        {saved === "published" && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-900">
            Test opublikowany. Kliknij „Wyślij do uczniów”, aby przypisać go klasie lub wybranym
            uczniom.
          </div>
        )}

        {saved === "draft" && (
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 font-semibold text-sky-900">
            Szkic zapisany. Uczniowie go jeszcze nie widzą — opublikuj test, gdy będzie gotowy.
          </div>
        )}

        {deleted === "1" && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-800">
            Test został usunięty.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800">
            Nie udało się wczytać testów: {error.message}
          </div>
        )}

        <Link
          href="/nauczyciel/testy/nowy"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          Utwórz test
        </Link>
        <div className="mt-6 space-y-3">
          {tests.length === 0 && !error && (
            <p className="text-slate-600">Nie masz jeszcze testów.</p>
          )}
          {tests.map((test) => (
            <div key={test.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    test.status === "published"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {statusLabel(test.status)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Poziom kl. {test.class_level} · {test.max_points} pkt
              </p>
              {test.status === "draft" && (
                <p className="mt-2 text-sm text-amber-800">
                  Szkic — tylko Ty to widzisz. Opublikuj, aby wysłać test uczniom.
                </p>
              )}
              {test.status === "published" && (
                <p className="mt-2 text-sm text-emerald-800">
                  Opublikowany — wyślij test do grupy lub wybranych uczniów, aby uczeń go widział.
                </p>
              )}
              <TestListActions testId={test.id} status={test.status} />
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
