import type { LessonSessionHistogramBucket } from "@/types/lessonSession";

interface TeacherSessionHistogramProps {
  buckets: LessonSessionHistogramBucket[];
  expectedOperatorIndex?: number | null;
  solutionRevealed: boolean;
}

export function TeacherSessionHistogram({
  buckets,
  expectedOperatorIndex,
  solutionRevealed,
}: TeacherSessionHistogramProps) {
  const maxCount = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        Brak odpowiedzi na tym etapie — histogram pojawi się po wysłaniu.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">Strategie (anonimowo)</p>
        <p className="text-xs text-slate-500">{total} odpowiedzi</p>
      </div>
      <ul className="space-y-2" aria-label="Histogram wyborów pierwszego działania">
        {buckets.map((bucket) => {
          const width = Math.round((bucket.count / maxCount) * 100);
          const isExpected =
            solutionRevealed &&
            expectedOperatorIndex !== null &&
            expectedOperatorIndex !== undefined &&
            bucket.selectedOperatorIndex === expectedOperatorIndex;

          return (
            <li key={bucket.selectedOperatorIndex} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Wybór #{bucket.selectedOperatorIndex + 1}</span>
                <span className="font-semibold">{bucket.count}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${isExpected ? "bg-emerald-500" : "bg-indigo-500"}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {solutionRevealed && expectedOperatorIndex != null && expectedOperatorIndex >= 0 ? (
        <p className="text-xs text-emerald-700">
          Poprawny pierwszy krok: wybór #{expectedOperatorIndex + 1} (oznaczony na zielono).
        </p>
      ) : (
        <p className="text-xs text-slate-500">Odsłoń rozwiązanie, aby zaznaczyć poprawną strategię.</p>
      )}
    </div>
  );
}
