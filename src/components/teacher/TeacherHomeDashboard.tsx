import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { TeacherDashboardData } from "@/lib/teacher/dashboardData";
import { formatSubmittedAt } from "@/lib/teacher/panelFilters";

interface TeacherHomeDashboardProps {
  displayName: string;
  data: TeacherDashboardData;
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
    </div>
  );
}

export function TeacherHomeDashboard({ displayName, data }: TeacherHomeDashboardProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">Panel główny</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Dzień dobry, {displayName}</h1>
        <p className="mt-3 max-w-2xl text-indigo-100">
          Tu widać terminy, oddania, oczekujące sprawdzenia i prośby o poprawę.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/nauczyciel/testy/nowy" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-700">
            Nowy test
          </Link>
          <Link href="/nauczyciel/dziennik" className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            Dziennik
          </Link>
          <Link href="/nauczyciel/wyniki" className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            Wyniki
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Aktywność — tydzień" value={`${data.activity.weekPercent}%`} hint={`${data.activity.submissionsWeek} oddanych prac`} />
        <StatTile label="Aktywność — miesiąc" value={`${data.activity.monthPercent}%`} hint={`${data.activity.submissionsMonth} oddanych prac`} />
        <StatTile label="Aktywność — rok" value={`${data.activity.yearPercent}%`} hint={`${data.activity.submissionsYear} oddanych prac`} />
        <StatTile label="Prośby o poprawę" value={String(data.pendingRetakes.length)} hint="Oczekujące zgłoszenia" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Prace domowe na dziś</h2>
          <div className="mt-4 space-y-3">
            {data.todayHomework.length === 0 && (
              <p className="text-sm text-slate-500">Dziś brak terminów prac domowych.</p>
            )}
            {data.todayHomework.map((item) => (
              <div key={item.assignmentId} className="rounded-xl border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.classLabel}</p>
                <p className="mt-1 text-sm text-indigo-700">
                  Oddano: {item.submittedCount}/{item.totalCount}
                </p>
                {item.missingStudents.length > 0 && (
                  <p className="mt-1 text-xs text-amber-800">
                    Brak: {item.missingStudents.join(", ")}
                    {item.totalCount - item.submittedCount > item.missingStudents.length ? "…" : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-900">Po terminie — kto nie oddał</h2>
          <div className="mt-4 space-y-3">
            {data.overdueAssignments.length === 0 && (
              <p className="text-sm text-slate-500">Brak zaległych zadań.</p>
            )}
            {data.overdueAssignments.map((item) => (
              <div key={item.assignmentId} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="font-semibold text-amber-950">{item.title}</p>
                <p className="text-sm text-amber-900">{item.classLabel} · {item.kind}</p>
                <p className="mt-1 text-sm text-amber-900">
                  Oddano {item.submittedCount}/{item.totalCount}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-900">Do sprawdzenia</h2>
          <p className="mt-1 text-sm text-slate-600">Oddane prace czekają na odhaczenie.</p>
          <div className="mt-4 space-y-2">
            {data.unreviewedSubmissions.length === 0 && (
              <p className="text-sm text-slate-500">Wszystko sprawdzone.</p>
            )}
            {data.unreviewedSubmissions.map((item) => (
              <Link
                key={item.submissionId}
                href={`/nauczyciel/wyniki/${item.submissionId}`}
                className="block rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <p className="font-semibold text-slate-900">{item.studentName}</p>
                <p className="text-sm text-slate-600">
                  {item.assignmentTitle} · {item.kind}
                  {item.mark !== null ? ` · ocena ${item.mark}` : ` · ${item.percentage}%`}
                </p>
                {item.submittedAt && (
                  <p className="text-xs text-slate-500">Oddano: {formatSubmittedAt(item.submittedAt)}</p>
                )}
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-900">Zgłoszone poprawy</h2>
          <div className="mt-4 space-y-2">
            {data.pendingRetakes.length === 0 && (
              <p className="text-sm text-slate-500">Brak oczekujących próśb.</p>
            )}
            {data.pendingRetakes.map((item) => (
              <Link
                key={item.requestId}
                href={`/nauczyciel/wyniki/${item.submissionId}`}
                className="block rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <p className="font-semibold text-slate-900">{item.studentName}</p>
                <p className="text-sm text-slate-600">{item.classLabel}</p>
                <p className="text-sm text-slate-500">{item.assignmentTitle}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Aktywne zadania (okno OD–DO)</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.activeAssignments.length === 0 && (
              <p className="text-sm text-slate-500">Brak aktywnych zadań w tym momencie.</p>
            )}
            {data.activeAssignments.map((item) => (
              <div key={item.assignmentId} className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="font-semibold text-emerald-950">{item.title}</p>
                <p className="text-sm text-emerald-900">{item.classLabel} · {item.kind}</p>
                <p className="mt-1 text-xs text-emerald-800">
                  {item.startsAt ? `Od: ${formatSubmittedAt(item.startsAt)}` : "Bez daty startu"}
                  {item.dueAt ? ` · Do: ${formatSubmittedAt(item.dueAt)}` : ""}
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-900">
                  {item.submittedCount}/{item.totalCount} oddanych
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Ostatnie oceny</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentGrades.length === 0 && (
              <p className="text-sm text-slate-500">Brak ocen do wyświetlenia.</p>
            )}
            {data.recentGrades.map((item) => (
              <Link
                key={item.submissionId}
                href={`/nauczyciel/wyniki/${item.submissionId}`}
                className="rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <p className="font-semibold text-slate-900">{item.studentName}</p>
                <p className="text-sm text-slate-600">{item.assignmentTitle}</p>
                <p className="mt-1 text-sm font-bold text-indigo-700">
                  {item.kind}: {item.mark} ({item.percentage}%)
                </p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
