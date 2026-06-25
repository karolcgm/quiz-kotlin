import Link from "next/link";
import { LekcjaLabLogo } from "@/components/brand/LekcjaLabLogo";
import { AssignmentListCard } from "@/components/teacher/AssignmentListCard";
import { PanelFilterBar } from "@/components/teacher/PanelFilterBar";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { loadAssignmentProgressSummaries } from "@/lib/teacher/assignmentProgress";
import {
  assignmentFilterLabel,
  buildPanelUrl,
  classDisplayName,
  parseAssignmentFilter,
} from "@/lib/teacher/panelFilters";

export const dynamic = "force-dynamic";

type TestRow = {
  id: string;
  title: string;
};

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  schools: { name: string } | null;
};

type AssignmentRow = {
  id: string;
  title: string;
  status: string;
  starts_at: string | null;
  due_at: string | null;
  class_id: string | null;
  teacher_classes: { name: string; group_name: string } | null;
};

interface TeacherAssignmentsPageProps {
  searchParams: Promise<{ sent?: string; closed?: string; status?: string; classId?: string }>;
}

function assignmentStatusLabel(status: string): string {
  if (status === "published") return "Aktywne";
  if (status === "closed") return "Zakończone";
  if (status === "draft") return "Szkic";
  return status;
}

export default async function TeacherAssignmentsPage({ searchParams }: TeacherAssignmentsPageProps) {
  await requireRole("teacher");
  const { sent, closed, status, classId } = await searchParams;
  const statusFilter = parseAssignmentFilter(status);
  const supabase = await createClient();

  const [{ data: classes }, { data: tests }, { data: assignments }] = await Promise.all([
    supabase
      .from("teacher_classes")
      .select("id, name, group_name, schools(name)")
      .order("name")
      .returns<ClassRow[]>(),
    supabase.from("tests").select("id, title").eq("status", "published").returns<TestRow[]>(),
    supabase
      .from("assignments")
      .select("id, title, status, starts_at, due_at, class_id, teacher_classes(name, group_name)")
      .order("created_at", { ascending: false })
      .returns<AssignmentRow[]>(),
  ]);

  const classList = classes ?? [];
  const allAssignments = assignments ?? [];
  const progressSummaries = await loadAssignmentProgressSummaries(
    supabase,
    allAssignments.map((assignment) => assignment.id),
  );

  let filteredAssignments = allAssignments;

  if (statusFilter !== "all") {
    filteredAssignments = filteredAssignments.filter(
      (assignment) => assignment.status === statusFilter,
    );
  }

  if (classId) {
    filteredAssignments = filteredAssignments.filter((assignment) => assignment.class_id === classId);
  }

  const statusCounts = {
    all: allAssignments.length,
    published: allAssignments.filter((assignment) => assignment.status === "published").length,
    closed: allAssignments.filter((assignment) => assignment.status === "closed").length,
  };

  const classOptions = [
    {
      id: "all",
      label: "Wszystkie klasy",
      href: buildPanelUrl("/nauczyciel/zadania", { status: statusFilter, classId: undefined }),
    },
    ...classList.map((classRow) => ({
      id: classRow.id,
      label: classDisplayName(classRow),
      href: buildPanelUrl("/nauczyciel/zadania", { status: statusFilter, classId: classRow.id }),
    })),
  ];

  const statusOptions = (["all", "published", "closed"] as const).map((filter) => ({
    id: filter,
    label: assignmentFilterLabel(filter),
    href: buildPanelUrl("/nauczyciel/zadania", { status: filter, classId }),
    count: statusCounts[filter],
  }));

  const publishedTests = tests ?? [];

  return (
    <Card>
      <h1 className="text-3xl font-bold text-slate-900">Zadania</h1>
      <p className="mt-3 text-slate-600">
        Przypisania wysłane uczniom. Po zakończeniu zamknij zadanie — powiązany test trafi do
        archiwum.
      </p>

      {sent === "1" && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-900">
          Test wysłany uczniom. Pojawi się u nich w zakładce Zadania.
        </div>
      )}
      {closed === "1" && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-800">
          Zadanie zakończone. Test przeniesiono do archiwum, jeśli nie ma innych aktywnych
          przypisań.
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Klasa</p>
          <PanelFilterBar
            ariaLabel="Filtr klas zadań"
            activeId={classId ?? "all"}
            options={classOptions}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Status</p>
          <PanelFilterBar
            ariaLabel="Filtr statusu zadań"
            activeId={statusFilter}
            options={statusOptions}
          />
        </div>
      </div>

      {statusFilter !== "closed" && (
        <div className="mt-8 space-y-3">
          <h2 className="text-xl font-bold text-slate-900">Opublikowane testy do wysłania</h2>
          {publishedTests.length === 0 && (
            <p className="text-slate-600">Brak opublikowanych testów.</p>
          )}
          {publishedTests.map((test) => (
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
      )}

      <div className="mt-8 space-y-3">
        <h2 className="text-2xl font-bold text-slate-900">Przypisania</h2>
        {filteredAssignments.length === 0 && (
          <p className="text-slate-600">Brak zadań dla tego filtra.</p>
        )}
        {filteredAssignments.map((assignment) => (
          <AssignmentListCard
            key={assignment.id}
            assignment={assignment}
            progress={progressSummaries.get(assignment.id)}
            statusLabel={assignmentStatusLabel(assignment.status)}
          />
        ))}
      </div>
    </Card>
  );
}
