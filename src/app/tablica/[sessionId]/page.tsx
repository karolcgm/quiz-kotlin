import { notFound } from "next/navigation";
import { BoardSessionClient } from "@/components/live/BoardSessionClient";
import { getLessonSessionBoardView } from "@/lib/actions/lessonSessions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ code?: string; presentation?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { sessionId } = await params;
  const view = await getLessonSessionBoardView(sessionId);
  return {
    title: view ? `Tablica · ${view.lessonTitle}` : "Tablica lekcji",
  };
}

export default async function BoardSessionPage({ params, searchParams }: PageProps) {
  const { sessionId } = await params;
  const { code, presentation } = await searchParams;
  const view = await getLessonSessionBoardView(sessionId);

  if (!view) {
    notFound();
  }

  return (
    <BoardSessionClient
      sessionId={sessionId}
      initialView={view}
      joinCode={code?.trim() || null}
      startPresentation={presentation === "1"}
    />
  );
}
