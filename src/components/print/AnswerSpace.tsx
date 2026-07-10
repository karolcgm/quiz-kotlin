import { cn } from "@/lib/cn";

interface AnswerSpaceProps {
  rows?: number;
  label?: string;
  className?: string;
}

/** Pole odpowiedzi na arkuszu A4 (spec §16 — AnswerSpace) */
export function AnswerSpace({ rows = 2, label, className }: AnswerSpaceProps) {
  return (
    <div className={cn("answer-space mt-2 space-y-0", className)} aria-label={label ?? "Miejsce na odpowiedź"}>
      {label ? <p className="mb-1 text-xs text-slate-600">{label}</p> : null}
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-9 border-b border-slate-400 last:border-slate-300"
          aria-hidden
        />
      ))}
    </div>
  );
}
