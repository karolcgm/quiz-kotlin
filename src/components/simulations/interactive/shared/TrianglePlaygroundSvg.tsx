"use client";

import type { PointerEvent } from "react";
import {
  triangleAngles,
  triangleSideLengths,
  type TriangleVertices,
} from "@/lib/math/triangleClassification";

const WIDTH = 420;
const HEIGHT = 300;

export const TRIANGLE_SVG = { width: WIDTH, height: HEIGHT };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function centroid(v: TriangleVertices) {
  return {
    x: (v.ax + v.bx + v.cx) / 3,
    y: (v.ay + v.by + v.cy) / 3,
  };
}

function offsetOutward(x: number, y: number, cx: number, cy: number, amount: number) {
  const dx = x - cx;
  const dy = y - cy;
  const len = Math.hypot(dx, dy) || 1;
  return { x: x + (dx / len) * amount, y: y + (dy / len) * amount };
}

function sideGroups(lengths: [number, number, number]) {
  const keys = ["ab", "bc", "ca"] as const;
  const sorted = [...lengths].sort((a, b) => a - b);
  const palette = ["#6366f1", "#ec4899", "#14b8a6"];
  const colors: Record<(typeof keys)[number], string> = { ab: palette[0], bc: palette[1], ca: palette[2] };

  if (Math.abs(lengths[0] - lengths[1]) < 3 && Math.abs(lengths[1] - lengths[2]) < 3) {
    return { ab: palette[0], bc: palette[0], ca: palette[0] };
  }
  if (Math.abs(lengths[0] - lengths[1]) < 3) {
    colors.ab = palette[0];
    colors.bc = palette[0];
    colors.ca = palette[2];
  } else if (Math.abs(lengths[1] - lengths[2]) < 3) {
    colors.ab = palette[2];
    colors.bc = palette[0];
    colors.ca = palette[0];
  } else if (Math.abs(lengths[0] - lengths[2]) < 3) {
    colors.ab = palette[0];
    colors.bc = palette[2];
    colors.ca = palette[0];
  }
  return colors;
}

function angleArc(vertex: { x: number; y: number }, prev: { x: number; y: number }, next: { x: number; y: number }, radius: number) {
  const a1 = Math.atan2(prev.y - vertex.y, prev.x - vertex.x);
  const a2 = Math.atan2(next.y - vertex.y, next.x - vertex.x);
  const sx = vertex.x + radius * Math.cos(a1);
  const sy = vertex.y + radius * Math.sin(a1);
  const ex = vertex.x + radius * Math.cos(a2);
  const ey = vertex.y + radius * Math.sin(a2);
  return `M ${sx} ${sy} A ${radius} ${radius} 0 0 1 ${ex} ${ey}`;
}

export interface TrianglePlaygroundSvgProps {
  vertices: TriangleVertices;
  draggable?: boolean | ("A" | "B" | "C")[];
  onVertexMove?: (vertex: "A" | "B" | "C", x: number, y: number) => void;
  hideAngleAt?: "A" | "B" | "C" | null;
  showAngleValues?: boolean;
  highlightAngleSum?: boolean;
}

