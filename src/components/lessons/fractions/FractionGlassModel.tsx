"use client";

import { useEffect, useId, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { fractionAsNumber } from "@/lib/math/fractions/fractionModels";
import type { FractionValue } from "@/types/fractions";
import styles from "@/components/lessons/fractions/fractions.module.css";

export interface FractionGlassItem {
  id: string;
  label: string;
  value: FractionValue;
  unit?: string;
  accent?: "cyan" | "indigo" | "violet";
}

export interface FractionGlassPour {
  fromIds: string[];
  toId: string;
  label?: string;
}

export interface FractionGlassModelProps {
  glasses: FractionGlassItem[];
  pour?: FractionGlassPour;
  title?: string;
  description?: string;
  showMotionControl?: boolean;
}

const WATER_COLORS = {
  cyan: "#22d3ee",
  indigo: "#818cf8",
  violet: "#a78bfa",
} as const;

/** Szklanki mają tę samą pojemność; zmiana propsa value płynnie zmienia poziom wody. */
export function FractionGlassModel({
  glasses,
  pour,
  title = "Model szklanek z wodą",
  description,
  showMotionControl = true,
}: FractionGlassModelProps) {
  if (glasses.length === 0) throw new Error("Model szklanek wymaga co najmniej jednego naczynia.");
  const id = useId().replace(/:/gu, "");
  const [motionPaused, setMotionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const update = () => setPrefersReducedMotion(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  const glassWidth = 104;
  const glassHeight = 152;
  const gap = 76;
  const left = 54;
  const top = 30;
  const viewWidth = left * 2 + glasses.length * glassWidth + (glasses.length - 1) * gap;
  const viewHeight = 254;
  const isMotionPaused = motionPaused || prefersReducedMotion;
  const modelDescription = description ?? glasses
    .map((glass) => `${glass.label}: ${glass.value.numerator}/${glass.value.denominator} ${glass.unit ?? "pojemności"}`)
    .join(". ");

  return (
    <section className="space-y-3" data-motion-paused={isMotionPaused}>
      <AccessibleMathSvg
        title={title}
        description={`${modelDescription}.${pour ? ` Przelewanie: ${pour.label ?? `${pour.fromIds.join(" i ")} do ${pour.toId}`}.` : ""}`}
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="h-auto w-full"
        columns={[
          { key: "glass", label: "Szklanka" },
          { key: "volume", label: "Objętość" },
          { key: "scale", label: "Podziałka" },
          { key: "unit", label: "Jednostka" },
        ]}
        rows={glasses.map((glass) => ({
          glass: glass.label,
          volume: `${glass.value.numerator}/${glass.value.denominator}`,
          scale: `${glass.value.denominator} równych części`,
          unit: glass.unit ?? "część pojemności",
        }))}
      >
        <defs>
          <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#4338ca" />
          </marker>
          {glasses.map((glass, index) => {
            const x = left + index * (glassWidth + gap);
            return (
              <clipPath key={glass.id} id={`${id}-clip-${glass.id}`}>
                <path d={`M ${x + 7} ${top + 5} L ${x + glassWidth - 7} ${top + 5} L ${x + glassWidth - 16} ${top + glassHeight - 5} L ${x + 16} ${top + glassHeight - 5} Z`} />
              </clipPath>
            );
          })}
        </defs>

        {glasses.map((glass, index) => {
          const ratio = fractionAsNumber(glass.value);
          if (ratio > 1) throw new Error("Szklanka nie może zawierać więcej niż jedną pojemność.");
          const x = left + index * (glassWidth + gap);
          const innerTop = top + 8;
          const innerHeight = glassHeight - 16;
          const levelY = innerTop + innerHeight * (1 - ratio);
          const color = WATER_COLORS[glass.accent ?? (["cyan", "indigo", "violet"] as const)[index % 3]];
          return (
            <g key={glass.id} data-fraction-glass={glass.id}>
              <g clipPath={`url(#${id}-clip-${glass.id})`}>
                <g
                  className={styles.waterLevel}
                  transform={`translate(0 ${levelY})`}
                  data-water-ratio={ratio}
                >
                  <path
                    className={styles.wave}
                    d={`M ${x - 24} 2 Q ${x - 18} -0.5 ${x - 12} 2 T ${x} 2 T ${x + 12} 2 T ${x + 24} 2 T ${x + 36} 2 T ${x + 48} 2 T ${x + 60} 2 T ${x + 72} 2 T ${x + 84} 2 T ${x + 96} 2 T ${x + 108} 2 T ${x + 120} 2 L ${x + 128} ${innerHeight + 20} L ${x - 24} ${innerHeight + 20} Z`}
                    fill={color}
                    opacity=".78"
                    data-wave-amplitude="2.5"
                    data-wave-period="3.6"
                  />
                </g>
              </g>
              <path
                d={`M ${x + 4} ${top} L ${x + glassWidth - 4} ${top} L ${x + glassWidth - 14} ${top + glassHeight} L ${x + 14} ${top + glassHeight} Z`}
                fill="none"
                stroke="#0f172a"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {Array.from({ length: glass.value.denominator + 1 }, (_, tick) => {
                const y = top + glassHeight - tick * glassHeight / glass.value.denominator;
                return (
                  <line
                    key={tick}
                    x1={x + glassWidth - 24}
                    x2={x + glassWidth - 6}
                    y1={y}
                    y2={y}
                    stroke="#0f172a"
                    strokeWidth={tick === 0 || tick === glass.value.denominator ? 3 : 1.5}
                    data-scale-tick={tick}
                  />
                );
              })}
              <text x={x + glassWidth / 2} y={top + glassHeight + 25} textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900">
                {glass.label}
              </text>
              <text x={x + glassWidth / 2} y={top + glassHeight + 45} textAnchor="middle" fill="#334155" fontSize="13" fontWeight="800">
                {glass.value.numerator}/{glass.value.denominator} {glass.unit ?? ""}
              </text>
            </g>
          );
        })}

        {pour ? pour.fromIds.flatMap((fromId) => {
          const fromIndex = glasses.findIndex((glass) => glass.id === fromId);
          const targetIndex = glasses.findIndex((glass) => glass.id === pour.toId);
          if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) return [];
          const fromX = left + fromIndex * (glassWidth + gap) + glassWidth / 2;
          const targetX = left + targetIndex * (glassWidth + gap) + glassWidth / 2;
          return [(
            <path
              key={`${fromId}-${pour.toId}`}
              d={`M ${fromX} 18 Q ${(fromX + targetX) / 2} -2 ${targetX} 18`}
              fill="none"
              stroke="#4338ca"
              strokeWidth="3"
              strokeDasharray="8 5"
              markerEnd={`url(#${id}-arrow)`}
              data-pour-connector={`${fromId}:${pour.toId}`}
            />
          )];
        }) : null}
      </AccessibleMathSvg>

      {showMotionControl ? (
        <InteractionAlternativePanel
          title="Sterowanie ruchem wody"
          instruction={prefersReducedMotion
            ? "Ustawienie ograniczenia ruchu urządzenia zatrzymało falę. Poziomy i podziałki pozostają widoczne."
            : "Fala jest wyłącznie subtelną wskazówką tafli. Możesz ją zatrzymać bez zmiany wartości."}
        >
          <button
            type="button"
            className={`${styles.motionControl} min-h-12 rounded-xl border-2 border-cyan-700 bg-white px-4 font-black text-cyan-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-600 disabled:opacity-70`}
            aria-pressed={isMotionPaused}
            disabled={prefersReducedMotion}
            onClick={() => setMotionPaused((current) => !current)}
          >
            {prefersReducedMotion ? "Ruch zatrzymany" : motionPaused ? "Wznów ruch" : "Zatrzymaj ruch"}
          </button>
        </InteractionAlternativePanel>
      ) : null}
    </section>
  );
}
