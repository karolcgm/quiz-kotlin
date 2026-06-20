"use client";

import { useMemo, useState } from "react";
import { submitPracticeAction } from "@/lib/actions/practice";
import {
  buildRandomWidgetParams,
  buildWidgetPrompt,
  getAssessmentWidget,
  getAssessmentWidgets,
} from "@/lib/simulations/registry";
import { MathWidgetQuestion } from "@/components/tests/widgets/MathWidgetQuestion";
import type { TestWidgetParams } from "@/types/testWidget";

type PracticeItem = {
  localId: string;
  slug: string;
  widgetKind: string;
  title: string;
  prompt: string;
  params: TestWidgetParams;
  points: number;
};

function createPracticeItem(slug: string): PracticeItem {
  const widget = getAssessmentWidget(slug) ?? getAssessmentWidget("os-liczbowa");
  const params = buildRandomWidgetParams(widget?.slug ?? "os-liczbowa");

  return {
    localId: crypto.randomUUID(),
    slug: widget?.slug ?? "os-liczbowa",
    widgetKind: widget?.widgetKind ?? "number-line-result",
    title: widget?.title ?? "Pytanie matematyczne",
    prompt: buildWidgetPrompt(widget?.slug ?? "os-liczbowa", params),
    params,
    points: widget?.defaultPoints ?? 1,
  };
}

export function QuickPracticeBuilder() {
  const widgets = getAssessmentWidgets();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(["dodawanie-do-100", "odejmowanie-do-100"]);
  const [questionCount, setQuestionCount] = useState(5);
  const [items, setItems] = useState<PracticeItem[]>([]);
  const serializedItems = useMemo(
    () =>
      items.map((item) => ({
        localId: item.localId,
        slug: item.slug,
        widgetKind: item.widgetKind,
        params: item.params,
        points: item.points,
      })),
    [items],
  );

  const toggleSlug = (slug: string) => {
    setSelectedSlugs((current) =>
      current.includes(slug) ? current.filter((currentSlug) => currentSlug !== slug) : [...current, slug],
    );
  };

  const generatePractice = () => {
    const source = selectedSlugs.length > 0 ? selectedSlugs : ["os-liczbowa"];
    setItems(
      Array.from({ length: questionCount }).map((_, index) =>
        createPracticeItem(source[index % source.length]),
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-2xl font-bold text-slate-900">Skomponuj szybki test</h2>
        <p className="mt-2 text-slate-600">
          Wybierz obszary, wygeneruj zestaw i rozwiąż go od razu. Próba zapisze się w Twoich
          postępach.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {widgets.map((widget) => (
            <label
              key={widget.slug}
              className={`rounded-xl border p-3 transition ${
                selectedSlugs.includes(widget.slug)
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSlugs.includes(widget.slug)}
                onChange={() => toggleSlug(widget.slug)}
                className="mr-2"
              />
              <span className="font-semibold text-slate-900">{widget.title}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">Liczba pytań</span>
            <input
              type="number"
              min={3}
              max={12}
              value={questionCount}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              className="w-32 rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <button
            type="button"
            onClick={generatePractice}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Wygeneruj szybki test
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <form action={submitPracticeAction} className="space-y-6">
          <input type="hidden" name="itemsJson" value={JSON.stringify(serializedItems)} />
          {items.map((item) => (
            <MathWidgetQuestion
              key={item.localId}
              slug={item.slug}
              params={item.params}
              inputName={`practice-${item.localId}`}
            />
          ))}
          <button className="rounded-xl bg-emerald-600 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-700">
            Zapisz wynik i zobacz postępy
          </button>
        </form>
      )}
    </div>
  );
}
