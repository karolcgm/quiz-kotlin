import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface LessonTaskFrameProps extends Omit<ComponentPropsWithoutRef<"article">, "title"> {
  eyebrow: string;
  heading: string;
  description?: string;
  questionNumber?: number;
  questionCount?: number;
  children: ReactNode;
  contentClassName?: string;
}

export function LessonTaskFrame({
  eyebrow,
  heading,
  description,
  questionNumber,
  questionCount,
  children,
  className = "",
  contentClassName = "",
  ...articleProps
}: LessonTaskFrameProps) {
  return (
    <article
      {...articleProps}
      className={`overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-cyan-600 p-3 text-slate-950 shadow-2xl sm:p-5 ${className}`}
      data-lesson-task-frame
    >
      <header className="flex flex-wrap items-start justify-between gap-3 px-2 pb-4 text-white" data-lesson-task-header>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black leading-tight sm:text-4xl">{heading}</h2>
          {description ? <p className="mt-2 max-w-4xl text-sm font-semibold leading-relaxed text-indigo-50 sm:text-base">{description}</p> : null}
        </div>
        {questionNumber && questionCount ? (
          <b className="shrink-0 rounded-2xl bg-white/20 px-3 py-2 text-sm text-white" data-lesson-task-progress>
            Zadanie {questionNumber}/{questionCount}
          </b>
        ) : null}
      </header>
      <div className={`rounded-[1.75rem] bg-white/95 p-4 shadow-inner sm:p-6 ${contentClassName}`} data-lesson-task-content>
        {children}
      </div>
    </article>
  );
}

interface LessonTaskChoiceProps extends ComponentPropsWithoutRef<"button"> {
  selected?: boolean;
}

export function LessonTaskChoice({ selected = false, className = "", ...buttonProps }: LessonTaskChoiceProps) {
  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? "button"}
      aria-pressed={buttonProps["aria-pressed"] ?? selected}
      className={`min-h-10 rounded-xl border-2 px-3 py-1.5 text-sm font-black transition focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 ${selected ? "border-violet-700 bg-violet-700 text-white" : "border-violet-300 bg-white text-slate-950 hover:bg-violet-50"} ${className}`}
      data-lesson-task-choice
    />
  );
}

interface LessonTaskNavigatorProps {
  currentIndex: number;
  taskCount: number;
  completed?: boolean;
  completedCount?: number;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
}

export function LessonTaskNavigator({
  currentIndex,
  taskCount,
  completed = false,
  completedCount,
  onPrevious,
  onNext,
  previousDisabled = currentIndex === 0,
  nextDisabled = currentIndex >= taskCount - 1,
  className = "",
}: LessonTaskNavigatorProps) {
  return (
    <nav
      className={`grid grid-cols-2 items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white p-2 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] ${className}`}
      aria-label="Nawigacja między zadaniami"
      data-lesson-task-navigator
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={previousDisabled}
        className="min-h-11 justify-self-start rounded-xl bg-indigo-100 px-3 font-black text-indigo-950 disabled:opacity-35"
      >
        ← Poprzednie zadanie
      </button>
      <div className="col-span-2 row-start-1 text-center sm:col-span-1 sm:col-start-2">
        <strong className="block text-sm text-indigo-950">Zadanie {currentIndex + 1}/{taskCount}{completed ? " ✓" : ""}</strong>
        {completedCount !== undefined ? <span className="text-xs font-bold text-slate-600">Zaliczone: {completedCount}/{taskCount}</span> : null}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="min-h-11 justify-self-end rounded-xl bg-indigo-700 px-3 font-black text-white disabled:opacity-35 sm:col-start-3"
      >
        Następne zadanie →
      </button>
    </nav>
  );
}
