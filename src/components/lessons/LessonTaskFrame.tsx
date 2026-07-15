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
      aria-pressed={buttonProps["aria-pressed"] ?? selected}
      className={`min-h-10 rounded-xl border-2 px-3 py-1.5 text-sm font-black transition focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 ${selected ? "border-violet-700 bg-violet-700 text-white" : "border-violet-300 bg-white text-slate-950 hover:bg-violet-50"} ${className}`}
      data-lesson-task-choice
    />
  );
}
