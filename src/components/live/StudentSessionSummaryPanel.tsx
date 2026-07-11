import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { LessonSessionStudentSummary } from "@/types/lessonSession";
import Link from "next/link";

interface StudentSessionSummaryPanelProps {
  summary: LessonSessionStudentSummary;
}

export function StudentSessionSummaryPanel({ summary }: StudentSessionSummaryPanelProps) {
  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-fuchsia-500 via-indigo-600 to-cyan-500 p-6 text-center text-white shadow-xl">
        <div className="text-6xl" aria-hidden>{summary.responseCount > 0 ? "🎉⭐🏆" : "🌱"}</div>
        <h2 className="mt-3 text-3xl font-black">{summary.responseCount > 0 ? "Brawo za aktywność!" : "Każda próba to krok naprzód"}</h2>
        <p className="mt-2 text-indigo-50">Wykonałeś {summary.responseCount} {summary.responseCount === 1 ? "zadanie" : "zadań"}. Punkty znajdziesz w klaserze, a za 100% całego tematu czeka jednorazowa naklejka.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2"><Link href="/uczen/klaser" className="rounded-xl bg-white px-4 py-3 text-sm font-black text-indigo-700">Otwórz klaser</Link><Link href="/uczen/szybki-test" className="rounded-xl bg-slate-950/35 px-4 py-3 text-sm font-black text-white">Powtórz temat w domu</Link></div>
      </section>
      <header className="space-y-2 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge tone="learn">Twoje podsumowanie</Badge>
          <Badge tone="brand">{summary.topicId}</Badge>
        </div>
        <h1 className="text-xl font-bold text-slate-900">{summary.lessonTitle}</h1>
        {summary.correctRate != null ? (
          <p className="text-sm text-slate-600">
            {summary.responseCount} odpowiedzi · {summary.correctRate}% poprawnych pierwszych kroków
          </p>
        ) : (
          <p className="text-sm text-slate-600">{summary.responseCount} odpowiedzi</p>
        )}
      </header>

      {summary.items.length > 0 ? (
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Twoje odpowiedzi</h2>
          <ul className="space-y-3">
            {summary.items.map((item) => {
              const correct = item.score === item.maxScore;
              return (
                <li
                  key={item.responseId}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.stageTitle}</p>
                  <p className="mt-1 font-mono text-lg text-slate-900">{item.expression}</p>
                  <p className={`mt-2 text-sm font-semibold ${correct ? "text-emerald-700" : "text-amber-800"}`}>
                    {correct ? "Poprawnie — dobry pierwszy krok" : "Do przećwiczenia — sprawdź kolejność działań"}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <Card className="py-8 text-center text-sm text-slate-600">Nie wysłałeś odpowiedzi w tej sesji.</Card>
      )}

      {summary.evidenceSources.length > 0 ? (
        <Card className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Wkład w mapę umiejętności</h2>
          <p className="text-xs text-slate-500">
            Lekcja na żywo ma niską wagę ({summary.evidenceSources[0]?.weight ?? 0.25}) — to wskazówka, nie ocena.
          </p>
          <ul className="space-y-1 text-sm text-slate-700">
            {summary.evidenceSources.map((source) => (
              <li key={source.evidenceId} className="font-mono text-xs">
                {source.skillId}: {source.rawScore}/{source.rawMax} pkt (live)
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
