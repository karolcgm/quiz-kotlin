import Link from "next/link";
import { Badge, topicStatusBadge } from "@/components/ui/Badge";
import { Card, StatCard } from "@/components/ui/Card";
import { getLessonPackageForTopic, isTopicLessonPublished } from "@/data/lessons/registry";
import type { ProgramCurriculum, ProgramSection, ProgramTopic } from "@/types/program";
import { countTopicsByStatus } from "@/data/curriculum/pl-math-5-2026-classic";

interface ProgramOverviewProps {
  curriculum: ProgramCurriculum;
  programHomeHref: string;
  getSectionHref: (sectionId: string) => string;
}

export function ProgramOverview({
  curriculum,
  programHomeHref,
  getSectionHref,
}: ProgramOverviewProps) {
  const stats = countTopicsByStatus(curriculum);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge tone="brand">Program {curriculum.schoolYearLabel}</Badge>
        <h2 className="text-2xl font-bold text-[var(--ink)]">{curriculum.title}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--ink-muted)]">
          Wybierz dział, a potem temat — gotowa lekcja, praca i sprawdzian w jednym miejscu. Tematy
          oznaczone jako „Metadane programu” mają plan i opis, lekcja interaktywna jest w
          przygotowaniu.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Działy" value={curriculum.sections.length} accent="brand" />
        <StatCard label="Tematy" value={stats.total} accent="neutral" />
        <StatCard label="Gotowe lekcje" value={stats.published} accent="learn" />
        <StatCard
          label="W przygotowaniu"
          value={stats.metadataOnly}
          hint="Metadane + rdzeń lekcji"
          accent="assess"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {curriculum.sections.map((section) => (
          <ProgramSectionCard
            key={section.id}
            section={section}
            href={getSectionHref(section.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ProgramSectionCard({ section, href }: { section: ProgramSection; href: string }) {
  const publishedCount = section.topics.filter((t) => t.contentStatus === "published").length;

  return (
    <Link href={href} className="group block">
      <Card className="h-full transition group-hover:border-[var(--brand-600)] group-hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              Dział {section.number} · {section.hoursLabel}
            </p>
            <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">{section.title}</h3>
          </div>
          <Badge tone="neutral">{section.topics.length} tem.</Badge>
        </div>
        <p className="mt-3 text-sm text-[var(--ink-muted)]">{section.goal}</p>
        <p className="mt-4 text-xs font-medium text-[var(--brand-600)]">
          {publishedCount > 0
            ? `${publishedCount} gotowych lekcji`
            : "Plan programu — lekcje w przygotowaniu"}{" "}
          →
        </p>
      </Card>
    </Link>
  );
}

export function ProgramTopicList({
  section,
  programHomeHref,
}: {
  section: ProgramSection;
  programHomeHref: string;
}) {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <Link
          href={programHomeHref}
          className="text-sm font-semibold text-[var(--brand-600)] hover:underline"
        >
          ← Program klasy V
        </Link>
        <h2 className="text-2xl font-bold text-[var(--ink)]">
          Dział {section.number}: {section.title}
        </h2>
        <p className="text-sm text-[var(--ink-muted)]">{section.goal}</p>
      </header>

      <div className="space-y-3">
        {section.topics.map((topic) => (
          <ProgramTopicRow key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}

function ProgramTopicRow({ topic }: { topic: ProgramTopic }) {
  const lessonPublished = isTopicLessonPublished(topic.id);
  const lesson = getLessonPackageForTopic(topic.id);
  const displayStatus = lessonPublished ? "published" : topic.contentStatus;

  return (
    <Card muted className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[var(--ink-muted)]">{topic.id}</span>
          {topicStatusBadge(displayStatus)}
          {topic.kind === "optional" ? <Badge tone="warning">Opcjonalny</Badge> : null}
          {topic.kind === "exam" ? <Badge tone="assess">Sprawdzian</Badge> : null}
          {topic.kind === "review" ? <Badge tone="learn">Powtórzenie</Badge> : null}
        </div>
        <h3 className="text-base font-bold text-[var(--ink)]">{topic.title}</h3>
        <p className="text-sm text-[var(--ink-muted)]">
          <span className="font-medium text-[var(--ink)]">Rdzeń:</span> {topic.coreLesson} ·{" "}
          {topic.hoursLabel}
        </p>
        <p className="text-xs text-[var(--ink-muted)]">{topic.paperEvidence}</p>
      </div>
      <div className="shrink-0">
        {lessonPublished && lesson ? (
          <div className="flex flex-col gap-2 sm:items-end">
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
              Otwórz lekcję
            </Link>
          </div>
        ) : (
          <span className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] border border-slate-200 bg-[var(--surface-muted)] px-4 text-sm font-semibold text-[var(--ink-muted)]">
            W przygotowaniu
          </span>
        )}
      </div>
    </Card>
  );
}
