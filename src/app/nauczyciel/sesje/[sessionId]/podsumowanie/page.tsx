import Link from "next/link";
import { notFound } from "next/navigation";
import { TeacherSessionSummaryPanel } from "@/components/live/TeacherSessionSummaryPanel";
import { getLessonSessionTeacherResults, getLessonSessionTeacherSummary, getLessonSessionTeacherView } from "@/lib/actions/lessonSessions";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { sessionId } = await params;
  const summary = await getLessonSessionTeacherSummary(sessionId);
  return {
    title: summary ? `Podsumowanie: ${summary.lessonTitle}` : "Podsumowanie sesji",
  };
}

export default async function TeacherSessionSummaryPage({ params }: PageProps) {
  await requireRole("teacher");
  const { sessionId } = await params;
  const [view, summary, studentResults] = await Promise.all([
    getLessonSessionTeacherView(sessionId),
    getLessonSessionTeacherSummary(sessionId),
    getLessonSessionTeacherResults(sessionId),
  ]);

  if (!view) {
    notFound();
  }

  if (!summary) {
    return (
      <div className="space-y-4">
        <Link
          href={`/nauczyciel/sesje/${sessionId}/prowadz`}
          className="inline-block text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← Pulpit sesji
        </Link>
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Podsumowanie będzie dostępne po zakończeniu sesji.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/nauczyciel/sesje/${sessionId}/prowadz`}
        className="inline-block text-sm font-semibold text-indigo-600 hover:underline"
      >
        ← Pulpit sesji
      </Link>
      <TeacherSessionSummaryPanel summary={summary} studentResults={studentResults} />
    </div>
  );
}
