import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { listLessonPackages } from "@/data/lessons/registry";
import { getLessonCapabilities } from "@/lib/lessons/capabilities";
import type { LessonPackage } from "@/types/lessonPackage";

export const metadata = {
  title: "Materiały",
};

export default function TeacherLessonsPage() {
  const lessons = listLessonPackages();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Materiały do lekcji</h1>
        <p className="text-sm text-[var(--ink-muted)]">
          Krótkie segmenty wspierające pracę z podręcznikiem. Badge pokazuje realnie dostępny kanał, nie obietnicę pełnej lekcji ekranowej.
        </p>
      </header>

      <div className="grid gap-4">
        {lessons.map((lesson) => <LessonLibraryRow key={lesson.id} lesson={lesson} />)}
      </div>

      {lessons.length === 0 ? <p className="text-sm text-[var(--ink-muted)]">Brak materiałów — sprawdź plan klasy V.</p> : null}

      <Link href="/nauczyciel/program" className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
        ← Plan klasy V
      </Link>
    </div>
  );
}

function LessonLibraryRow({ lesson }: { lesson: LessonPackage }) {
  const capabilities = getLessonCapabilities(lesson);
  const canOpen = lesson.status === "published";

  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{lesson.topicId}</Badge>
          <Badge tone={canOpen ? "neutral" : "warning"}>{canOpen ? "Scenariusz" : "W przygotowaniu"}</Badge>
          {capabilities.hasStudentInteraction ? <Badge tone="learn">Interakcja</Badge> : null}
          {capabilities.hasPrintResources ? <Badge tone="assess">Druk</Badge> : null}
          {capabilities.hasAssessmentBlueprint ? <Badge tone="brand">A/B</Badge> : null}
          {capabilities.hasLivePilot ? <Badge tone="success">Pilot live</Badge> : null}
          <span className="text-xs text-[var(--ink-muted)]">{lesson.estimatedMinutes} min</span>
        </div>
        <h2 className="text-lg font-bold text-[var(--ink)]">{lesson.title}</h2>
        <p className="text-sm text-[var(--ink-muted)]">{lesson.studentGoal}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canOpen ? (
          <>
            <Link href={`/nauczyciel/lekcje/${lesson.id}/przygotuj`} className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Przygotuj
            </Link>
            <Link href={`/nauczyciel/lekcje/${lesson.id}`} className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] bg-[var(--brand-600)] px-4 text-sm font-semibold text-white hover:opacity-90">
              Otwórz materiał
            </Link>
          </>
        ) : (
          <span className="text-sm font-semibold text-slate-500">Scenariusz oczekuje na weryfikację techniczną.</span>
        )}
      </div>
    </Card>
  );
}
