import { useId } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { buildFractionBarSegments } from "@/lib/math/fractions/fractionModels";
import type { FractionValue } from "@/types/fractions";

export interface FractionBarItem {
  id: string;
  label: string;
  value: FractionValue;
  accent?: "indigo" | "cyan" | "amber" | "violet";
}
export interface FractionBarModelProps {
  bars: FractionBarItem[];
  overlay?: boolean;
  showCommonAxis?: boolean;
  title?: string;
  description?: string;
}

const ACCENTS = {
  indigo: { fill: "#6366f1", stroke: "#312e81" },
  cyan: { fill: "#06b6d4", stroke: "#155e75" },
  amber: { fill: "#f59e0b", stroke: "#92400e" },
  violet: { fill: "#8b5cf6", stroke: "#5b21b6" },
} as const;

/** Wspólna oś gwarantuje tę samą długość każdej całości we wszystkich paskach. */
export function FractionBarModel({
  bars,
  overlay = false,
  showCommonAxis = true,
  title = "Model pasków ułamkowych",
  description,
}: FractionBarModelProps) {
  if (bars.length === 0) throw new Error("Model pasków wymaga co najmniej jednego paska.");
  const patternId = useId().replace(/:/gu, "");
  const wholeSize = 280;
  const wholeCount = Math.max(1, ...bars.map((bar) => Math.ceil(bar.value.numerator / bar.value.denominator)));
  const left = 86;
  const top = 34;
  const rowHeight = 72;
  const barHeight = 38;
  const drawingWidth = wholeSize * wholeCount;
  const drawingHeight = overlay ? 142 : top + bars.length * rowHeight + 54;
  const computedDescription = description
    ?? bars.map((bar) => `${bar.label}: ${bar.value.numerator}/${bar.value.denominator}`).join(". ");

  return (
    <AccessibleMathSvg
      title={title}
      description={`${computedDescription}. Każda całość ma tę samą długość ${wholeSize} jednostek modelu.`}
      viewBox={`0 0 ${left + drawingWidth + 34} ${drawingHeight}`}
      className="h-auto w-full overflow-visible"
      columns={[
        { key: "label", label: "Pasek" },
        { key: "selected", label: "Zaznaczone części" },
        { key: "all", label: "Liczba równych części" },
        { key: "value", label: "Wartość" },
      ]}
      rows={bars.map((bar) => ({
        label: bar.label,
        selected: bar.value.numerator,
        all: bar.value.denominator,
        value: `${bar.value.numerator}/${bar.value.denominator}`,
      }))}
    >
      <defs>
        {bars.map((bar, index) => {
          const accent = ACCENTS[bar.accent ?? ["indigo", "cyan", "amber", "violet"][index % 4] as keyof typeof ACCENTS];
          return (
            <pattern key={bar.id} id={`${patternId}-${bar.id}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <rect width="10" height="10" fill={accent.fill} />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#fff" strokeWidth="3" opacity=".45" />
            </pattern>
          );
        })}
      </defs>
      {bars.map((bar, barIndex) => {
        const y = overlay ? top + barIndex * 5 : top + barIndex * rowHeight;
        const accentName = bar.accent ?? (["indigo", "cyan", "amber", "violet"] as const)[barIndex % 4];
        const accent = ACCENTS[accentName];
        const segments = buildFractionBarSegments(bar.value, wholeSize, wholeCount);
        return (
          <g key={bar.id} data-fraction-bar={bar.id} opacity={overlay ? Math.max(.38, 1 - barIndex * .18) : 1}>
            <text x="4" y={y + 24} fill="#0f172a" fontSize="14" fontWeight="800">{bar.label}</text>
            {segments.map((segment) => (
              <rect
                key={segment.index}
                x={left + segment.start}
                y={y}
                width={segment.size}
                height={barHeight}
                fill={segment.selected ? `url(#${patternId}-${bar.id})` : "#fff"}
                stroke={accent.stroke}
                strokeWidth="2"
                data-segment-size={segment.size}
                data-selected={segment.selected || undefined}
              />
            ))}
            <text x={left + drawingWidth + 9} y={y + 25} fill="#0f172a" fontSize="14" fontWeight="900">
              {bar.value.numerator}/{bar.value.denominator}
            </text>
          </g>
        );
      })}
      {showCommonAxis ? (
        <g aria-label="Wspólna oś całości">
          <line x1={left} y1={drawingHeight - 32} x2={left + drawingWidth} y2={drawingHeight - 32} stroke="#0f172a" strokeWidth="2" />
          {Array.from({ length: wholeCount + 1 }, (_, index) => (
            <g key={index}>
              <line x1={left + index * wholeSize} y1={drawingHeight - 39} x2={left + index * wholeSize} y2={drawingHeight - 25} stroke="#0f172a" strokeWidth="2" />
              <text x={left + index * wholeSize} y={drawingHeight - 7} textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="800">{index}</text>
            </g>
          ))}
        </g>
      ) : null}
    </AccessibleMathSvg>
  );
}
