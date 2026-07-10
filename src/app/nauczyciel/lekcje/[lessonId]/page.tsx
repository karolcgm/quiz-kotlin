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
  return { title: lesson ? lesson.title : "Lekcja" };
}

export default async function TeacherLessonPlayPage({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonPackageById(lessonId);

  if (!lesson || lesson.status !== "published") {
    notFound();
  }

  return <LessonPackagePlayer lesson={lesson} mode="play" />;
}
