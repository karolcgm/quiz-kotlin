import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { AssessmentBlueprint, SkillCoverageEntry } from "@/types/assessmentBlueprint";

interface BlueprintCoveragePanelProps {
  blueprint: AssessmentBlueprint;
  coverage: SkillCoverageEntry[];
  parityOk: boolean;
  parityErrors?: string[];
}

const DIFFICULTY_LABELS = {
  support: "Start",
  core: "Rdzeń",
  challenge: "Mistrzowskie",
} as const;

export function BlueprintCoveragePanel({
  blueprint,
  coverage,
  parityOk,
  parityErrors = [],
}: BlueprintCoveragePanelProps) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Blueprint</p>
        <Badge tone="assess">{blueprint.kind}</Badge>
        <Badge tone="neutral">{blueprint.deliveryMode}</Badge>
        {parityOk ? (
          <Badge tone="success">A/B równoważne</Badge>
        ) : (
          <Badge tone="danger">Błąd parytetu A/B</Badge>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-slate-500">Tematy</p>
          <p className="font-mono text-sm text-slate-800">{blueprint.topicIds.join(", ")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">Czas / pozycje</p>
          <p className="text-sm text-slate-800">
            {blueprint.estimatedMinutes} min · {blueprint.slots.length} zadań
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500">Pokrycie umiejętności</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-2 pr-3">Umiejętność</th>
                <th className="py-2 pr-3">Zadania</th>
                <th className="py-2 pr-3">Punkty</th>
                <th className="py-2">Poziomy</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((row) => (
                <tr key={row.skillId} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-mono text-xs">{row.skillId}</td>
                  <td className="py-2 pr-3">{row.slotCount}</td>
                  <td className="py-2 pr-3">{row.maxScore}</td>
                  <td className="py-2 text-xs text-slate-600">
                    {(["support", "core", "challenge"] as const)
                      .filter((d) => row.difficulties[d] > 0)
                      .map((d) => `${DIFFICULTY_LABELS[d]}×${row.difficulties[d]}`)
                      .join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!parityOk && parityErrors.length > 0 ? (
        <ul className="list-inside list-disc text-xs text-red-700">
          {parityErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
