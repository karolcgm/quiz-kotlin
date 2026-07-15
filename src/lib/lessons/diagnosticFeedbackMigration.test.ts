import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.resolve(process.cwd(), "supabase/migrations/065_diagnostic_feedback.sql"),
  "utf8",
);

describe("migracja diagnostycznego feedbacku", () => {
  it("utrwala wszystkie cztery statusy, errorCodes i feedbackKey", () => {
    expect(migration).toContain("'partially-correct'");
    expect(migration).toContain("'manual-review'");
    expect(migration).toContain("'errorCodes', response.error_codes");
    expect(migration).toContain("'feedbackKey', response.feedback_key");
  });

  it("ocenia częściowo i kieruje do recenzji wyłącznie z prywatnego answerSpec", () => {
    expect(migration).toContain("answer_spec -> 'partialOperatorIndices'");
    expect(migration).toContain("answer_spec ->> 'manualReview'");
    expect(migration).not.toMatch(/public_answer\s*->>\s*'partialScore'/u);
    expect(migration).not.toMatch(/public_answer\s*->>\s*'manualReview'/u);
  });

  it("student view zwraca diagnostykę oddanej odpowiedzi bez answerSpec", () => {
    const studentView = migration.split("create or replace function public.get_lesson_session_student_view")[1] ?? "";
    expect(studentView).toContain("response.grade_status");
    expect(studentView).toContain("response.feedback_key");
    expect(studentView).not.toContain("answer_spec");
    expect(studentView).not.toContain("answer_key");
  });
});
