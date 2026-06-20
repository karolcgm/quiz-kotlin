"use client";

import { useCallback, useRef } from "react";
import { MathWidgetQuestion } from "@/components/tests/widgets/MathWidgetQuestion";
import { TestTimer } from "@/components/tests/TestTimer";
import { submitTestAction } from "@/lib/actions/submissions";
import type { TestWidgetParams } from "@/types/testWidget";

interface RunnerItem {
  id: string;
  simulation_slug: string;
  title: string;
  prompt: string;
  points: number;
  params: TestWidgetParams;
}

interface TestRunnerProps {
  assignmentId: string;
  submissionId: string;
  title: string;
  instruction: string | null;
  items: RunnerItem[];
  expiresAt: string | null;
  timeLimitMinutes: number | null;
}

export function TestRunner({
  assignmentId,
  submissionId,
  title,
  instruction,
  items,
  expiresAt,
  timeLimitMinutes,
}: TestRunnerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);

  const submitForm = useCallback(() => {
    if (submittingRef.current || !formRef.current) {
      return;
    }
    submittingRef.current = true;
    formRef.current.requestSubmit();
  }, []);

  return (
    <form ref={formRef} action={submitTestAction} className="space-y-6">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <input type="hidden" name="submissionId" value={submissionId} />
      <input type="hidden" name="itemIdsJson" value={JSON.stringify(items.map((item) => item.id))} />

      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">Test</p>
        <h1 className="mt-3 text-4xl font-bold">{title}</h1>
        {instruction && <p className="mt-4 text-lg text-indigo-100">{instruction}</p>}
        {timeLimitMinutes && (
          <p className="mt-3 text-sm font-semibold text-indigo-100">
            Limit czasu: {timeLimitMinutes} min (od momentu rozpoczęcia)
          </p>
        )}
      </div>

      <TestTimer expiresAt={expiresAt} onExpire={submitForm} />

      {items.map((item) => (
        <MathWidgetQuestion
          key={item.id}
          slug={item.simulation_slug}
          params={item.params}
          inputName={`answer-${item.id}`}
        />
      ))}

      <button
        type="submit"
        className="rounded-xl bg-emerald-600 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-700"
      >
        Koniec — oddaj test
      </button>
    </form>
  );
}
