import { CreateClassPlanButton } from "@/components/program/CreateClassPlanButton";
import { ProgramOverview } from "@/components/program/ProgramViews";
import { Card } from "@/components/ui/Card";
import { getProgramCurriculumForGrade } from "@/data/curriculum/pl-math-5-2026-classic";
import { getActiveClassCurriculumPlan } from "@/lib/actions/curriculumPlans";
import { getTeacherContext } from "@/lib/teacher/context";

export const metadata = { title: "Plan klasy" };

export default async function TeacherProgramPage() {
  const context = await getTeacherContext();
  if (context.selected.mode !== "class") {
    return <Card><h1 className="text-2xl font-bold text-slate-950">Wybierz klasę</h1><p className="mt-2 text-slate-600">Otwórz przełącznik „Kontekst pracy” u góry, aby zobaczyć plan, wykonane tematy i uczniów konkretnej klasy.</p></Card>;
  }

  const curriculum = getProgramCurriculumForGrade(context.selected.class.grade);
  const gradeLabel = `klasy ${context.selected.class.grade}`;
  if (!curriculum) {
    return <Card><h1 className="text-2xl font-bold text-slate-950">Plan dla {context.selected.class.name}</h1><p className="mt-2 text-slate-600">Plan {gradeLabel} jest jeszcze przygotowywany.</p></Card>;
  }

  const activePlan = await getActiveClassCurriculumPlan(context.selected.class.id);
  if (!activePlan) {
    return <Card><h1 className="text-2xl font-bold text-slate-950">Plan dla {context.selected.class.name}</h1><p className="mt-2 text-slate-600">Ta klasa nie ma jeszcze planu {gradeLabel}. Utworzenie planu nie zmienia danych innych klas.</p><CreateClassPlanButton classId={context.selected.class.id} /></Card>;
  }

  if (activePlan.plan.curriculum_id !== curriculum.id || activePlan.plan.curriculum_version !== curriculum.version) {
    return <Card><h1 className="text-2xl font-bold text-slate-950">Plan dla {context.selected.class.name}</h1><p className="mt-2 text-slate-600">Wykryliśmy plan innej klasy. Zastąp go właściwym planem {gradeLabel}.</p><CreateClassPlanButton classId={context.selected.class.id} label={`Napraw plan ${gradeLabel}`} /></Card>;
  }

  return <ProgramOverview curriculum={curriculum} programHomeHref="/nauczyciel/program" getSectionHref={(sectionId) => `/nauczyciel/program/${curriculum.id}/dzial/${sectionId}`} planEntries={activePlan.entries} classLabel={`${context.selected.class.schoolName} · ${context.selected.class.name} / ${context.selected.class.groupName}`} />;
}
