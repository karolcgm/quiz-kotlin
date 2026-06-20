import { MathWidgetQuestion } from "@/components/tests/widgets/MathWidgetQuestion";
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
  title: string;
  instruction: string | null;
  items: RunnerItem[];
}

export function TestRunner({ assignmentId, title, instruction, items }: TestRunnerProps) {
  return (
    <form action={submitTestAction} className="space-y-6">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <input type="hidden" name="itemIdsJson" value={JSON.stringify(items.map((item) => item.id))} />

      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">Test</p>
        <h1 className="mt-3 text-4xl font-bold">{title}</h1>
        {instruction && <p className="mt-4 text-lg text-indigo-100">{instruction}</p>}
      </div>

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
        Wyślij odpowiedzi
      </button>
    </form>
  );
}
