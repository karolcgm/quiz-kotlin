"use client";

import Link from "next/link";
import { useEffect } from "react";

export type PrintViewMode = "student" | "key" | "key-separate";

interface PrintPreviewToolbarProps {
  lessonId: string;
  lessonTitle: string;
  resourceId: string;
  resourceOptions: { id: string; title: string }[];
  viewMode: PrintViewMode;
  prepHref: string;
  pageCount: number;
  version?: string;
  /** Niestandardowe linki (np. generator A/B zamiast statycznych materiałów) */
  buildResourceHref?: (resourceId: string, viewMode: PrintViewMode) => string;
}

export function PrintPreviewToolbar({
  lessonId,
  lessonTitle,
  resourceId,
  resourceOptions,
  viewMode,
  prepHref,
  pageCount,
  version,
  buildResourceHref,
}: PrintPreviewToolbarProps) {
  useEffect(() => {
    const trigger = document.getElementById("lesson-print-trigger");
    if (!trigger) return;
    const handler = () => window.print();
    trigger.addEventListener("click", handler);
    return () => trigger.removeEventListener("click", handler);
  }, []);

  const hrefFor = (resId: string, view: PrintViewMode) =>
    buildResourceHref?.(resId, view) ?? `/nauczyciel/lekcje/${lessonId}/druk?resource=${resId}&view=${view}`;

  return (
    <div className="no-print rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Podgląd wydruku A4</p>
            <h1 className="text-lg font-bold text-slate-900">{lessonTitle}</h1>
            <p className="text-sm text-slate-600">
              {pageCount} {pageCount === 1 ? "strona" : pageCount < 5 ? "strony" : "stron"}
              {version ? ` · wersja ${version}` : ""} · skala 100&nbsp;%
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Materiał</p>
            <div className="flex flex-wrap gap-2">
              {resourceOptions.map((option) => (
                <Link
                  key={option.id}
                  href={hrefFor(option.id, viewMode)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    option.id === resourceId
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Widok</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={hrefFor(resourceId, "student")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  viewMode === "student"
                    ? "bg-teal-700 text-white"
                    : "border border-slate-200 text-slate-700"
                }`}
              >
                Arkusz ucznia
              </Link>
              <Link
                href={hrefFor(resourceId, "key")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  viewMode === "key"
                    ? "bg-slate-800 text-white"
                    : "border border-slate-200 text-slate-700"
                }`}
              >
                Klucz (na końcu)
              </Link>
              <Link
                href={hrefFor(resourceId, "key-separate")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  viewMode === "key-separate"
                    ? "bg-slate-800 text-white"
                    : "border border-slate-200 text-slate-700"
                }`}
              >
                Klucz — osobna strona
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={prepHref}
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            ← Przygotowanie
          </Link>
          <button
            type="button"
            id="lesson-print-trigger"
            className="inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Drukuj / PDF
          </button>
        </div>
      </div>
    </div>
  );
}
