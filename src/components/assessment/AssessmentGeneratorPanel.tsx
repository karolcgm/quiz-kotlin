"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BlueprintCoveragePanel } from "@/components/assessment/BlueprintCoveragePanel";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type {
  AssessmentBlueprint,
  AssessmentVersionBundle,
  AssessmentVersionCode,
} from "@/types/assessmentBlueprint";
import {
  computeSkillCoverage,
  generateFrozenVersionSnapshot,
  resolveVersionSeed,
  verifySnapshotChecksum,
} from "@/lib/assessment/generateVersionSnapshot";

interface AssessmentGeneratorPanelProps {
  lessonId: string;
  blueprint: AssessmentBlueprint;
  parityOk: boolean;
  parityErrors: string[];
}

const VERSIONS: AssessmentVersionCode[] = ["A", "B"];

export function AssessmentGeneratorPanel({
  lessonId,
  blueprint,
  parityOk,
  parityErrors,
}: AssessmentGeneratorPanelProps) {
  const [versionCode, setVersionCode] = useState<AssessmentVersionCode>("A");
  const [showKey, setShowKey] = useState(false);

  const coverage = useMemo(() => computeSkillCoverage(blueprint), [blueprint]);

  const bundle = useMemo(() => {
    const seed = resolveVersionSeed(blueprint, versionCode);
    return generateFrozenVersionSnapshot(blueprint, versionCode, seed);
  }, [blueprint, versionCode]);

  const checksumValid = useMemo(() => verifySnapshotChecksum(bundle), [bundle]);

  const compareBundle = useMemo(() => {
    const otherCode: AssessmentVersionCode = versionCode === "A" ? "B" : "A";
    const seed = resolveVersionSeed(blueprint, otherCode);
    return generateFrozenVersionSnapshot(blueprint, otherCode, seed);
  }, [blueprint, versionCode]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="assess">Generator A/B</Badge>
          <Badge tone="brand">v{blueprint.version}</Badge>
        </div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">{blueprint.title}</h2>
        {blueprint.subtitle ? <p className="text-sm text-[var(--ink-muted)]">{blueprint.subtitle}</p> : null}
      </header>

      <BlueprintCoveragePanel
        blueprint={blueprint}
        coverage={coverage}
        parityOk={parityOk}
        parityErrors={parityErrors}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wersja arkusza</p>
            <div className="flex gap-2">
              {VERSIONS.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setVersionCode(code)}
                  className={`min-h-10 rounded-lg px-4 text-sm font-bold ${
                    versionCode === code
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Wersja {code}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              {showKey ? "Ukryj klucz" : "Pokaż klucz nauczyciela"}
            </button>
            <Link
              href={`/nauczyciel/lekcje/${lessonId}/generator/druk?blueprint=${blueprint.id}&version=${versionCode}&view=student`}
              className="inline-flex min-h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-bold text-white hover:bg-teal-800"
            >
              Podgląd A4 →
            </Link>
            <Link
              href={`/nauczyciel/lekcje/${lessonId}/generator/wyslij?blueprint=${blueprint.id}&version=${versionCode}`}
              className="inline-flex min-h-10 items-center rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800"
            >
              Wyślij klasie →
            </Link>
            <Link
              href={`/nauczyciel/lekcje/${lessonId}/generator/wyniki?blueprint=${blueprint.id}&version=${versionCode}`}
              className="inline-flex min-h-10 items-center rounded-lg bg-violet-700 px-4 text-sm font-bold text-white hover:bg-violet-800"
            >
              Wyniki papierowe →
            </Link>
          </div>
        </div>

        <SnapshotMeta bundle={bundle} checksumValid={checksumValid} />

        <SnapshotItemsTable bundle={bundle} showKey={showKey} />

        <ComparisonHint current={bundle} other={compareBundle} otherCode={versionCode === "A" ? "B" : "A"} />
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/nauczyciel/lekcje/${lessonId}/przygotuj`}
          className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          ← Przygotowanie lekcji
        </Link>
        <Link
          href={`/nauczyciel/lekcje/${lessonId}/druk`}
          className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Materiały statyczne
        </Link>
      </div>
    </div>
  );
}

function SnapshotMeta({
  bundle,
  checksumValid,
}: {
  bundle: AssessmentVersionBundle;
  checksumValid: boolean;
}) {
  const { snapshot } = bundle;
  return (
    <dl className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-xs text-slate-500">Wersja / seed</dt>
        <dd className="font-mono font-semibold">
          {snapshot.versionCode} · seed {snapshot.versionSeed}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-slate-500">Suma punktów</dt>
        <dd className="font-semibold">{snapshot.maxScore} pkt</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-xs text-slate-500">Checksum snapshotu</dt>
        <dd className="break-all font-mono text-xs text-slate-700">
          {snapshot.checksum}
          {checksumValid ? (
            <span className="ml-2 text-green-700">✓ integralność OK</span>
          ) : (
            <span className="ml-2 text-red-700">✗ błąd checksum</span>
          )}
        </dd>
      </div>
    </dl>
  );
}

function SnapshotItemsTable({
  bundle,
  showKey,
}: {
  bundle: AssessmentVersionBundle;
  showKey: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <th className="py-2 pr-3">#</th>
            <th className="py-2 pr-3">Wyrażenie</th>
            <th className="py-2 pr-3">Poziom</th>
            <th className="py-2 pr-3">Pkt</th>
            {showKey ? <th className="py-2">Klucz (nauczyciel)</th> : null}
          </tr>
        </thead>
        <tbody>
          {bundle.snapshot.items.map((item, index) => {
            const key = bundle.answerKey[index];
            return (
              <tr key={item.slotId} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-semibold">{item.position}</td>
                <td className="py-2 pr-3 font-mono text-base font-black tabular-nums">{item.expression}</td>
                <td className="py-2 pr-3 text-xs">{item.difficulty}</td>
                <td className="py-2 pr-3">{item.maxScore}</td>
                {showKey && key ? (
                  <td className="py-2 text-xs text-slate-700">
                    {key.answerSpec.firstStepLabel} (wynik końcowy: {key.answerSpec.finalValue})
                    <br />
                    <span className="text-slate-500">{key.rubric}</span>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonHint({
  current,
  other,
  otherCode,
}: {
  current: AssessmentVersionBundle;
  other: AssessmentVersionBundle;
  otherCode: AssessmentVersionCode;
}) {
  const samePositions = current.snapshot.items.length === other.snapshot.items.length;
  const samePoints = current.snapshot.maxScore === other.snapshot.maxScore;
  return (
    <p className="text-xs text-slate-600">
      Porównanie z wersją {otherCode}: {samePositions ? "ta sama liczba zadań" : "różna liczba"},{" "}
      {samePoints ? "ta sama punktacja" : "różna punktacja"}. Wyrażenia są generowane osobnym seedem.
    </p>
  );
}
