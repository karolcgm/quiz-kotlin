import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Card } from "@/components/ui/Card";
import { createAssignmentAction } from "@/lib/actions/assignments";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

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
  due_at: string | null;
  teacher_classes: { name: string; group_name: string } | null;
};

export default async function TeacherAssignmentsPage() {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const [{ data: tests }, { data: classes }, { data: assignments }] = await Promise.all([
    supabase.from("tests").select("id, title").eq("status", "published").returns<TestRow[]>(),
    supabase
      .from("teacher_classes")
      .select("id, name, group_name, schools(name)")
      .eq("teacher_id", teacher.id)
      .returns<ClassRow[]>(),
    supabase
      .from("assignments")
      .select("id, title, status, due_at, teacher_classes(name, group_name)")
      .order("created_at", { ascending: false })
      .returns<AssignmentRow[]>(),
  ]);

  return (
    <PageShell>
      <DashboardNav
        links={[
          { href: "/nauczyciel", label: "Panel" },
          { href: "/nauczyciel/testy", label: "Testy" },
          { href: "/nauczyciel/wyniki", label: "Wyniki" },
        ]}
      />
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Przypisania testów</h1>
        <p className="mt-3 text-slate-600">
          Tutaj nauczyciel przypisze test klasie, grupie lub wybranym uczniom w konkretnej szkole.
        </p>
        <form action={createAssignmentAction} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Test</span>
            <select name="testId" required className="w-full rounded-xl border border-slate-200 px-4 py-3">
              <option value="">Wybierz test</option>
              {(tests ?? []).map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Klasa / grupa</span>
            <select name="classId" required className="w-full rounded-xl border border-slate-200 px-4 py-3">
              <option value="">Wybierz grupę</option>
              {(classes ?? []).map((teacherClass) => (
                <option key={teacherClass.id} value={teacherClass.id}>
                  {teacherClass.schools?.name ?? "Szkoła"} — {teacherClass.name} /{" "}
                  {teacherClass.group_name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Tytuł przypisania</span>
            <input
              name="title"
              required
              defaultValue="Test z osi liczbowej"
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Maksymalna liczba prób</span>
            <input
              name="maxAttempts"
              type="number"
              min={1}
              max={5}
              defaultValue={1}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Termin (opcjonalnie)</span>
            <input
              name="dueAt"
              type="datetime-local"
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white md:col-span-2">
            Przypisz test uczniom
          </button>
        </form>
        <div className="mt-8 space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">Aktywne przypisania</h2>
          {(assignments ?? []).length === 0 && <p className="text-slate-600">Brak przypisań.</p>}
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
