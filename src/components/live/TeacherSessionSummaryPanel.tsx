import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { LessonSessionDescriptiveGrade, LessonSessionTeacherResultRow, LessonSessionTeacherSummary } from "@/types/lessonSession";

interface TeacherSessionSummaryPanelProps {
  summary: LessonSessionTeacherSummary;
  studentResults?: LessonSessionTeacherResultRow[];
  descriptiveGrades?: LessonSessionDescriptiveGrade[];
}

export function TeacherSessionSummaryPanel({ summary, studentResults = [], descriptiveGrades = [] }: TeacherSessionSummaryPanelProps) {
  const students = Array.from(new Map(studentResults.map((row) => [row.studentId, row.displayName])).entries());
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

      {students.length > 0 ? (
        <Card className="space-y-4">
          <div><h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Wyniki każdego ucznia</h2><p className="mt-1 text-xs text-slate-500">Pełny zapis wszystkich odpowiedzi na każdej stacji — widoczny tylko dla nauczyciela.</p></div>
          <div className="space-y-4">
            {students.map(([studentId, displayName]) => {
              const rows = studentResults.filter((row) => row.studentId === studentId);
              const submitted = rows.reduce((sum, row) => sum + row.submittedCount, 0);
              const correct = rows.reduce((sum, row) => sum + row.correctCount, 0);
              const total = rows.reduce((sum, row) => sum + row.taskCount, 0);
              return <details key={studentId} className="rounded-2xl border border-slate-200 bg-white p-4" open>
                <summary className="cursor-pointer list-none font-bold text-slate-950">{displayName} <span className="ml-2 text-sm font-medium text-slate-500">{submitted}/{total} wykonanych · {correct} poprawnych</span></summary>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">{rows.map((row) => <div key={row.stageId} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm"><span className="truncate text-slate-700">{row.stageTitle}</span><strong className="shrink-0 text-slate-950">{row.submittedCount}/{row.taskCount} · {row.correctCount} ✓</strong></div>)}</div>
              </details>;
            })}
          </div>
        </Card>
      ) : null}

      {descriptiveGrades.length > 0 ? (
        <Card className="space-y-4">
          <div><h2 className="text-sm font-semibold uppercase tracking-wide text-violet-700">Punktacja i oceny opisowe</h2><p className="mt-1 text-xs text-slate-500">Prywatna diagnoza działu widoczna nauczycielowi i danemu uczniowi w zakładce Oceny.</p></div>
          <div className="space-y-3">{descriptiveGrades.map((grade) => {
            const studentName = studentResults.find((row) => row.studentId === grade.studentId)?.displayName ?? "Uczeń";
            return <div key={grade.id} className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-slate-950">{studentName}</strong><span className="rounded-full bg-violet-700 px-3 py-1 text-sm font-black text-white">{grade.totalScore}/{grade.maxScore} pkt · {grade.percentage}%</span></div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{grade.descriptiveFeedback}</p>
            </div>;
          })}</div>
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
