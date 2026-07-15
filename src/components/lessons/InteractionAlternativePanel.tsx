import type { ReactNode } from "react";

/** Wspólna, klawiaturowa alternatywa dla gestu implementowanego przez model działowy. */
export function InteractionAlternativePanel({
  title = "Alternatywa bez przeciągania",
  instruction,
  children,
}: {
  title?: string;
  instruction: string;
  children: ReactNode;
}) {
  return (
    <section className="interaction-alternative-panel rounded-2xl border-2 border-dashed p-4" aria-label={title}>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm">{instruction}</p>
      <div className="mt-3 flex flex-wrap gap-2 [&_button]:min-h-11 [&_button]:min-w-11 [&_input]:min-h-11">
        {children}
      </div>
    </section>
  );
}
