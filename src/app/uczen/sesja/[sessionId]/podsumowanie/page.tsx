import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentSessionSummaryPanel } from "@/components/live/StudentSessionSummaryPanel";
import { LiveUnderstandingCheck } from "@/components/live/LiveUnderstandingCheck";
import { getLessonSessionStudentSummary, getMyLiveLessonUnderstanding } from "@/lib/actions/lessonSessions";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { sessionId } = await params;
  const summary = await getLessonSessionStudentSummary(sessionId);
  return {
    title: summary ? `Podsumowanie: ${summary.lessonTitle}` : "Podsumowanie lekcji",
  };
}

export default async function StudentSessionSummaryPage({ params }: PageProps) {
  await requireRole("student");
  const { sessionId } = await params;
  const [summary, understanding] = await Promise.all([
    getLessonSessionStudentSummary(sessionId),
    getMyLiveLessonUnderstanding(sessionId),
  ]);

  if (!summary) {
    notFound();
  }

  if (!understanding) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 pb-8">
        <LiveUnderstandingCheck sessionId={sessionId} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <Link
        href={`/uczen/sesja/${sessionId}`}
        className="inline-block text-sm font-semibold text-indigo-600 hover:underline"
      >
        ← Sesja
      </Link>
      <StudentSessionSummaryPanel summary={summary} />
      <div className="text-center">
        <Link
          href="/uczen"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
        >
          Wróć do panelu
        </Link>
      </div>
    </div>
  );
}
