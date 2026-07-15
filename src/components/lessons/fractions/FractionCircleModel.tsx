import { useId } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { buildFractionCircleSectors } from "@/lib/math/fractions/fractionModels";
import type { FractionValue } from "@/types/fractions";

export interface FractionCircleModelProps {
  value: FractionValue;
  label?: string;
  variant?: "circle" | "pizza";
  title?: string;
  selectedLabel?: string;
}
function polar(centerX: number, centerY: number, radius: number, angle: number) {
  const radians = angle * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians),
  };
}

export function fractionSectorPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  if (Math.abs(endAngle - startAngle) >= 359.999) {
    return [
      `M ${centerX} ${centerY - radius}`,
      `A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius}`,
      `A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius}`,
      "Z",
    ].join(" ");
  }
  const start = polar(centerX, centerY, radius, startAngle);
  const end = polar(centerX, centerY, radius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

/** Koło/pizza z sektorami wyliczanymi z jednego środka i równych kątów. */
export function FractionCircleModel({
  value,
  label = "Całość",
  variant = "circle",
  title = variant === "pizza" ? "Model pizzy" : "Model koła ułamkowego",
  selectedLabel = "zaznaczone",
}: FractionCircleModelProps) {
  const patternId = useId().replace(/:/gu, "");
  const sectors = buildFractionCircleSectors(value);
  const circleCount = Math.max(1, ...sectors.map((sector) => sector.circleIndex + 1));
  const radius = 76;
  const gap = 28;
  const width = circleCount * radius * 2 + (circleCount - 1) * gap + 40;
  const centers = Array.from({ length: circleCount }, (_, index) => 20 + radius + index * (radius * 2 + gap));

  return (
    <AccessibleMathSvg
      title={title}
      description={`${label}: ${value.numerator} z ${value.denominator} równych sektorów na każdą całość jest ${selectedLabel}. Wszystkie sektory mają kąt ${360 / value.denominator} stopni i wspólny środek.`}
      viewBox={`0 0 ${width} 205`}
      className="h-auto w-full"
      columns={[
        { key: "model", label: "Model" },
        { key: "selected", label: "Zaznaczone sektory" },
        { key: "parts", label: "Sektory w całości" },
        { key: "angle", label: "Kąt sektora" },
        { key: "value", label: "Wartość" },
      ]}
      rows={[{
        model: label,
        selected: value.numerator,
        parts: value.denominator,
        angle: `${360 / value.denominator}°`,
        value: `${value.numerator}/${value.denominator}`,
      }]}
    >
      <defs>
        <pattern id={`${patternId}-selected`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="12" fill={variant === "pizza" ? "#fbbf24" : "#818cf8"} />
          <line x1="0" y1="0" x2="0" y2="12" stroke={variant === "pizza" ? "#dc2626" : "#fff"} strokeWidth="3" opacity=".55" />
        </pattern>
      </defs>
      {centers.map((centerX, circleIndex) => (
        <g key={circleIndex} data-fraction-circle={circleIndex}>
          {variant === "pizza" ? <circle cx={centerX} cy="92" r={radius + 5} fill="#b45309" /> : null}
          {sectors.filter((sector) => sector.circleIndex === circleIndex).map((sector) => (
            <path
              key={sector.index}
              d={fractionSectorPath(centerX, 92, radius, sector.startAngle, sector.endAngle)}
              fill={sector.selected ? `url(#${patternId}-selected)` : variant === "pizza" ? "#fef3c7" : "#fff"}
              stroke="#1e293b"
              strokeWidth="2"
              strokeLinejoin="round"
              data-sector-angle={sector.endAngle - sector.startAngle}
              data-selected={sector.selected || undefined}
            />
          ))}
          <circle cx={centerX} cy="92" r="4" fill="#0f172a" data-common-center />
          <text x={centerX} y="193" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900">
            {circleIndex === 0 ? `${value.numerator}/${value.denominator}` : `całość ${circleIndex + 1}`}
          </text>
        </g>
      ))}
    </AccessibleMathSvg>
  );
}
