import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { teacherNavCategories } from "@/data/dashboardNav";
import { TestComposer, type ExistingTestDraft } from "@/components/tests/TestComposer";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { TestSkill, TestWidgetParams } from "@/types/testWidget";
import type { GradeLevel } from "@/types/curriculum";

export const dynamic = "force-dynamic";

interface EditTestPageProps {
  params: Promise<{ testId: string }>;
}

type SchoolOption = {
  id: string;
  name: string;
};

type TestItemRow = {
  id: string;
  position: number;
  simulation_slug: string;
  widget_kind: string;
  skill: TestSkill;
  title: string;
  prompt: string;
  points: number;
  params: TestWidgetParams;
};

type TestRow = {
  id: string;
  title: string;
  description: string | null;
  instruction: string | null;
  class_level: GradeLevel;
  school_id: string;
  status: string;
  test_items: TestItemRow[];
};

export default async function EditTestPage({ params }: EditTestPageProps) {
  const teacher = await requireRole("teacher");
  const { testId } = await params;
  const supabase = await createClient();

  const [{ data: test }, { data: schools }] = await Promise.all([
    supabase
      .from("tests")
      .select(
        "id, title, description, instruction, class_level, school_id, status, test_items(id, position, simulation_slug, widget_kind, skill, title, prompt, points, params)",
      )
      .eq("id", testId)
      .eq("teacher_id", teacher.id)
      .maybeSingle<TestRow>(),
    supabase.from("schools").select("id, name").returns<SchoolOption[]>(),
  ]);

  if (!test) {
    notFound();
  }

  const existingTest: ExistingTestDraft = {
    id: test.id,
    title: test.title,
    description: test.description ?? "",
    instruction: test.instruction ?? "",
    schoolId: test.school_id,
    classLevel: test.class_level,
    status: test.status,
    items: [...(test.test_items ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
      localId: item.id,
      position: item.position,
      simulationSlug: item.simulation_slug,
      widgetKind: item.widget_kind,
      skill: item.skill,
      title: item.title,
      prompt: item.prompt,
      points: Number(item.points),
      params: item.params,
    })),
  };

  return (
    <PageShell>
      <DashboardNav categories={teacherNavCategories} />
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Edytuj test</h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-600">
          Zmień pytania, opis lub status testu. Po zapisaniu szkicu uczniowie nie zobaczą zmian, dopóki
          nie opublikujesz testu ponownie.
        </p>
      </div>

      <TestComposer schools={schools ?? []} existingTest={existingTest} />
    </PageShell>
  );
}
