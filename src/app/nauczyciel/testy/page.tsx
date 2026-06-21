import Link from "next/link";
import { PanelFilterBar } from "@/components/teacher/PanelFilterBar";
import { Card } from "@/components/ui/Card";
import { TestListActions } from "@/components/tests/TestListActions";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  buildPanelUrl,
  classDisplayName,
  parseTestFilter,
  testFilterLabel,
} from "@/lib/teacher/panelFilters";

export const dynamic = "force-dynamic";

type TestRow = {
  id: string;
  title: string;
  status: string;
  class_level: number;
  max_points: number;
  created_at: string;
};

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  school_grade: number;
  schools: { name: string } | null;
};

type AssignmentClassRow = {
  test_id: string;
  class_id: string | null;
};

interface TeacherTestsPageProps {
  searchParams: Promise<{ saved?: string; deleted?: string; archived?: string; status?: string; classId?: string }>;
}

function statusLabel(status: string): string {
  if (status === "published") return "Opublikowany";
  if (status === "draft") return "Roboczy";
  if (status === "archived") return "Archiwum";
  return status;
}

function statusBadgeClass(status: string): string {
  if (status === "published") return "bg-emerald-100 text-emerald-800";
  if (status === "archived") return "bg-slate-200 text-slate-700";
  return "bg-amber-100 text-amber-900";
}

export default async function TeacherTestsPage({ searchParams }: TeacherTestsPageProps) {
  const teacher = await requireRole("teacher");
  const { saved, deleted, archived, status, classId } = await searchParams;
  const statusFilter = parseTestFilter(status);
  const supabase = await createClient();

  const [{ data: classes }, { data: tests, error }, { data: assignmentLinks }] = await Promise.all([
    supabase
      .from("teacher_classes")
      .select("id, name, group_name, school_grade, schools(name)")
      .eq("teacher_id", teacher.id)
      .order("school_grade")
      .order("name")
      .returns<ClassRow[]>(),
    supabase
      .from("tests")
      .select("id, title, status, class_level, max_points, created_at")
      .eq("teacher_id", teacher.id)
      .order("created_at", { ascending: false })
      .returns<TestRow[]>(),
    supabase.from("assignments").select("test_id, class_id").eq("teacher_id", teacher.id),
  ]);

  const classList = classes ?? [];
  const selectedClass = classList.find((classRow) => classRow.id === classId);
  const testsByClass = new Map<string, Set<string>>();

  for (const link of assignmentLinks ?? []) {
    if (!link.class_id) continue;
    const current = testsByClass.get(link.class_id) ?? new Set<string>();
    current.add(link.test_id);
    testsByClass.set(link.class_id, current);
  }

  let filteredTests = tests ?? [];

  if (statusFilter !== "all") {
    filteredTests = filteredTests.filter((test) => test.status === statusFilter);
  }

  if (selectedClass) {
    const linkedTestIds = testsByClass.get(selectedClass.id) ?? new Set<string>();
    filteredTests = filteredTests.filter(
      (test) =>
        test.class_level === selectedClass.school_grade || linkedTestIds.has(test.id),
    );
  }

  const statusCounts = {
    all: (tests ?? []).length,
    published: (tests ?? []).filter((test) => test.status === "published").length,
    draft: (tests ?? []).filter((test) => test.status === "draft").length,
    archived: (tests ?? []).filter((test) => test.status === "archived").length,
  };

  const classOptions = [
    {
      id: "all",
      label: "Wszystkie klasy",
      href: buildPanelUrl("/nauczyciel/testy", { status: statusFilter, classId: undefined }),
    },
    ...classList.map((classRow) => ({
      id: classRow.id,
      label: classDisplayName(classRow),
      href: buildPanelUrl("/nauczyciel/testy", { status: statusFilter, classId: classRow.id }),
    })),
  ];

  const statusOptions = (["all", "published", "draft", "archived"] as const).map((filter) => ({
    id: filter,
    label: testFilterLabel(filter),
    href: buildPanelUrl("/nauczyciel/testy", { status: filter, classId }),
    count: statusCounts[filter],
  }));

  return (
    <Card>
      <h1 className="text-3xl font-bold text-slate-900">Testy</h1>
      <p className="mt-3 text-slate-600">
        Filtruj po klasie i statusie. Po zakończeniu przypisania test trafia do archiwum.
      </p>

      {saved === "published" && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-900">
          Test opublikowany. Wyślij go do uczniów, gdy będzie gotowy.
        </div>
      )}
      {saved === "draft" && (
        <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 font-semibold text-sky-900">
          Szkic zapisany — opublikuj, gdy będzie gotowy.
        </div>
      )}
      {deleted === "1" && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-800">
          Test został usunięty.
        </div>
      )}
      {archived === "1" && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-800">
          Test przeniesiony do archiwum.
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800">
          Nie udało się wczytać testów: {error.message}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Klasa</p>
          <PanelFilterBar
            ariaLabel="Filtr klas testów"
            activeId={classId ?? "all"}
            options={classOptions}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Status</p>
          <PanelFilterBar
            ariaLabel="Filtr statusu testów"
            activeId={statusFilter}
            options={statusOptions}
          />
        </div>
      </div>

      <Link
        href="/nauczyciel/testy/nowy"
        className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
      >
        Nowy test
      </Link>

      <div className="mt-6 space-y-3">
        {filteredTests.length === 0 && !error && (
          <p className="text-slate-600">Brak testów dla tego filtra.</p>
        )}
        {filteredTests.map((test) => (
          <div key={test.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusBadgeClass(test.status)}`}>
                {statusLabel(test.status)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Poziom kl. {test.class_level} · {test.max_points} pkt
            </p>
            {test.status === "draft" && (
              <p className="mt-2 text-sm text-amber-800">Roboczy — widoczny tylko dla Ciebie.</p>
            )}
            {test.status === "published" && (
              <p className="mt-2 text-sm text-emerald-800">Opublikowany — możesz wysłać uczniom.</p>
            )}
            {test.status === "archived" && (
              <p className="mt-2 text-sm text-slate-600">Archiwum — test zakończony.</p>
            )}
            <TestListActions testId={test.id} status={test.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}
