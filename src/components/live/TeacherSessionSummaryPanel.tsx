import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { LessonSessionTeacherSummary } from "@/types/lessonSession";

interface TeacherSessionSummaryPanelProps {
  summary: LessonSessionTeacherSummary;
}

export function TeacherSessionSummaryPanel({ summary }: TeacherSessionSummaryPanelProps) {
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="assess">Podsumowanie sesji</Badge>
          <Badge tone="brand">{summary.topicId}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">{summary.lessonTitle}</h1>
        <p className="text-sm text-[var(--ink-muted)]">
          {summary.participantCount} uczestników · {summary.responseCount} odpowiedzi
          {summary.correctRate != null ? ` · ${summary.correctRate}% poprawnych pierwszych kroków` : ""}
        </p>
        {summary.recordSkillEvidence ? (
          <p className="text-xs text-emerald-700">
            Zapis diagnostyczny włączony
            {summary.evidenceRecordedAt ? ` · zapisano ${new Date(summary.evidenceRecordedAt).toLocaleString("pl-PL")}` : ""}
          </p>
        ) : (
          <p className="text-xs text-slate-500">Zapis diagnostyczny wyłączony — wyniki nie trafiły do mapy umiejętności.</p>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-3xl font-black text-slate-900">{summary.participantCount}</p>
          <p className="mt-1 text-sm text-slate-500">uczestników</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-black text-slate-900">{summary.responseCount}</p>
          <p className="mt-1 text-sm text-slate-500">odpowiedzi</p>
        </Card>
        {summary.correctRate != null ? (
          <Card className="text-center">
            <p className="text-3xl font-black text-emerald-700">{summary.correctRate}%</p>
            <p className="mt-1 text-sm text-slate-500">poprawnych pierwszych kroków</p>
          </Card>
        ) : null}
      </div>

      {summary.stageStats.length > 0 ? (
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Etapy</h2>
          <ul className="space-y-2">
            {summary.stageStats.map((row) => (
              <li
                key={row.stageId}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
              >
                <span className="font-medium text-slate-900">{row.stageTitle}</span>
                <span className="text-sm text-slate-600">
                  {row.submittedCount} odp.
                  {row.correctRate != null ? ` · ${row.correctRate}% poprawnych` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {summary.skillStats.length > 0 ? (
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Umiejętności (live)</h2>
          <ul className="space-y-2">
            {summary.skillStats.map((row) => (
              <li key={row.skillId} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-mono text-slate-800">{row.skillId}</span>
                <span className="text-slate-600">
                  {row.responseCount} dowodów · waga {row.evidenceWeight}
                  {row.correctRate != null ? ` · ${row.correctRate}% poprawnych` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {summary.revisitStudents.length > 0 ? (
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700">Do powtórki (prywatnie)</h2>
          <p className="text-xs text-slate-500">Poniżej 50% poprawnych odpowiedzi — widoczne tylko dla Ciebie.</p>
          <ul className="space-y-2">
            {summary.revisitStudents.map((row) => (
              <li key={row.studentId} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-slate-900">{row.displayName}</span>
                <span className="text-slate-600">
                  {row.submittedCount} odp.
                  {row.correctRate != null ? ` · ${row.correctRate}% poprawnych` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {summary.strategyHistogram.length > 0 ? (
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Strategie uczniów (operator)</h2>
          <ul className="space-y-1 text-sm text-slate-700">
            {summary.strategyHistogram.map((bucket) => (
              <li key={bucket.selectedOperatorIndex}>
                Indeks operatora {bucket.selectedOperatorIndex}: {bucket.count} wyborów
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