export function TrianglePlaygroundSvg({
  vertices,
  draggable = true,
  onVertexMove,
  hideAngleAt = null,
  showAngleValues = true,
  highlightAngleSum = false,
}: TrianglePlaygroundSvgProps) {
  const center = centroid(vertices);
  const [ab, bc, ca] = triangleSideLengths(vertices);
  const [angleA, angleB, angleC] = triangleAngles(vertices);
  const sideColors = sideGroups([ab, bc, ca]);

  const A = { x: vertices.ax, y: vertices.ay, label: "A" as const, angle: angleA };
  const B = { x: vertices.bx, y: vertices.by, label: "B" as const, angle: angleB };
  const C = { x: vertices.cx, y: vertices.cy, label: "C" as const, angle: angleC };

  const points = [A, B, C];
  const sides = [
    { from: A, to: B, len: ab, key: "ab" as const, color: sideColors.ab },
    { from: B, to: C, len: bc, key: "bc" as const, color: sideColors.bc },
    { from: C, to: A, len: ca, key: "ca" as const, color: sideColors.ca },
  ];

  const canDrag = (label: "A" | "B" | "C") => {
    if (!onVertexMove) return false;
    if (draggable === true) return true;
    if (draggable === false) return false;
    return draggable.includes(label);
  };

  const handleDrag = (label: "A" | "B" | "C") => (event: PointerEvent<SVGCircleElement>) => {
    if (!canDrag(label) || !onVertexMove) return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
    const y = ((event.clientY - bounds.top) / bounds.height) * HEIGHT;
    onVertexMove(label, clamp(x, 24, WIDTH - 24), clamp(y, 24, HEIGHT - 40));
  };

  const vertexColors = { A: "#ef4444", B: "#3b82f6", C: "#22c55e" };

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full touch-manipulation rounded-2xl bg-gradient-to-b from-sky-50 to-indigo-50"
      role="img"
      aria-label="Interaktywny trójkąt"
    >
      <defs>
        <linearGradient id="triFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>

      {sides.map((side) => (
        <line
          key={side.key}
          x1={side.from.x}
          y1={side.from.y}
          x2={side.to.x}
          y2={side.to.y}
          stroke={side.color}
          strokeWidth={7}
          strokeLinecap="round"
        />
      ))}

      <polygon
        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
        fill="url(#triFill)"
        fillOpacity={0.55}
        stroke="none"
      />

      {points.map((point, index) => {
        const prev = points[(index + 2) % 3];
        const next = points[(index + 1) % 3];
        const hidden = hideAngleAt === point.label;
        const fillColor =
          point.angle < 90 ? "#bbf7d0" : Math.abs(point.angle - 90) <= 2 ? "#bfdbfe" : "#fed7aa";

        return (
          <g key={point.label}>
            <path d={angleArc(point, prev, next, 32)} fill={fillColor} fillOpacity={0.85} stroke="#334155" strokeWidth={1.5} />
            <text
              x={offsetOutward(point.x, point.y, center.x, center.y, 48).x}
              y={offsetOutward(point.x, point.y, center.x, center.y, 48).y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#0f172a"
              fontSize="13"
              fontWeight="800"
            >
              {hidden ? "?" : showAngleValues ? `${point.angle}°` : "?"}
            </text>
          </g>
        );
      })}

      {sides.map((side) => {
        const mid = offsetOutward(
          (side.from.x + side.to.x) / 2,
          (side.from.y + side.to.y) / 2,
          center.x,
          center.y,
          -22,
        );
        return (
          <g key={`label-${side.key}`}>
            <rect x={mid.x - 20} y={mid.y - 10} width={40} height={20} rx={8} fill="white" fillOpacity={0.95} />
            <text x={mid.x} y={mid.y + 1} textAnchor="middle" dominantBaseline="middle" fill={side.color} fontSize="11" fontWeight="800">
              {Math.round(side.len)}
            </text>
          </g>
        );
      })}

      {points.map((point) => (
        <g key={`handle-${point.label}`}>
          <circle
            cx={point.x}
            cy={point.y}
            r={canDrag(point.label) ? 14 : 9}
            fill={vertexColors[point.label]}
            stroke="#fff"
            strokeWidth={3}
            className={canDrag(point.label) ? "cursor-grab active:cursor-grabbing" : undefined}
            onPointerDown={handleDrag(point.label)}
            onPointerMove={(event) => {
              if (!canDrag(point.label) || event.buttons !== 1) return;
              handleDrag(point.label)(event);
            }}
          />
          <text
            x={point.x}
            y={point.y + (point.label === "C" ? -22 : 24)}
            textAnchor="middle"
            fill="#0f172a"
            fontSize="13"
            fontWeight="900"
          >
            {point.label}
          </text>
        </g>
      ))}

      {highlightAngleSum && (
        <g>
          <rect x={118} y={12} width={184} height={34} rx={12} fill="#fef9c3" stroke="#eab308" strokeWidth={2} />
          <text x={210} y={34} textAnchor="middle" fill="#854d0e" fontSize="14" fontWeight="900">
            {angleA}° + {angleB}° + {angleC}° = {angleA + angleB + angleC}°
          </text>
        </g>
      )}
    </svg>
  );
}

export function moveTriangleVertex(vertices: TriangleVertices, vertex: "A" | "B" | "C", x: number, y: number): TriangleVertices {
  if (vertex === "A") return { ...vertices, ax: x, ay: y };
  if (vertex === "B") return { ...vertices, bx: x, by: y };
  return { ...vertices, cx: x, cy: y };
}
