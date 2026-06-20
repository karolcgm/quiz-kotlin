import type { RatioQuestionParams } from "@/types/testWidget";

interface RatioBarVisualProps {
  params: RatioQuestionParams;
  revealAnswer?: boolean;
  expected?: number | null;
  simplified?: { partA: number; partB: number } | null;
}

export function RatioBarVisual({ params, revealAnswer, expected, simplified }: RatioBarVisualProps) {
  const partA = Math.max(1, params.partA);
  const partB = Math.max(1, params.partB);
  const total = partA + partB;
  const barWidth = 420;
  const widthA = (partA / total) * barWidth;
  const widthB = barWidth - widthA;
  const highlightLeft = params.ask === "left" || params.ask === "total";
  const highlightRight = params.ask === "right" || params.ask === "total";

  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-center text-3xl font-black text-indigo-700">
        Stosunek {partA}:{partB}
      </p>
      {simplified && (simplified.partA !== partA || simplified.partB !== partB) && (
        <p className="mt-2 text-center text-xl font-bold text-emerald-700">
          Uproszczony: {simplified.partA}:{simplified.partB}
        </p>
      )}

      <svg
        viewBox="0 0 480 180"
        className="mx-auto mt-4 w-full max-w-xl"
        role="img"
        aria-label={`Pasek stosunku ${partA} do ${partB}`}
      >
        <rect x="30" y="48" width={barWidth} height="56" rx="16" fill="#e2e8f0" />
        <rect
          x="30"
          y="48"
          width={widthA}
          height="56"
          rx="16"
          fill={highlightLeft ? "#4f46e5" : "#818cf8"}
        />
        <rect
          x={30 + widthA}
          y="48"
          width={widthB}
          height="56"
          rx="16"
          fill={highlightRight ? "#059669" : "#34d399"}
        />

        {widthA >= 48 && (
          <text x={30 + widthA / 2} y="82" textAnchor="middle" className="fill-white text-xl font-black">
            {partA}
          </text>
        )}
        {widthB >= 48 && (
          <text x={30 + widthA + widthB / 2} y="82" textAnchor="middle" className="fill-white text-xl font-black">
            {partB}
          </text>
        )}

        <text x={30 + widthA / 2} y="130" textAnchor="middle" className="fill-indigo-700 text-sm font-bold">
          część A
        </text>
        <text x={30 + widthA + widthB / 2} y="130" textAnchor="middle" className="fill-emerald-700 text-sm font-bold">
          część B
        </text>

        <text x="30" y="158" className="fill-slate-600 text-sm font-semibold">
          Całość = {partA} + {partB} = {total} części
        </text>
      </svg>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-indigo-100 px-3 py-2 text-center text-sm font-bold text-indigo-900">
          Lewa część: {partA}
        </div>
        <div className="rounded-xl bg-emerald-100 px-3 py-2 text-center text-sm font-bold text-emerald-900">
          Prawa część: {partB}
        </div>
        <div className="rounded-xl bg-amber-100 px-3 py-2 text-center text-sm font-bold text-amber-900">
          Całość: {total}
        </div>
      </div>

      {params.ask === "simplify" && (
        <p className="mt-3 text-center text-sm font-semibold text-slate-700">
          Podziel obie liczby przez ten sam NWD — wpisz uproszczony stosunek.
        </p>
      )}
      {params.ask === "total" && (
        <p className="mt-3 text-center text-sm font-semibold text-slate-700">
          Policz wszystkie części razem — ile jest na całym pasku?
        </p>
      )}
      {params.ask === "left" && (
        <p className="mt-3 text-center text-sm font-semibold text-slate-700">
          Spójrz na niebieską część — ile segmentów pokazuje?
        </p>
      )}
      {params.ask === "right" && (
        <p className="mt-3 text-center text-sm font-semibold text-slate-700">
          Spójrz na zieloną część — ile segmentów pokazuje?
        </p>
      )}

      {revealAnswer && expected !== null && expected !== undefined && (
        <p className="mt-3 text-center text-lg font-bold text-emerald-700">Odpowiedź: {expected}</p>
      )}
    </div>
  );
}
