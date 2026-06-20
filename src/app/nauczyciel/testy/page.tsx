import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Card } from "@/components/ui/Card";
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

export default async function TeacherTestsPage() {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data } = await supabase
    .from("tests")
    .select("id, title, status, class_level, max_points, created_at")
    .order("created_at", { ascending: false })
    .returns<TestRow[]>();
  const tests = data ?? [];

  return (
    <PageShell>
      <DashboardNav
        links={[
          { href: "/nauczyciel", label: "Panel" },
          { href: "/nauczyciel/testy/nowy", label: "Nowy test" },
          { href: "/nauczyciel/zadania", label: "Przypisania" },
        ]}
      />
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Moje testy</h1>
        <p className="mt-3 text-slate-600">
          Testy zapisane w Supabase. Opublikowane testy możesz przypisać uczniom.
        </p>
        <Link
          href="/nauczyciel/testy/nowy"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          Utwórz test
        </Link>
        <div className="mt-6 space-y-3">
          {tests.length === 0 && <p className="text-slate-600">Nie masz jeszcze testów.</p>}
          {tests.map((test) => (
            <div key={test.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-800">
                  {test.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Klasa {test.class_level} · {test.max_points} pkt
              </p>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
