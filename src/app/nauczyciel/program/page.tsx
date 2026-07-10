import { CreateClassPlanButton } from "@/components/program/CreateClassPlanButton";
import { ProgramOverview } from "@/components/program/ProgramViews";
import { Card } from "@/components/ui/Card";
import { plMath5Classic2026 } from "@/data/curriculum/pl-math-5-2026-classic";
import { getActiveClassCurriculumPlan } from "@/lib/actions/curriculumPlans";
import { getTeacherContext } from "@/lib/teacher/context";

export const metadata = { title: "Plan klasy" };

export default async function TeacherProgramPage() {
  const context = await getTeacherContext();
  if (context.selected.mode !== "class") {
    return <Card><h1 className="text-2xl font-bold text-slate-950">Wybierz klasę</h1><p className="mt-2 text-slate-600">Otwórz przełącznik „Kontekst pracy” u góry, aby zobaczyć plan, wykonane tematy i uczniów konkretnej klasy.</p></Card>;
  }

  const activePlan = await getActiveClassCurriculumPlan(context.selected.class.id);
  if (!activePlan) {
    return <Card><h1 className="text-2xl font-bold text-slate-950">Plan dla {context.selected.class.name}</h1><p className="mt-2 text-slate-600">Ta klasa nie ma jeszcze planu klasy V. Utworzenie planu nie zmienia danych innych klas.</p><CreateClassPlanButton classId={context.selected.class.id} /></Card>;
  }

  return <ProgramOverview curriculum={plMath5Classic2026} programHomeHref="/nauczyciel/program" getSectionHref={(sectionId) => `/nauczyciel/program/pl-math-5-2026-classic/dzial/${sectionId}`} planEntries={activePlan.entries} classLabel={`${context.selected.class.schoolName} · ${context.selected.class.name} / ${context.selected.class.groupName}`} />;
}
