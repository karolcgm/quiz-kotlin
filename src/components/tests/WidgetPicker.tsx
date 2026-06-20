"use client";

import { getAssessmentWidgets } from "@/lib/simulations/registry";

interface WidgetPickerProps {
  onAddWidget: (slug: string) => void;
}

export function WidgetPicker({ onAddWidget }: WidgetPickerProps) {
  const widgets = getAssessmentWidgets();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-lg font-bold text-slate-900">Widgety testowe</h3>
      <p className="mt-2 text-sm text-slate-600">
        Te same widgety działają jako prezentacja, ćwiczenie ucznia i pytanie na klasówce.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {widgets.map((widget) => (
          <button
            key={widget.slug}
            type="button"
            onClick={() => onAddWidget(widget.slug)}
            className="rounded-xl border border-indigo-100 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            <span className="font-bold text-slate-900">{widget.title}</span>
            <span className="mt-1 block text-sm text-slate-600">{widget.lessonUse}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
