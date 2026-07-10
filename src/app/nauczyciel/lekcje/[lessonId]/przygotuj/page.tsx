import { notFound } from "next/navigation";
import { LessonPackagePlayer } from "@/components/lessons/LessonPackagePlayer";
import { getLessonPackageById } from "@/data/lessons/registry";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonPackageById(lessonId);
  return { title: lesson ? `Przygotuj: ${lesson.title}` : "Przygotowanie lekcji" };
}

export default async function TeacherLessonPrepPage({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonPackageById(lessonId);

  if (!lesson || lesson.status !== "published") {
    notFound();
  }

  return <LessonPackagePlayer lesson={lesson} mode="prep" />;
}
