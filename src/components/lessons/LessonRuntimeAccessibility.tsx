"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface LessonAccessibilityContextValue {
  highContrast: boolean;
  motionPaused: boolean;
  toggleHighContrast: () => void;
  toggleMotion: () => void;
}

const LessonAccessibilityContext = createContext<LessonAccessibilityContextValue | null>(null);

export function LessonRuntimeAccessibilityProvider({ children, className = "" }: {
  children: ReactNode;
  className?: string;
}) {
  const [highContrast, setHighContrast] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const value = useMemo<LessonAccessibilityContextValue>(() => ({
    highContrast,
    motionPaused,
    toggleHighContrast: () => setHighContrast((current) => !current),
    toggleMotion: () => setMotionPaused((current) => !current),
  }), [highContrast, motionPaused]);

  return (
    <LessonAccessibilityContext.Provider value={value}>
      <div
        className={`lesson-runtime ${className}`.trim()}
        data-high-contrast={highContrast || undefined}
        data-motion-paused={motionPaused || undefined}
      >
        {children}
      </div>
    </LessonAccessibilityContext.Provider>
  );
}

export function LessonAccessibilityControls({ className = "" }: { className?: string }) {
  const context = useContext(LessonAccessibilityContext);
  if (!context) return null;

  return (
    <div className={`lesson-accessibility-controls flex flex-wrap gap-2 ${className}`.trim()} aria-label="Ustawienia dostępności lekcji">
      <button
        type="button"
        aria-pressed={context.highContrast}
        onClick={context.toggleHighContrast}
        className="min-h-11 rounded-xl border border-current px-3 text-sm font-bold"
      >
        {context.highContrast ? "Zwykły kontrast" : "Wysoki kontrast"}
      </button>
      <button
        type="button"
        aria-pressed={context.motionPaused}
        onClick={context.toggleMotion}
        className="min-h-11 rounded-xl border border-current px-3 text-sm font-bold"
      >
        {context.motionPaused ? "Wznów ruch" : "Zatrzymaj ruch"}
      </button>
    </div>
  );
}

/** Utrzymuje widoczny focus i ogłasza wyłącznie nazwę nowego kroku. */
export function LessonStageFocusRegion({
  stageKey,
  announcement,
  children,
  className = "",
}: {
  stageKey: string;
  announcement: string;
  children: ReactNode;
  className?: string;
}) {
  const regionRef = useRef<HTMLDivElement>(null);
  const previousStageKeyRef = useRef(stageKey);

  useEffect(() => {
    if (previousStageKeyRef.current === stageKey) return;
    previousStageKeyRef.current = stageKey;
    regionRef.current?.focus({ preventScroll: true });
  }, [stageKey]);

  return (
    <div
      ref={regionRef}
      tabIndex={-1}
      className={`lesson-stage-focus-region ${className}`.trim()}
      data-stage-key={stageKey}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      {children}
    </div>
  );
}
