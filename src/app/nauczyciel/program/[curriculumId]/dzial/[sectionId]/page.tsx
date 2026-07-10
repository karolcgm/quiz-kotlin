import { notFound } from "next/navigation";
import { ProgramTopicList } from "@/components/program/ProgramViews";
import { getProgramSection } from "@/data/curriculum/pl-math-5-2026-classic";

interface PageProps {
  params: Promise<{ curriculumId: string; sectionId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { curriculumId, sectionId } = await params;
  const section = getProgramSection(curriculumId, sectionId);
  return {
    title: section ? `Dział ${section.number}: ${section.title}` : "Dział programu",
  };
}

export default async function TeacherProgramSectionPage({ params }: PageProps) {
  const { sectionId } = await params;
  const section = getProgramSection("pl-math-5-2026-classic", sectionId);

  if (!section) {
    notFound();
  }

  return <ProgramTopicList section={section} programHomeHref="/nauczyciel/program" />;
}
