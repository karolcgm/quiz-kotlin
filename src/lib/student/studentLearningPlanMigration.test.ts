import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/072_student_learning_plan_assessments_and_cancel_repair.sql"),
  "utf8",
);

describe("migracja 072 planu ucznia", () => {
  it("odtwarza anulowanie rozpoczętego podejścia jako funkcję uwierzytelnioną", () => {
    expect(migration).toContain("create or replace function public.cancel_student_lesson_review");
    expect(migration).toContain("student_id = auth.uid()");
    expect(migration).toContain("status = 'cancelled'");
    expect(migration).toContain("grant execute on function public.cancel_student_lesson_review(uuid) to authenticated");
  });

  it("dołącza ukończone testy i zachowuje granice szkoły oraz przypisania", () => {
    expect(migration).toContain("submission.status in ('submitted', 'graded')");
    expect(migration).toContain("public.student_can_access_school(assignment.school_id)");
    expect(migration).toContain("membership.school_id = assignment.school_id");
    expect(migration).toContain("target.student_id = auth.uid()");
    expect(migration).toContain("'sourceKind', 'assessment'");
    expect(migration).toContain("'resultId', assessment.result_id");
  });
});
