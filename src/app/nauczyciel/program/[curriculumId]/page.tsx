import { notFound } from "next/navigation";
import { ProgramOverview } from "@/components/program/ProgramViews";
import { getProgramCurriculum } from "@/data/curriculum/pl-math-5-2026-classic";

interface PageProps {
  params: Promise<{ curriculumId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { curriculumId } = await params;
  const curriculum = getProgramCurriculum(curriculumId);
  return { title: curriculum?.title ?? "Program" };
}

export default async function TeacherProgramDetailPage({ params }: PageProps) {
  const { curriculumId } = await params;
  const curriculum = getProgramCurriculum(curriculumId);

  if (!curriculum) {
    notFound();
  }

  return (
    <ProgramOverview
      curriculum={curriculum}
      programHomeHref="/nauczyciel/program"
      getSectionHref={(sectionId) => `/nauczyciel/program/${curriculumId}/dzial/${sectionId}`}
    />
  );
}
