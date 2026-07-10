import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ProgramTopicList } from "@/components/program/ProgramViews";
import { getProgramSection } from "@/data/curriculum/pl-math-5-2026-classic";

interface PageProps {
  params: Promise<{ sectionId: string }>;
}

export default async function PublicProgramSectionPage({ params }: PageProps) {
  const { sectionId } = await params;
  const section = getProgramSection("pl-math-5-2026-classic", sectionId);

  if (!section) {
    notFound();
  }

  return (
    <PageShell className="pb-12">
      <ProgramTopicList section={section} programHomeHref="/program/klasa-5" />
    </PageShell>
  );
}
