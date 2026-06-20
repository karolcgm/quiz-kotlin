"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MathWidgetQuestion } from "@/components/tests/widgets/MathWidgetQuestion";
import { buildWidgetPrompt, getAssessmentWidget } from "@/lib/simulations/registry";
import type { TestWidgetAnswer, TestWidgetParams } from "@/types/testWidget";

interface PreviewItem {
  id: string;
  simulation_slug: string;
  title: string;
  prompt: string;
  points: number;
  params: TestWidgetParams;
}

interface TeacherTestPreviewRunnerProps {
  testId: string;
  title: string;
  instruction: string | null;
  items: PreviewItem[];
}

type GradedPreviewItem = {
  id: string;
  title: string;
  prompt: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
};

function answerFromForm(formData: FormData, inputName: string): TestWidgetAnswer {
  const kind = formData.get(`${inputName}.kind`)?.toString();

  if (kind === "fraction") {
    return {
      numerator: Number(formData.get(`${inputName}.numerator`) ?? 0),
      denominator: Number(formData.get(`${inputName}.denominator`) ?? 1),
    };
  }

  if (kind === "comparison") {
    const comparison = formData.get(`${inputName}.comparison`)?.toString();
    return {
      comparison: comparison === "<" || comparison === ">" ? comparison : "=",
    };
  }

  return {
    result: Number(formData.get(`${inputName}.result`) ?? 0),
  };
}

export function TeacherTestPreviewRunner({
  testId,
  title,
  instruction,
  items,
}: TeacherTestPreviewRunnerProps) {
  const [gradedItems, setGradedItems] = useState<GradedPreviewItem[] | null>(null);
  const [summary, setSummary] = useState<{ total: number; max: number; percentage: number } | null>(
    null,
  );
  const [attemptKey, setAttemptKey] = useState(0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const results = items.map((item) => {
      const widget = getAssessmentWidget(item.simulation_slug);
      const answer = answerFromForm(formData, `answer-${item.id}`);
      const gradeResult = widget?.grade(item.params, answer, item.points) ?? {
        isCorrect: false,
        score: 0,
        maxScore: item.points,
        skill: "addition" as const,
        expectedAnswer: { result: 0 },
      };

      return {
        id: item.id,
        title: item.title,
        prompt: buildWidgetPrompt(item.simulation_slug, item.params),
        isCorrect: gradeResult.isCorrect,
        score: gradeResult.score,
        maxScore: gradeResult.maxScore,
      };
    });

    const total = results.reduce((sum, item) => sum + item.score, 0);
    const max = results.reduce((sum, item) => sum + item.maxScore, 0);

    setGradedItems(results);
    setSummary({
      total,
      max,
      percentage: max > 0 ? Math.round((total / max) * 100) : 0,
    });
  };

  const resetPreview = () => {
    setGradedItems(null);
    setSummary(null);
    setAttemptKey((current) => current + 1);
  };

  const gradedById = new Map(gradedItems?.map((item) => [item.id, item]) ?? []);
  const isReviewMode = gradedItems !== null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
        <p className="font-bold">Podgląd ucznia</p>
        <p className="mt-1">
          Rozwiązujesz test dokładnie tak, jak widzą go dzieci. Wynik jest tylko dla Ciebie — nie
          trafia do statystyk uczniów.
        </p>
        <Link
          href={`/nauczyciel/testy/${testId}/edytuj`}
          className="mt-3 inline-block font-semibold text-sky-800 underline"
        >
          Wróć do edycji testu
        </Link>
      </div>

      <form key={attemptKey} onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">Test</p>
          <h1 className="mt-3 text-4xl font-bold">{title}</h1>
          {instruction && <p className="mt-4 text-lg text-indigo-100">{instruction}</p>}
        </div>

        {items.map((item, index) => {
          const feedback = gradedById.get(item.id);

          return (
            <div key={item.id} className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Pytanie {index + 1}
              </p>
              {feedback && (
                <div
                  className={`rounded-xl px-4 py-3 font-semibold ${
                    feedback.isCorrect
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border border-red-200 bg-red-50 text-red-900"
                  }`}
                >
                  {feedback.isCorrect
                    ? `Dobrze! ${feedback.score}/${feedback.maxScore} pkt`
                    : `Niepoprawnie — 0/${feedback.maxScore} pkt. Poprawna odpowiedź jest poniżej.`}
                </div>
              )}
              <MathWidgetQuestion
                slug={item.simulation_slug}
                params={item.params}
                inputName={`answer-${item.id}`}
                readOnly={isReviewMode}
                revealAnswer={isReviewMode}
              />
            </div>
          );
        })}

        {summary && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
            <h2 className="text-2xl font-bold text-indigo-950">Twój wynik</h2>
            <p className="mt-2 text-lg font-semibold text-indigo-900">
              {summary.total}/{summary.max} pkt · {summary.percentage}%
            </p>
            <p className="mt-2 text-indigo-800">
              {summary.percentage >= 90
                ? "Świetnie — test wygląda jasno dla uczniów."
                : summary.percentage >= 60
                  ? "Całkiem dobrze. Sprawdź pytania z błędami."
                  : "Warto jeszcze raz przejrzeć trudniejsze pytania przed wysłaniem uczniom."}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {!isReviewMode ? (
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-700"
            >
              Sprawdź odpowiedzi
            </button>
          ) : (
            <button
              type="button"
              onClick={resetPreview}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-lg font-semibold text-slate-700 hover:bg-slate-50"
            >
              Rozwiąż ponownie
            </button>
          )}
          <Link
            href="/nauczyciel/testy"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-lg font-semibold text-slate-700 hover:bg-slate-50"
          >
            Lista testów
          </Link>
        </div>
      </form>
    </div>
  );
}
