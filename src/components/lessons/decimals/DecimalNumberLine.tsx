import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { formatDecimal, parseDecimalInput } from "@/lib/math/decimals";

export interface DecimalNumberLinePoint {
  id: string;
  value: string;
  label?: string;
  symbol?: string;
}

export interface DecimalNumberLineProps {
  minimum: string;
  maximum: string;
  points: DecimalNumberLinePoint[];
  subdivisions?: 10 | 100;
  title?: string;
}

function asNumber(input: string): number {
  const parsed = parseDecimalInput(input);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return Number(formatDecimal(parsed.value).replace(",", "."));
}

export function DecimalNumberLine({ minimum, maximum, points, subdivisions = 10, title = "Oś liczb dziesiętnych" }: DecimalNumberLineProps) {
  const min = asNumber(minimum);
  const max = asNumber(maximum);
  if (!(max > min)) throw new Error("Koniec osi musi być większy od początku.");
  const located = points.map((point) => {
    const parsed = parseDecimalInput(point.value);
    if (!parsed.ok) throw new Error(parsed.error.message);
    const value = asNumber(point.value);
    if (value < min || value > max) throw new Error("Punkt nie mieści się na osi.");
    return { ...point, display: parsed.trace.display, x: 50 + ((value - min) / (max - min)) * 500 };
  });
  const tickCount = Math.min(subdivisions, 100);
  return (
    <div className="overflow-x-auto" data-decimal-number-line>
      <AccessibleMathSvg
      title={title}
      description={`Oś od ${minimum.replace(".", ",")} do ${maximum.replace(".", ",")}. Punkty o równych wartościach, także z zerami końcowymi, leżą w tym samym miejscu.`}
      viewBox="0 0 600 180"
      columns={[{ key: "label", label: "Punkt" }, { key: "value", label: "Zapis" }, { key: "position", label: "Położenie" }]}
      rows={located.map((point) => ({ label: point.label ?? point.id, value: point.display, position: `${Math.round(((point.x - 50) / 500) * 1000) / 10}% osi` }))}
      className="w-full min-w-[560px]"
    >
      <line x1="50" y1="100" x2="550" y2="100" stroke="#0f172a" strokeWidth="4" />
      {Array.from({ length: tickCount + 1 }, (_, index) => {
        const x = 50 + (index / tickCount) * 500;
        const major = index === 0 || index === tickCount || subdivisions === 10;
        return <line key={index} x1={x} x2={x} y1={major ? 88 : 94} y2={major ? 112 : 106} stroke="#334155" strokeWidth={major ? 3 : 1.5} />;
      })}
      <text x="50" y="140" textAnchor="middle" fontWeight="800">{minimum.replace(".", ",")}</text>
      <text x="550" y="140" textAnchor="middle" fontWeight="800">{maximum.replace(".", ",")}</text>
      {located.map((point, index) => (
        <g key={point.id} data-decimal-point={point.id} data-point-x={point.x}>
          <circle cx={point.x} cy="100" r="10" fill={index % 2 ? "#f59e0b" : "#4f46e5"} stroke="#fff" strokeWidth="3" />
          <text x={point.x} y={60 - (index % 2) * 22} textAnchor="middle" fontWeight="900">{point.symbol ? `${point.symbol} ` : ""}{point.label ?? point.display}</text>
        </g>
      ))}
      </AccessibleMathSvg>
    </div>
  );
}
