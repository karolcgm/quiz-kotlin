"use client";

import { useMemo } from "react";

interface MultiplicationGridModelProps {
  seed: number;
  readOnly?: boolean;
}

export function MultiplicationGridModel({ seed, readOnly = false }: MultiplicationGridModelProps) {
  const { rows, cols, product } = useMemo(() => {
    const r = (seed % 4) + 3;
    const c = ((seed + 2) % 5) + 3;
    return { rows: r, cols: c, product: r * c };
  }, [seed]);

  const cell = 28;

  return (
    <div className="space-y-4">
      <p className="text-center text-lg font-bold text-slate-900">
        {rows} × {cols} = {product}
      </p>
      <svg
        viewBox={`0 0 ${cols * cell + 20} ${rows * cell + 20}`}
        className="mx-auto w-full max-w-md rounded-xl bg-amber-50 p-2"
        role="img"
        aria-label={`Siatka ${rows} na ${cols}`}
      >
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((__, col) => (
            <rect
              key={`${row}-${col}`}
              x={10 + col * cell}
              y={10 + row * cell}
              width={cell - 4}
              height={cell - 4}
              rx="4"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1.5"
            />
          )),
        )}
      </svg>
      {!readOnly ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Policz rzędy po {cols} albo kolumny po {rows} — obie strategie prowadzą do {product}.
        </p>
      ) : null}
    </div>
  );
}
