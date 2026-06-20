"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveTestAction } from "@/lib/actions/tests";
import { WidgetPicker } from "@/components/tests/WidgetPicker";
import { type ComposerItem, TestItemEditor } from "@/components/tests/TestItemEditor";
import { buildWidgetPrompt, getAssessmentWidget } from "@/lib/simulations/registry";
import type { GradeLevel } from "@/types/curriculum";

interface TestComposerProps {
  schools: { id: string; name: string }[];
  initialWidget?: string;
}

function createWidgetItem(slug: string, position: number): ComposerItem {
  const widget = getAssessmentWidget(slug) ?? getAssessmentWidget("os-liczbowa");
  const params = widget?.defaultParams ?? { start: 4, change: -7 };

  return {
    localId: crypto.randomUUID(),
    position,
    simulationSlug: widget?.slug ?? "os-liczbowa",
    widgetKind: widget?.widgetKind ?? "number-line-result",
    skill: widget?.skill ?? "addition",
    title: widget?.title ?? "Pytanie matematyczne",
    prompt: buildWidgetPrompt(widget?.slug ?? "os-liczbowa", params),
    points: widget?.defaultPoints ?? 1,
    params,
  };
}

function normalizeItem(item: ComposerItem, index: number): ComposerItem {
  return {
    ...item,
    position: index + 1,
    prompt: buildWidgetPrompt(item.simulationSlug, item.params),
  };
}

export function TestComposer({ schools, initialWidget }: TestComposerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<ComposerItem[]>(() =>
    initialWidget ? [createWidgetItem(initialWidget, 1)] : [],
  );

  const normalizedItems = useMemo(
    () => items.map((item, index) => normalizeItem(item, index)),
    [items],
  );

  const addWidget = (slug: string) => {
    setItems((current) => [...current, createWidgetItem(slug, current.length + 1)]);
  };

  const updateItem = (localId: string, nextItem: ComposerItem) => {
    setItems((current) => current.map((item) => (item.localId === localId ? nextItem : item)));
  };

  const removeItem = (localId: string) => {
    setItems((current) => current.filter((item) => item.localId !== localId));
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await saveTestAction(formData);
      if (result.ok) {
        router.push("/nauczyciel/testy");
        router.refresh();
        return;
      }

      setError(result.error ?? "Nie udało się zapisać testu.");
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="itemsJson" value={JSON.stringify(normalizedItems)} />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Tytuł testu</span>
          <input
            name="title"
            required
            defaultValue="Dodawanie i odejmowanie na osi"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Szkoła</span>
          <select
            name="schoolId"
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="">Wybierz szkołę</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Klasa</span>
          <select
            name="classLevel"
            defaultValue={4 satisfies GradeLevel}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
              <option key={grade} value={grade}>
                Klasa {grade}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Opis</span>
          <textarea
            name="description"
            rows={2}
            defaultValue="Krótki test sprawdzający dodawanie i odejmowanie."
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Instrukcja dla ucznia</span>
          <textarea
            name="instruction"
            rows={2}
            defaultValue="Oblicz wynik każdego działania. Możesz korzystać z osi liczbowej."
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
      </div>

      <WidgetPicker onAddWidget={addWidget} />

      <div className="space-y-4">
        {normalizedItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
            Dodaj przynajmniej jeden widget testowy.
          </div>
        )}
        {normalizedItems.map((item) => (
          <TestItemEditor
            key={item.localId}
            item={item}
            onChange={(nextItem) => updateItem(item.localId, nextItem)}
            onRemove={() => removeItem(item.localId)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={normalizedItems.length === 0 || isPending}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {isPending ? "Zapisywanie..." : "Zapisz szkic"}
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={normalizedItems.length === 0 || isPending}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "Zapisywanie..." : "Opublikuj test"}
        </button>
      </div>
    </form>
  );
}
