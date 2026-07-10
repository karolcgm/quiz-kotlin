import { redirect } from "next/navigation";
import { StudentSessionClient } from "@/components/live/StudentSessionClient";
import { getLessonSessionStudentView } from "@/lib/actions/lessonSessions";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata() {
  return { title: "Lekcja na żywo" };
}

export default async function StudentSessionPage({ params }: PageProps) {
  await requireRole("student");
  const { sessionId } = await params;
  const view = await getLessonSessionStudentView(sessionId);

  if (!view) {
    redirect(`/dolacz/${sessionId}`);
  }

  if (view.status === "ended") {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-2 py-6">
        <StudentSessionClient sessionId={sessionId} initialView={view} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-1 py-4 sm:px-2">
      <StudentSessionClient sessionId={sessionId} initialView={view} />
    </div>
  );
}
