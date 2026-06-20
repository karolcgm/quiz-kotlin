import type { SimulationVisualKind } from "@/types/simulation";

interface SimulationCardVisualProps {
  kind: SimulationVisualKind;
}

const labels: Record<SimulationVisualKind, string> = {
  "number-line": "Oś",
  fraction: "Ułamki",
  geometry: "Figury",
  measurement: "Pomiar",
  chart: "Wykres",
  algebra: "Algebra",
  game: "Gra",
};

export function SimulationCardVisual({ kind }: SimulationCardVisualProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
      <div className="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700 shadow-sm">
        {labels[kind]}
      </div>
      <svg viewBox="0 0 320 150" className="h-32 w-full" aria-hidden="true">
        {kind === "number-line" && <NumberLineVisual />}
        {kind === "fraction" && <FractionVisual />}
        {kind === "geometry" && <GeometryVisual />}
        {kind === "measurement" && <MeasurementVisual />}
        {kind === "chart" && <ChartVisual />}
        {kind === "algebra" && <AlgebraVisual />}
        {kind === "game" && <GameVisual />}
      </svg>
    </div>
  );
}

function NumberLineVisual() {
  return (
    <g>
      <line x1="28" y1="86" x2="292" y2="86" stroke="#334155" strokeWidth="5" />
      {[-4, -2, 0, 2, 4].map((tick, index) => {
        const x = 48 + index * 56;
        return (
          <g key={tick}>
            <line x1={x} y1="72" x2={x} y2="100" stroke="#94a3b8" strokeWidth="3" />
            <text x={x} y="124" textAnchor="middle" className="fill-slate-500 text-sm font-bold">
              {tick}
            </text>
          </g>
        );
      })}
      <path d="M104 48 C140 28 188 28 220 48" fill="none" stroke="#6366f1" strokeWidth="6" />
      <path d="M220 48 L202 40 L207 60 Z" fill="#6366f1" />
      <circle cx="104" cy="86" r="11" fill="#0ea5e9" />
      <circle cx="220" cy="86" r="11" fill="#6366f1" />
    </g>
  );
}

function FractionVisual() {
  return (
    <g transform="translate(78 8)">
      <circle cx="72" cy="72" r="58" fill="#e0e7ff" stroke="#6366f1" strokeWidth="5" />
      <path d="M72 72 L72 14 A58 58 0 0 1 122 101 Z" fill="#6366f1" opacity="0.9" />
      <path d="M72 72 L122 101 A58 58 0 0 1 72 130 Z" fill="#8b5cf6" opacity="0.85" />
      <line x1="72" y1="14" x2="72" y2="130" stroke="#fff" strokeWidth="3" />
      <line x1="22" y1="43" x2="122" y2="101" stroke="#fff" strokeWidth="3" />
      <line x1="122" y1="43" x2="22" y2="101" stroke="#fff" strokeWidth="3" />
      <text x="178" y="82" className="fill-indigo-700 text-4xl font-black">
        2/6
      </text>
    </g>
  );
}

function GeometryVisual() {
  return (
    <g>
      <rect x="60" y="40" width="150" height="82" rx="6" fill="#dbeafe" stroke="#2563eb" strokeWidth="5" />
      <line x1="60" y1="68" x2="210" y2="68" stroke="#93c5fd" strokeWidth="2" />
      <line x1="60" y1="94" x2="210" y2="94" stroke="#93c5fd" strokeWidth="2" />
      <line x1="98" y1="40" x2="98" y2="122" stroke="#93c5fd" strokeWidth="2" />
      <line x1="136" y1="40" x2="136" y2="122" stroke="#93c5fd" strokeWidth="2" />
      <line x1="174" y1="40" x2="174" y2="122" stroke="#93c5fd" strokeWidth="2" />
      <text x="232" y="85" className="fill-slate-700 text-2xl font-black">
        P
      </text>
    </g>
  );
}

function MeasurementVisual() {
  return (
    <g>
      <rect x="38" y="60" width="244" height="42" rx="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="4" />
      {Array.from({ length: 13 }).map((_, index) => {
        const x = 52 + index * 18;
        const tall = index % 2 === 0;
        return (
          <line
            key={index}
            x1={x}
            y1="62"
            x2={x}
            y2={tall ? 96 : 84}
            stroke="#92400e"
            strokeWidth={tall ? 3 : 2}
          />
        );
      })}
      <text x="50" y="128" className="fill-amber-700 text-lg font-bold">
        10 mm = 1 cm
      </text>
    </g>
  );
}

function ChartVisual() {
  return (
    <g>
      <line x1="54" y1="122" x2="274" y2="122" stroke="#334155" strokeWidth="4" />
      <rect x="74" y="76" width="34" height="46" rx="6" fill="#38bdf8" />
      <rect x="128" y="48" width="34" height="74" rx="6" fill="#6366f1" />
      <rect x="182" y="30" width="34" height="92" rx="6" fill="#8b5cf6" />
      <path d="M74 92 L145 62 L199 44 L252 32" fill="none" stroke="#10b981" strokeWidth="5" />
      <circle cx="252" cy="32" r="8" fill="#10b981" />
    </g>
  );
}

function AlgebraVisual() {
  return (
    <g>
      <line x1="160" y1="34" x2="160" y2="122" stroke="#475569" strokeWidth="6" />
      <line x1="86" y1="64" x2="234" y2="64" stroke="#475569" strokeWidth="5" />
      <path d="M74 64 L48 112 H100 Z" fill="#e0e7ff" stroke="#6366f1" strokeWidth="4" />
      <path d="M246 64 L220 112 H272 Z" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="4" />
      <text x="58" y="101" className="fill-indigo-700 text-xl font-black">
        x
      </text>
      <text x="226" y="101" className="fill-violet-700 text-xl font-black">
        8
      </text>
      <text x="132" y="28" className="fill-slate-700 text-xl font-black">
        =
      </text>
    </g>
  );
}

function GameVisual() {
  const blocks = [
    [70, 40, "#38bdf8"],
    [112, 40, "#6366f1"],
    [154, 40, "#8b5cf6"],
    [92, 82, "#f59e0b"],
    [134, 82, "#10b981"],
    [176, 82, "#ef4444"],
  ] as const;

  return (
    <g>
      {blocks.map(([x, y, color], index) => (
        <rect key={index} x={x} y={y} width="34" height="34" rx="8" fill={color} opacity="0.9" />
      ))}
      <path d="M228 50 L270 75 L228 100 Z" fill="#e0e7ff" stroke="#6366f1" strokeWidth="5" />
      <text x="66" y="132" className="fill-slate-700 text-lg font-black">
        policz, przesuń, sprawdź
      </text>
    </g>
  );
}
