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
import { simulations } from "@/data/simulations";
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

export function QuickPracticeBuilder({ grade = 5 }: { grade?: number }) {
  const gradeSlugs = new Set(simulations.filter((simulation) => simulation.grades.includes(grade as never)).map((simulation) => simulation.slug));
  const widgets = getAssessmentWidgets().filter((widget) => gradeSlugs.has(widget.slug)).slice(0, 18);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() => widgets.slice(0, 2).map((widget) => widget.slug));
  const [questionCount, setQuestionCount] = useState(5);
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
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
    setSelectionMessage(null);
    setSelectedSlugs((current) => {
      if (current.includes(slug)) return current.filter((currentSlug) => currentSlug !== slug);
      if (current.length >= 3) {
        setSelectionMessage("Wybierz najwyżej 3 obszary na jedną krótką powtórkę.");
        return current;
      }
      return [...current, slug];
    });
  };

  const generatePractice = () => {
    const source = selectedSlugs.length > 0 ? selectedSlugs : [widgets[0]?.slug ?? "os-liczbowa"];
    setItems(
      Array.from({ length: questionCount }).map((_, index) =>
        createPracticeItem(source[index % source.length]),
      ),
    );
    setActiveItemIndex(0);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-2xl font-bold text-slate-900">Ułóż krótką powtórkę</h2>
        <p className="mt-2 text-slate-600">
          Wybierz 1–3 obszary z klasy {grade}, rozwiąż 3–8 pytań i zapisz próbę w swoich postępach. Punkty dostajesz tylko za poprawienie najlepszego wyniku — tej puli nie można nabijać wieloma próbami.
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
        {selectionMessage ? <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900" role="status">{selectionMessage}</p> : null}
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">Liczba pytań</span>
            <input
              type="number"
              min={3}
              max={8}
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
            Wygeneruj powtórkę
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <form action={submitPracticeAction} className="space-y-6">
          <input type="hidden" name="itemsJson" value={JSON.stringify(serializedItems)} />
          <p className="text-sm font-semibold text-slate-600">Pytanie {activeItemIndex + 1} z {items.length}</p>
          {items.map((item, index) => (
            <div key={item.localId} hidden={index !== activeItemIndex} aria-hidden={index !== activeItemIndex}>
              <MathWidgetQuestion slug={item.slug} params={item.params} inputName={`practice-${item.localId}`} />
            </div>
          ))}
          <div className="flex items-center justify-between gap-3">
            <button type="button" disabled={activeItemIndex === 0} onClick={() => setActiveItemIndex((current) => Math.max(0, current - 1))} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold disabled:opacity-40">← Wstecz</button>
            {activeItemIndex < items.length - 1 ? (
              <button type="button" onClick={() => setActiveItemIndex((current) => Math.min(items.length - 1, current + 1))} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">Dalej →</button>
            ) : (
              <button className="rounded-xl bg-emerald-600 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-700">Zapisz wynik i zobacz postępy</button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
