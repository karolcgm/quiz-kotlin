"use client";

import { useMemo } from "react";

interface NumberLineVisualProps {
  min?: number;
  max?: number;
  position: number;
  targetPosition?: number | null;
  showTarget?: boolean;
  onPick?: (value: number) => void;
  interactive?: boolean;
  celebrate?: boolean;
}

function valueToX(value: number, min: number, max: number, width: number, padding: number): number {
  const ratio = (value - min) / (max - min);
  return padding + ratio * (width - padding * 2);
}

export function NumberLineVisual({
  min = -20,
  max = 20,
  position,
  targetPosition = null,
  showTarget = false,
  onPick,
  interactive = false,
  celebrate = false,
}: NumberLineVisualProps) {
  const width = 720;
  const height = 200;
  const padding = 48;
  const axisY = 110;

  const ticks = useMemo(() => {
    const step = max - min <= 20 ? 1 : max - min <= 40 ? 2 : 5;
    const items: number[] = [];
    for (let value = min; value <= max; value += step) {
      items.push(value);
    }
    return items;
  }, [min, max]);

  const markerX = valueToX(position, min, max, width, padding);
  const targetX =
    targetPosition !== null ? valueToX(targetPosition, min, max, width, padding) : null;

  function handleAxisClick(clientX: number, rect: DOMRect) {
    if (!interactive || !onPick) return;
    const svgX = ((clientX - rect.left) / rect.width) * width;
    const ratio = (svgX - padding) / (width - padding * 2);
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw);
    onPick(Math.max(min, Math.min(max, snapped)));
  }

  return (
    <div className={`relative ${celebrate ? "premium-celebrate" : ""}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto w-full max-w-4xl touch-none select-none"
        role="img"
        aria-label={`Oś liczbowa, pozycja ${position}`}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          handleAxisClick(event.clientX, rect);
        }}
      >
        <defs>
          <linearGradient id="nl-axis-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="nl-marker-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="nl-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width={width} height={height} rx="24" fill="rgba(238,242,255,0.5)" />

        {[0.25, 0.5, 0.75].map((opacity, index) => (
          <ellipse
            key={opacity}
            cx={markerX}
            cy={axisY + 20}
            rx={28 + index * 8}
            ry={8}
            fill={`rgba(99,102,241,${opacity * 0.15})`}
            className="transition-all duration-500"
          />
        ))}

        <line
          x1={padding - 12}
          y1={axisY}
          x2={width - padding + 12}
          y2={axisY}
          stroke="url(#nl-axis-grad)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <polygon
          points={`${width - padding + 20},${axisY} ${width - padding + 4},${axisY - 8} ${width - padding + 4},${axisY + 8}`}
          fill="#22d3ee"
        />
        <polygon
          points={`${padding - 20},${axisY} ${padding - 4},${axisY - 8} ${padding - 4},${axisY + 8}`}
          fill="#6366f1"
        />

        {ticks.map((tick) => {
          const x = valueToX(tick, min, max, width, padding);
          const major = tick % 5 === 0 || max - min <= 24;
          return (
            <g key={tick}>
              <line
                x1={x}
                y1={axisY - (major ? 16 : 10)}
                x2={x}
                y2={axisY + (major ? 16 : 10)}
                stroke={tick === 0 ? "#f472b6" : "#94a3b8"}
                strokeWidth={major ? 2.5 : 1.5}
              />
              {major && (
                <text
                  x={x}
                  y={axisY + 38}
                  textAnchor="middle"
                  className="fill-slate-600 text-sm font-bold"
                >
                  {tick}
                </text>
              )}
            </g>
          );
        })}

        {showTarget && targetX !== null && (
          <g>
            <line
              x1={targetX}
              y1={axisY - 50}
              x2={targetX}
              y2={axisY - 22}
              stroke="#fbbf24"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
            <circle cx={targetX} cy={axisY - 58} r="16" fill="#fbbf24" filter="url(#nl-glow)" />
            <text x={targetX} y={axisY - 53} textAnchor="middle" className="fill-amber-950 text-xs font-black">
              ?
            </text>
          </g>
        )}

        <g className="transition-all duration-500 ease-out" style={{ transform: `translateX(${markerX}px)` }}>
          <line x1={0} y1={axisY - 52} x2={0} y2={axisY - 18} stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
          <circle cx={0} cy={axisY - 62} r="22" fill="url(#nl-marker-grad)" filter="url(#nl-glow)" />
          <text x={0} y={axisY - 56} textAnchor="middle" className="fill-white text-sm font-black">
            {position}
          </text>
        </g>

        {interactive && (
          <rect
            x={padding - 20}
            y={axisY - 70}
            width={width - padding * 2 + 40}
            height={100}
            fill="transparent"
            className="cursor-pointer"
          />
        )}
      </svg>

      {interactive && (
        <p className="mt-2 text-center text-sm font-medium text-slate-500">
          Kliknij na osi, aby wskazać wynik
        </p>
      )}
    </div>
  );
}
