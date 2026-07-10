import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { listPublishedLessonPackages } from "@/data/lessons/registry";

export const metadata = {
  title: "Lekcje",
};

export default function TeacherLessonsPage() {
  const lessons = listPublishedLessonPackages();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--ink)]">Biblioteka lekcji</h2>
        <p className="text-sm text-[var(--ink-muted)]">
          Gotowe pakiety 45-minutowe — tablica, tablet i materiał papierowy w jednym planie.
        </p>
      </header>

      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{lesson.topicId}</Badge>
                <Badge tone="success">Opublikowany</Badge>
                <span className="text-xs text-[var(--ink-muted)]">{lesson.estimatedMinutes} min</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--ink)]">{lesson.title}</h3>
              <p className="text-sm text-[var(--ink-muted)]">{lesson.studentGoal}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/nauczyciel/lekcje/${lesson.id}/przygotuj`}
                className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Przygotuj
              </Link>
              <Link
                href={`/nauczyciel/lekcje/${lesson.id}`}
                className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] bg-[var(--brand-600)] px-4 text-sm font-semibold text-white hover:opacity-90"
              >
                Prowadź lekcję
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">Brak opublikowanych pakietów — sprawdź program klasy V.</p>
      ) : null}

      <Link href="/nauczyciel/program" className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
        ← Mapa programu klasy V
      </Link>
    </div>
  );
}
