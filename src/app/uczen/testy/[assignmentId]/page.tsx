import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { TestRunner } from "@/components/tests/TestRunner";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { TestWidgetParams } from "@/types/testWidget";

export const dynamic = "force-dynamic";

interface StudentAssignmentPageProps {
  params: Promise<{ assignmentId: string }>;
}

type AssignmentRow = {
  id: string;
  test_id: string;
  title: string;
};

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

export default async function StudentAssignmentPage({ params }: StudentAssignmentPageProps) {
  await requireRole("student");
  const { assignmentId } = await params;
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, test_id, title")
    .eq("id", assignmentId)
    .single<AssignmentRow>();

  if (!assignment) {
    notFound();
  }

  const [{ data: test }, { data: items }] = await Promise.all([
    supabase
      .from("tests")
      .select("id, title, instruction")
      .eq("id", assignment.test_id)
      .single<TestRow>(),
    supabase
      .from("test_items")
      .select("id, simulation_slug, title, prompt, points, params")
      .eq("test_id", assignment.test_id)
      .order("position", { ascending: true })
      .returns<TestItemRow[]>(),
  ]);

  if (!test) {
    notFound();
  }

  return (
    <PageShell>
      <TestRunner
        assignmentId={assignment.id}
        title={assignment.title || test.title}
        instruction={test.instruction}
        items={items ?? []}
      />
    </PageShell>
  );
}
