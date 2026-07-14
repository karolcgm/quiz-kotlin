import Link from "next/link";
import { notFound } from "next/navigation";
import { TeacherSessionClient } from "@/components/live/TeacherSessionClient";
import { getLessonSessionBookwork, getLessonSessionExpiryAction, getLessonSessionTeacherView } from "@/lib/actions/lessonSessions";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ code?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { sessionId } = await params;
  const view = await getLessonSessionTeacherView(sessionId);
  return {
    title: view ? `Prowadzenie: ${view.lessonTitle}` : "Prowadzenie sesji",
  };
}

export default async function TeacherSessionConductPage({ params, searchParams }: PageProps) {
  await requireRole("teacher");
  const { sessionId } = await params;
  const { code } = await searchParams;
  const [view, expiresAt, bookwork] = await Promise.all([
    getLessonSessionTeacherView(sessionId),
    getLessonSessionExpiryAction(sessionId),
    getLessonSessionBookwork(sessionId),
  ]);

  if (!view) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/nauczyciel/lekcje/${view.lessonId}`}
        className="inline-block text-sm font-semibold text-indigo-600 hover:underline"
      >
        ← Pakiet lekcji
      </Link>
      <TeacherSessionClient
        sessionId={sessionId}
        initialView={view}
        initialJoinCode={code?.trim() || null}
        initialExpiresAt={expiresAt}
        initialBookwork={bookwork}
      />
    </div>
  );
}
