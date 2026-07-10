import { ProgramOverview } from "@/components/program/ProgramViews";
import { plMath5Classic2026 } from "@/data/curriculum/pl-math-5-2026-classic";

export const metadata = {
  title: "Program klasy V",
};

export default function TeacherProgramPage() {
  return <ProgramOverview curriculum={plMath5Classic2026} programHomeHref="/nauczyciel/program" getSectionHref={(sectionId) => `/nauczyciel/program/pl-math-5-2026-classic/dzial/${sectionId}`} />;
}
