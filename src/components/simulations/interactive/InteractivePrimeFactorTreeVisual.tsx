"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  buildCanonicalTree,
  collectPrimeLeaves,
  factorsToLabel,
  findFirstSplittablePath,
  isPrime,
  layoutTreeWithPath,
  pathKey,
  primeFactorize,
  properDivisors,
  splitNodeAt,
  type FactorTreePath,
} from "@/lib/math/primeFactors";
import { isPrimeFactorTreeParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

function pathsEqual(a: FactorTreePath, b: FactorTreePath) {
  return a.length === b.length && a.every((step, index) => step === b[index]);
}

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractivePrimeFactorTreeVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractivePrimeFactorTreeVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  onChange,
}: InteractivePrimeFactorTreeVisualProps) {
  if (!isPrimeFactorTreeParams(params)) {
    return null;
  }

  const number = params.number;
  const tree = params.tree.value === number ? params.tree : { value: number };
  const targetNumber =
    targetParams && isPrimeFactorTreeParams(targetParams) ? targetParams.number : number;

  const [selectedPath, setSelectedPath] = useState<FactorTreePath>([]);

  const activePath = useMemo(() => {
    if (selectedPath.length > 0) {
      let current = tree;
      for (const step of selectedPath) {
        if (!current) break;
        current = step === "left" ? current.left! : current.right!;
      }
      if (current && !current.left && !current.right && !isPrime(current.value)) {
        return selectedPath;
      }
    }
    return findFirstSplittablePath(tree) ?? [];
  }, [tree, selectedPath]);

  const selectedNode = useMemo(() => {
    let current = tree;
    for (const step of activePath) {
      current = step === "left" ? current.left! : current.right!;
    }
    return current;
  }, [tree, activePath]);

  const divisors = useMemo(() => {
    if (selectedNode.left || selectedNode.right || isPrime(selectedNode.value)) {
      return [];
    }
    return properDivisors(selectedNode.value);
  }, [selectedNode]);

  const { layouts, width } = useMemo(() => layoutTreeWithPath(tree), [tree]);
  const svgWidth = Math.max(width, 320);
  const svgHeight = Math.max(...layouts.map((item) => item.y), 0) + 80;

  const leaves = collectPrimeLeaves(tree);
  const product = leaves ? leaves.reduce((acc, value) => acc * value, 1) : null;
  const canonicalFactors = primeFactorize(number);
  const solutionTree = buildCanonicalTree(number);

  const applySplit = (divisor: number) => {
    const nextTree = splitNodeAt(tree, activePath, divisor);
    onChange({ ...params, number, tree: nextTree });
    const nextPath = findFirstSplittablePath(nextTree);
    setSelectedPath(nextPath ?? []);
  };

  const resetTree = () => {
    onChange({ ...params, number, tree: { value: number } });
    setSelectedPath([]);
  };

  const solutionLayouts = showSolution && mode === "task" ? layoutTreeWithPath(solutionTree).layouts : [];

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Rozkład na czynniki pierwsze</h3>
          <p className="text-sm font-semibold text-slate-600">
            Wybierz liczbę złożoną, kliknij ją na drzewku i podziel na dwa mnożniki. Powtarzaj, aż zostaną same liczby
            pierwsze.
          </p>
        </>
      )}

      {mode === "task" && targetParams && isPrimeFactorTreeParams(targetParams) && (
        <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Twoje zadanie</p>
          <p className="mt-1 text-2xl font-black text-indigo-900">
            Rozłóż {targetNumber} na czynniki pierwsze
          </p>
          <p className="mt-1 text-sm font-semibold text-indigo-700">
            Zbuduj drzewko — wybierz dzielnik i dziel, aż wszystkie „liście” będą liczbami pierwszymi.
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 touch-manipulation">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto w-full min-w-[320px] max-w-full select-none"
          role="img"
          aria-label={`Drzewko rozkładu liczby ${number}`}
        >
          {layouts.map((item) => {
            if (!item.node.left || !item.node.right) return null;
            const left = layouts.find((other) => pathsEqual(other.path, [...item.path, "left"]));
            const right = layouts.find((other) => pathsEqual(other.path, [...item.path, "right"]));
            if (!left || !right) return null;
            return (
              <g key={`edge-${pathKey(item.path)}`}>
                <line x1={item.x} y1={item.y + 22} x2={left.x} y2={left.y - 22} stroke="#cbd5e1" strokeWidth={3} />
                <line x1={item.x} y1={item.y + 22} x2={right.x} y2={right.y - 22} stroke="#cbd5e1" strokeWidth={3} />
              </g>
            );
          })}

          {showSolution &&
            mode === "task" &&
            solutionLayouts.map((item) => {
              if (!item.node.left || !item.node.right) return null;
              const left = solutionLayouts.find((other) => pathsEqual(other.path, [...item.path, "left"]));
              const right = solutionLayouts.find((other) => pathsEqual(other.path, [...item.path, "right"]));
              if (!left || !right) return null;
              return (
                <g key={`solution-edge-${pathKey(item.path)}`} opacity={0.35}>
                  <line x1={item.x} y1={item.y + 22} x2={left.x} y2={left.y - 22} stroke="#10b981" strokeWidth={2} strokeDasharray="6 4" />
                  <line x1={item.x} y1={item.y + 22} x2={right.x} y2={right.y - 22} stroke="#10b981" strokeWidth={2} strokeDasharray="6 4" />
                </g>
              );
            })}

          {layouts.map((item) => {
            const isSelected = pathsEqual(item.path, activePath);
            const isPrimeLeaf = !item.node.left && !item.node.right && isPrime(item.node.value);
            const isCompositeLeaf = !item.node.left && !item.node.right && !isPrime(item.node.value);
            const canSelect = isCompositeLeaf;

            return (
              <g key={pathKey(item.path)}>
                <circle
                  cx={item.x}
                  cy={item.y}
                  r={isSelected ? 30 : 26}
                  fill={
                    isPrimeLeaf
                      ? "#dcfce7"
                      : isCompositeLeaf
                        ? isSelected
                          ? "#e0e7ff"
                          : "#fef3c7"
                        : "#f8fafc"
                  }
                  stroke={
                    isSelected ? "#4338ca" : isPrimeLeaf ? "#16a34a" : isCompositeLeaf ? "#d97706" : "#94a3b8"
                  }
                  strokeWidth={isSelected ? 4 : 3}
                  className={canSelect ? "cursor-pointer" : undefined}
                  onClick={() => {
                    if (isCompositeLeaf) {
                      setSelectedPath(item.path);
                    }
                  }}
                />
                <text
                  x={item.x}
                  y={item.y + 8}
                  textAnchor="middle"
                  className="fill-slate-900 text-[18px] font-black"
                >
                  {item.node.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {divisors.length > 0 && (
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-700">
            Podziel {selectedNode.value} na dwa mnożniki — wybierz dzielnik:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {divisors.map((divisor) => (
              <button
                key={divisor}
                type="button"
                onClick={() => applySplit(divisor)}
                className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-base font-black text-indigo-700 hover:bg-indigo-50"
              >
                {divisor} × {selectedNode.value / divisor}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-indigo-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Iloczyn liści</p>
          <p className="mt-1 text-2xl font-black text-indigo-900">
            {leaves ? leaves.join(" × ") : "—"}
          </p>
          <p className="mt-1 text-sm font-semibold text-indigo-700">
            {leaves
              ? product === number
                ? "Iloczyn zgadza się z liczbą początkową."
                : `Iloczyn = ${product} — jeszcze nie równa się ${number}.`
              : "Podziel wszystkie liczby złożone, aż zostaną same pierwsze."}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Czynniki pierwsze</p>
          <p className="mt-1 text-2xl font-black text-emerald-900">
            {leaves && product === number ? factorsToLabel(leaves).split("|").join(" × ") : canonicalFactors.join(" × ")}
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-800">
            {leaves && product === number
              ? `${number} = ${factorsToLabel(leaves).split("|").join(" × ")}`
              : `Docelowo: ${number} = ${canonicalFactors.join(" × ")}`}
          </p>
        </div>
      </div>

      {mode !== "task" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetTree}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Wyczyść drzewko
          </button>
        </div>
      )}

      {!compactChrome && (
        <LessonNote>
          <strong>Pomysł na lekcję:</strong> pozwól uczniom wybrać różne dzielniki tej samej liczby (np. 60 = 6×10 albo
          2×30) i porównaj drzewka — na końcu zawsze powinny wyjść te same czynniki pierwsze.
        </LessonNote>
      )}
    </Card>
  );
}
