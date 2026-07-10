import { PageShell } from "@/components/layout/PageShell";
import { ProgramOverview } from "@/components/program/ProgramViews";
import { plMath5Classic2026 } from "@/data/curriculum/pl-math-5-2026-classic";

export const metadata = {
  title: "Program matematyki — klasa V",
  description: "Publiczny podgląd planu realizacji matematyki w klasie 5.",
};

export default function PublicGrade5ProgramPage() {
  return (
    <PageShell className="pb-12">
      <ProgramOverview
        curriculum={plMath5Classic2026}
        programHomeHref="/program/klasa-5"
        getSectionHref={(sectionId) => `/program/klasa-5/dzial/${sectionId}`}
      />
    </PageShell>
  );
}
