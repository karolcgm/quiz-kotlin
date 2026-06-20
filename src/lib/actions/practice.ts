"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { buildWidgetPrompt, getAssessmentWidget } from "@/lib/simulations/registry";
import type { TestWidgetAnswer, TestWidgetParams } from "@/types/testWidget";

type PracticeItemPayload = {
  localId: string;
  slug: string;
  widgetKind: string;
  params: TestWidgetParams;
  points: number;
};

function answerFromForm(formData: FormData, fieldPrefix: string): TestWidgetAnswer {
  const kind = formData.get(`${fieldPrefix}.kind`)?.toString();

  if (kind === "fraction") {
    return {
      numerator: Number(formData.get(`${fieldPrefix}.numerator`) ?? 0),
      denominator: Number(formData.get(`${fieldPrefix}.denominator`) ?? 1),
    };
  }

  if (kind === "comparison") {
    const comparison = formData.get(`${fieldPrefix}.comparison`)?.toString();
    return {
      comparison: comparison === "<" || comparison === ">" ? comparison : "=",
    };
  }

  return {
    result: Number(formData.get(`${fieldPrefix}.result`) ?? 0),
  };
}

export async function submitPracticeAction(formData: FormData) {
  const student = await requireRole("student");
  const supabase = await createClient();
  const itemsJson = formData.get("itemsJson")?.toString();

  if (!itemsJson) {
    throw new Error("Brakuje pytań szybkiego testu.");
  }

  let items: PracticeItemPayload[];

  try {
    const parsedItems = JSON.parse(itemsJson);
    if (!Array.isArray(parsedItems)) {
      throw new Error("Invalid practice payload.");
    }
    items = parsedItems as PracticeItemPayload[];
  } catch {
    throw new Error("Nie udało się odczytać szybkiego testu. Wygeneruj go ponownie.");
  }

  if (items.length === 0) {
    throw new Error("Dodaj przynajmniej jedno pytanie.");
  }

  const gradedItems = items.map((item) => {
    const widget = getAssessmentWidget(item.slug);
    const answer = answerFromForm(formData, `practice-${item.localId}`);
    const result = widget?.grade(item.params, answer, item.points) ?? {
      isCorrect: false,
      score: 0,
      maxScore: item.points,
      skill: "addition" as const,
      expectedAnswer: { result: 0 },
    };

    return {
      item,
      answer,
      result,
      prompt: buildWidgetPrompt(item.slug, item.params),
    };
  });

  const totalScore = gradedItems.reduce((sum, item) => sum + item.result.score, 0);
  const maxScore = gradedItems.reduce((sum, item) => sum + item.result.maxScore, 0);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const { data: attempt, error: attemptError } = await supabase
    .from("practice_attempts")
    .insert({
      student_id: student.id,
      title: "Szybki test ucznia",
      total_score: totalScore,
      max_score: maxScore,
      percentage,
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    throw new Error(attemptError?.message ?? "Nie udało się zapisać szybkiego testu.");
  }

  const { error: answersError } = await supabase.from("practice_answers").insert(
    gradedItems.map(({ item, answer, result, prompt }) => ({
      practice_attempt_id: attempt.id,
      simulation_slug: item.slug,
      widget_kind: item.widgetKind,
      skill: result.skill,
      prompt,
      params: item.params,
      answer,
      expected_answer: result.expectedAnswer,
      is_correct: result.isCorrect,
      score: result.score,
      max_score: result.maxScore,
    })),
  );

  if (answersError) {
    throw new Error(answersError.message);
  }

  redirect(`/uczen/postepy?practice=${attempt.id}`);
}
