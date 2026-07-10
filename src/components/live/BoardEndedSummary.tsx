import type { BoardStageAggregate } from "@/types/lessonSession";

interface BoardEndedSummaryProps {
  lessonTitle: string;
  topicId: string;
  stageSummaries?: BoardStageAggregate[];
  participantCount?: number | null;
}

export function BoardEndedSummary({
  lessonTitle,
  topicId,
  stageSummaries = [],
  participantCount,
}: BoardEndedSummaryProps) {
  const totalSubmitted = stageSummaries.reduce((sum, row) => sum + row.submittedCount, 0);
  const totalCorrect = stageSummaries.reduce((sum, row) => sum + row.correctCount, 0);
  const overallRate =
    totalSubmitted > 0 ? Math.round((totalCorrect / totalSubmitted) * 100) : null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12 text-center">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">{topicId}</p>
        <h1 className="text-4xl font-black text-white sm:text-5xl">Lekcja zakończona</h1>
        <p className="text-xl text-slate-300">{lessonTitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {participantCount != null ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-black text-white">{participantCount}</p>
            <p className="mt-1 text-sm text-slate-400">uczestników</p>
          </div>
        ) : null}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-3xl font-black text-white">{totalSubmitted}</p>
          <p className="mt-1 text-sm text-slate-400">odpowiedzi łącznie</p>
        </div>
        {overallRate !== null ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-black text-emerald-300">{overallRate}%</p>
            <p className="mt-1 text-sm text-slate-400">poprawnych pierwszych kroków</p>
          </div>
        ) : null}
      </div>

      {stageSummaries.length > 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Etapy</p>
          <ul className="mt-4 space-y-3">
            {stageSummaries.map((row) => {
              const rate =
                row.submittedCount > 0
                  ? Math.round((row.correctCount / row.submittedCount) * 100)
                  : null;
              return (
                <li
                  key={row.stageId}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <span className="font-mono text-sm text-slate-300">{row.stageId}</span>
                  <span className="text-sm text-slate-200">
                    {row.submittedCount} odp. {rate !== null ? `· ${rate}% poprawnych` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-slate-500">Agregaty anonimowe — bez imion i ocen indywidualnych.</p>
        </div>
      ) : null}
    </div>
  );
}
