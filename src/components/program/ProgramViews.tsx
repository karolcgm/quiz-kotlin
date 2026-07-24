import Link from "next/link";
import { TopicPlanStatusControl } from "@/components/program/TopicPlanStatusControl";
import { Badge, topicStatusBadge } from "@/components/ui/Badge";
import { Card, StatCard } from "@/components/ui/Card";
import { getLessonPackageForTopic, isTopicLessonPublished } from "@/data/lessons/registry";
import { getLessonCapabilities } from "@/lib/lessons/capabilities";
import type { ProgramCurriculum, ProgramSection, ProgramTopic, TopicPlanEntryRow } from "@/types/program";

interface ProgramOverviewProps {
  curriculum: ProgramCurriculum;
  programHomeHref: string;
  getSectionHref: (sectionId: string) => string;
  planEntries?: TopicPlanEntryRow[];
  classLabel?: string;
}

export function ProgramOverview({ curriculum, programHomeHref, getSectionHref, planEntries = [], classLabel }: ProgramOverviewProps) {
  const lessons = curriculum.sections.flatMap((section) => section.topics)
    .map((topic) => getLessonPackageForTopic(topic.id))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
  const interactiveCount = lessons.filter((lesson) => getLessonCapabilities(lesson).hasStudentInteraction).length;
  const completedCount = planEntries.filter((entry) => entry.status === "completed").length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge tone="brand">{classLabel ? `Plan: ${classLabel}` : `Program ${curriculum.schoolYearLabel}`}</Badge>
        <h1 className="text-2xl font-bold text-[var(--ink)]">{curriculum.title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--ink-muted)]">
          Plan wspiera lekcję z podręcznikiem. Oznaczaj wykonane tematy dla tej klasy; statusy materiałów rozróżniają scenariusz, interakcję, druk i pilot live.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Działy" value={curriculum.sections.length} accent="brand" />
        <StatCard label="Tematy" value={curriculum.totalTopics} accent="neutral" />
        <StatCard label="Wykonane w klasie" value={completedCount} accent="learn" />
        <StatCard label="Interakcje ucznia" value={interactiveCount} hint="zweryfikowane modele" accent="assess" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {curriculum.sections.map((section) => (
          <ProgramSectionCard key={section.id} section={section} href={getSectionHref(section.id)} planEntries={planEntries} />
        ))}
      </div>
    </div>
  );
}

function ProgramSectionCard({ section, href, planEntries }: { section: ProgramSection; href: string; planEntries: TopicPlanEntryRow[] }) {
  const topicIds = new Set(section.topics.map((topic) => topic.id));
  const completed = planEntries.filter((entry) => topicIds.has(entry.topic_id) && entry.status === "completed").length;
  const scenarioCount = section.topics.filter((topic) => Boolean(getLessonPackageForTopic(topic.id))).length;

  return (
    <Link href={href} className="group block">
      <Card className="h-full transition group-hover:border-[var(--brand-600)] group-hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">Dział {section.number} · {section.hoursLabel}</p>
            <h2 className="mt-1 text-lg font-bold text-[var(--ink)]">{section.title}</h2>
          </div>
          <Badge tone={completed === section.topics.length ? "success" : "neutral"}>{completed}/{section.topics.length}</Badge>
        </div>
        <p className="mt-3 text-sm text-[var(--ink-muted)]">{section.goal}</p>
        <p className="mt-4 text-xs font-medium text-[var(--brand-600)]">{scenarioCount} scenariuszy · {completed} wykonanych →</p>
      </Card>
    </Link>
  );
}

export function ProgramTopicList({ section, programHomeHref, programLabel = "Plan klasy", planEntries = [] }: { section: ProgramSection; programHomeHref: string; programLabel?: string; planEntries?: TopicPlanEntryRow[] }) {
  const entriesByTopic = new Map(planEntries.map((entry) => [entry.topic_id, entry]));
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <Link href={programHomeHref} className="text-sm font-semibold text-[var(--brand-600)] hover:underline">← {programLabel}</Link>
        <h1 className="text-2xl font-bold text-[var(--ink)]">Dział {section.number}: {section.title}</h1>
        <p className="text-sm text-[var(--ink-muted)]">{section.goal}</p>
      </header>
      <div className="space-y-3">{section.topics.map((topic) => <ProgramTopicRow key={topic.id} topic={topic} planEntry={entriesByTopic.get(topic.id)} />)}</div>
    </div>
  );
}

function ProgramTopicRow({ topic, planEntry }: { topic: ProgramTopic; planEntry?: TopicPlanEntryRow }) {
  const lessonPublished = isTopicLessonPublished(topic.id);
  const lesson = getLessonPackageForTopic(topic.id);
  const capabilities = lesson ? getLessonCapabilities(lesson) : null;
  const displayStatus = lessonPublished ? "review" : topic.contentStatus;

  return (
    <Card muted className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[var(--ink-muted)]">{topic.id}</span>
          {topicStatusBadge(displayStatus)}
          {topic.kind === "exam" ? <Badge tone="assess">Sprawdzian pisemny</Badge> : null}
          {capabilities?.hasStudentInteraction ? <Badge tone="learn">Interakcja</Badge> : null}
          {capabilities?.hasPrintResources ? <Badge tone="assess">Druk</Badge> : null}
          {capabilities?.hasLivePilot ? <Badge tone="success">Pilot live</Badge> : null}
        </div>
        <h2 className="text-base font-bold text-[var(--ink)]">{topic.title}</h2>
        <p className="text-sm text-[var(--ink-muted)]"><span className="font-medium text-[var(--ink)]">Rdzeń:</span> {topic.coreLesson} · {topic.hoursLabel}</p>
        <p className="text-xs text-[var(--ink-muted)]">{topic.paperEvidence}</p>
        {planEntry ? <TopicPlanStatusControl entryId={planEntry.id} status={planEntry.status} /> : null}
      </div>
      <div className="shrink-0">
        {lessonPublished && lesson ? (
          <div className="flex flex-col gap-2 sm:items-end">
            <Link href={`/nauczyciel/lekcje/${lesson.id}/przygotuj`} className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Przygotuj materiał</Link>
            <Link href={`/nauczyciel/lekcje/${lesson.id}`} className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] bg-[var(--brand-600)] px-4 text-sm font-semibold text-white hover:opacity-90">Otwórz scenariusz</Link>
          </div>
        ) : <span className="inline-flex min-h-12 items-center rounded-[var(--radius-button)] border border-slate-200 bg-[var(--surface-muted)] px-4 text-sm font-semibold text-[var(--ink-muted)]">Weryfikacja techniczna</span>}
      </div>
    </Card>
  );
}
