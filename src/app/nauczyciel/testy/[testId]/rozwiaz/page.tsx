import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { teacherNavCategories } from "@/data/dashboardNav";
import { TeacherTestPreviewRunner } from "@/components/tests/TeacherTestPreviewRunner";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { TestWidgetParams } from "@/types/testWidget";

export const dynamic = "force-dynamic";

interface TeacherSolveTestPageProps {
  params: Promise<{ testId: string }>;
}

type TestRow = {
  id: string;
  title: string;
  instruction: string | null;
};

type TestItemRow = {
  id: string;
  simulation_slug: string;
  title: string;
  prompt: string;
  points: number;
  params: TestWidgetParams;
};

export default async function TeacherSolveTestPage({ params }: TeacherSolveTestPageProps) {
  const teacher = await requireRole("teacher");
  const { testId } = await params;
  const supabase = await createClient();

  const { data: test } = await supabase
    .from("tests")
    .select("id, title, instruction")
    .eq("id", testId)
    .eq("teacher_id", teacher.id)
    .maybeSingle<TestRow>();

  if (!test) {
    notFound();
  }

  const { data: items } = await supabase
    .from("test_items")
    .select("id, simulation_slug, title, prompt, points, params")
    .eq("test_id", testId)
    .order("position", { ascending: true })
    .returns<TestItemRow[]>();

  return (
    <PageShell>
      <DashboardNav categories={teacherNavCategories} />
      <TeacherTestPreviewRunner
        testId={test.id}
        title={test.title}
        instruction={test.instruction}
        items={items ?? []}
      />
    </PageShell>
  );
}
