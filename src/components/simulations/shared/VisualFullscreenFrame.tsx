"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";

interface VisualFullscreenFrameProps {
  children: ReactNode;
  label?: string;
}

export function VisualFullscreenFrame({
  children,
  label = "Wizualizacja zadania",
}: VisualFullscreenFrameProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const regionId = useId();

  const exitFullscreen = useCallback(() => setFullscreen(false), []);
  const toggleFullscreen = useCallback(() => setFullscreen((value) => !value), []);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        exitFullscreen();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [exitFullscreen, fullscreen]);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
          <p className="font-bold text-slate-900">{label}</p>
          <button
            type="button"
            onClick={exitFullscreen}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Wyjdź z pełnego ekranu (Esc)
          </button>
        </div>
        <div id={regionId} className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-controls={regionId}
          aria-expanded={false}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-800 shadow-sm transition hover:bg-indigo-50"
        >
          <span aria-hidden="true">⛶</span>
          Pełny ekran
        </button>
      </div>
      <div id={regionId}>{children}</div>
    </div>
  );
}
