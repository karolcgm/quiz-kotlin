import { Card } from "@/components/ui/Card";
import type { LessonUnderstandingSessionStats, UnderstandingLevel } from "@/types/understanding";

const LEVEL_LABELS: Record<UnderstandingLevel, string> = {
  understood: "Umiem samodzielnie",
  partial: "Potrzebuję jednej wskazówki",
  not_understood: "Potrzebuję wspólnego przykładu",
};

const LEVEL_STYLES: Record<UnderstandingLevel, string> = {
  understood: "bg-emerald-100 text-emerald-900",
  partial: "bg-yellow-100 text-yellow-950",
  not_understood: "bg-orange-100 text-orange-950",
};

export function UnderstandingStatsPanel({ stats }: { stats: LessonUnderstandingSessionStats }) {
  return (
    <Card className="space-y-5 border-indigo-100">
      <div>
        <p className="text-xs font-black uppercase tracking-[.16em] text-indigo-700">Samoocena zrozumienia</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">Czy klasa rozumie temat?</h2>
        <p className="mt-1 text-sm text-slate-600">Odpowiedziało {stats.submittedCount}/{stats.totalStudents} uczniów. Wynik jest prywatny i służy do planowania powtórki.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-emerald-50 p-4 text-center"><span className="text-2xl" aria-hidden>✓</span><strong className="mt-2 block text-2xl text-emerald-900">{stats.understoodCount}</strong><span className="text-xs font-bold text-emerald-800">umie samodzielnie</span></div>
        <div className="rounded-2xl bg-yellow-50 p-4 text-center"><span className="text-2xl" aria-hidden>💡</span><strong className="mt-2 block text-2xl text-yellow-950">{stats.partialCount}</strong><span className="text-xs font-bold text-yellow-900">potrzebuje wskazówki</span></div>
        <div className="rounded-2xl bg-orange-50 p-4 text-center"><span className="text-2xl" aria-hidden>👥</span><strong className="mt-2 block text-2xl text-orange-950">{stats.notUnderstoodCount}</strong><span className="text-xs font-bold text-orange-900">potrzebuje wspólnego przykładu</span></div>
        <div className="rounded-2xl bg-indigo-700 p-4 text-center text-white"><strong className="block text-3xl">{stats.needsReviewPercent}%</strong><span className="mt-2 block text-xs font-bold text-indigo-100">zgłasza potrzebę powtórki</span></div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-600">Odpowiedzi uczniów</h3>
        {stats.students.map((student) => (
          <div key={student.studentId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2">
            <span className="font-bold text-slate-900">{student.displayName}</span>
            {student.understandingLevel ? (
              <span className={`rounded-full px-3 py-1 text-xs font-black ${LEVEL_STYLES[student.understandingLevel]}`}>
                {LEVEL_LABELS[student.understandingLevel]}
              </span>
            ) : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Czekamy na odpowiedź</span>}
          </div>
        ))}
      </div>
    </Card>
  );
}
