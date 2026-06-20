"use client";

import { useActionState, useMemo, useState } from "react";
import { saveTestAction } from "@/lib/actions/tests";
import { WidgetPicker } from "@/components/tests/WidgetPicker";
import { WordProblemPicker } from "@/components/tests/WordProblemPicker";
import { type ComposerItem, TestItemEditor } from "@/components/tests/TestItemEditor";
import { buildWidgetPrompt, getAssessmentWidget } from "@/lib/simulations/registry";
import { getExpectedAnswer } from "@/lib/wordProblems/formulas";
import { isWordProblemParams } from "@/lib/wordProblems/widget";
import type { GradeLevel } from "@/types/curriculum";

export interface ExistingTestDraft {
  id: string;
  title: string;
  description: string;
  instruction: string;
  schoolId: string;
  classLevel: GradeLevel;
  status: string;
  items: ComposerItem[];
}

interface TestComposerProps {
  schools: { id: string; name: string }[];
  initialWidget?: string;
  existingTest?: ExistingTestDraft;
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
  let params = item.params;
  if (isWordProblemParams(params)) {
    params = {
      ...params,
      expectedResult: getExpectedAnswer(params.formula, params.values, params.expectedOverride),
    };
  }

  return {
    ...item,
    position: index + 1,
    prompt: buildWidgetPrompt(item.simulationSlug, params),
    params,
  };
}

export function TestComposer({ schools, initialWidget, existingTest }: TestComposerProps) {
  const [state, formAction, isPending] = useActionState(saveTestAction, null);
  const defaultSchoolId =
    existingTest?.schoolId ?? (schools.length === 1 ? schools[0]?.id : "") ?? "";
  const [items, setItems] = useState<ComposerItem[]>(() => {
    if (existingTest) {
      return existingTest.items;
    }

    return initialWidget ? [createWidgetItem(initialWidget, 1)] : [];
  });

  const normalizedItems = useMemo(
    () => items.map((item, index) => normalizeItem(item, index)),
    [items],
  );

  const addWidget = (slug: string) => {
    setItems((current) => [...current, createWidgetItem(slug, current.length + 1)]);
  };

  const addWordProblems = (newItems: ComposerItem[]) => {
    setItems((current) => {
      const start = current.length;
      return [
        ...current,
        ...newItems.map((item, index) => ({
          ...item,
          position: start + index + 1,
        })),
      ];
    });
  };

  const updateItem = (localId: string, nextItem: ComposerItem) => {
    setItems((current) => current.map((item) => (item.localId === localId ? nextItem : item)));
  };

  const removeItem = (localId: string) => {
    setItems((current) => current.filter((item) => item.localId !== localId));
  };

  const isEditing = Boolean(existingTest);

  return (
    <form action={formAction} className="space-y-6">
      {existingTest && <input type="hidden" name="testId" value={existingTest.id} />}
      <input type="hidden" name="itemsJson" value={JSON.stringify(normalizedItems)} />

      {state?.ok === false && state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800">
          {state.error}
        </div>
      )}

      {isEditing && existingTest?.status === "published" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          Ten test jest opublikowany. Zapis jako szkic cofnie publikację — uczniowie nie dostaną go w
          nowych przypisaniach, dopóki nie opublikujesz ponownie.
        </div>
      )}

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950">
        <p className="font-bold">Zapisz szkic vs Opublikuj test</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Zapisz szkic</strong> — test zostaje u Ciebie. Uczniowie go nie widzą. Możesz
            wrócić do edycji później.
          </li>
          <li>
            <strong>Opublikuj test</strong> — test jest gotowy do wysłania uczniom w zakładce
            Przypisania.
          </li>
        </ul>
      </div>

      {schools.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-900">
          Najpierw dodaj szkołę w panelu uczniów. Bez szkoły test nie zapisze się poprawnie.
        </div>
      )}

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Tytuł testu</span>
          <input
            name="title"
            required
            defaultValue={existingTest?.title ?? "Dodawanie i odejmowanie na osi"}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Szkoła</span>
          <select
            name="schoolId"
            required
            defaultValue={defaultSchoolId}
            disabled={schools.length === 0}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 disabled:bg-slate-100"
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
            defaultValue={existingTest?.classLevel ?? (4 satisfies GradeLevel)}
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
            defaultValue={
              existingTest?.description ?? "Krótki test sprawdzający dodawanie i odejmowanie."
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Instrukcja dla ucznia</span>
          <textarea
            name="instruction"
            rows={2}
            defaultValue={
              existingTest?.instruction ??
              "Oblicz wynik każdego działania. Możesz korzystać z osi liczbowej."
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
      </div>

      <WidgetPicker onAddWidget={addWidget} />
      <WordProblemPicker onAddProblems={addWordProblems} />

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
          disabled={normalizedItems.length === 0 || isPending || schools.length === 0}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {isPending ? "Zapisywanie..." : isEditing ? "Zapisz zmiany jako szkic" : "Zapisz szkic"}
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={normalizedItems.length === 0 || isPending || schools.length === 0}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "Zapisywanie..." : isEditing ? "Zapisz i opublikuj" : "Opublikuj test"}
        </button>
      </div>
    </form>
  );
}
