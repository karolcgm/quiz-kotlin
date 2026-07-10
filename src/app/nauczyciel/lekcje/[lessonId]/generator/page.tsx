import { notFound } from "next/navigation";
import { AssessmentGeneratorPanel } from "@/components/assessment/AssessmentGeneratorPanel";
import { getBlueprintsForLesson } from "@/lib/assessment/registry";
import { assertPilotParity } from "@/lib/assessment/validateVersionParity";
import { getLessonPackageById } from "@/data/lessons/registry";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ blueprint?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonPackageById(lessonId);
  return { title: lesson ? `Generator: ${lesson.title}` : "Generator A/B" };
}

export default async function TeacherLessonGeneratorPage({ params, searchParams }: PageProps) {
  const { lessonId } = await params;
  const { blueprint: blueprintId } = await searchParams;
  const lesson = getLessonPackageById(lessonId);

  if (!lesson || lesson.status !== "published") {
    notFound();
  }

  const blueprints = getBlueprintsForLesson(lessonId);
  if (blueprints.length === 0) {
    notFound();
  }

  const blueprint = blueprintId
    ? blueprints.find((bp) => bp.id === blueprintId) ?? blueprints[0]
    : blueprints[0];

  if (!blueprint) {
    notFound();
  }

  const parity = assertPilotParity(blueprint);

  return (
    <AssessmentGeneratorPanel
      lessonId={lessonId}
      blueprint={blueprint}
      parityOk={parity.ok}
      parityErrors={parity.errors}
    />
  );
}
