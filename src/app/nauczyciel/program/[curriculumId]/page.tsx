import { notFound } from "next/navigation";
import { CreateClassPlanButton } from "@/components/program/CreateClassPlanButton";
import { ProgramOverview } from "@/components/program/ProgramViews";
import { Card } from "@/components/ui/Card";
import { getProgramCurriculum } from "@/data/curriculum/pl-math-5-2026-classic";
import { getActiveClassCurriculumPlan } from "@/lib/actions/curriculumPlans";
import { getTeacherContext } from "@/lib/teacher/context";

interface PageProps { params: Promise<{ curriculumId: string }>; }

export async function generateMetadata({ params }: PageProps) {
  const { curriculumId } = await params;
  const curriculum = getProgramCurriculum(curriculumId);
  return { title: curriculum?.title ?? "Plan" };
}

export default async function TeacherProgramDetailPage({ params }: PageProps) {
  const { curriculumId } = await params;
  const curriculum = getProgramCurriculum(curriculumId);
  if (!curriculum) notFound();
  const context = await getTeacherContext();
  if (context.selected.mode !== "class") return <Card><h1 className="text-2xl font-bold text-slate-950">Wybierz klasę</h1><p className="mt-2 text-slate-600">Plan jest zawsze prowadzony osobno dla konkretnej klasy.</p></Card>;
  const activePlan = await getActiveClassCurriculumPlan(context.selected.class.id);
  if (!activePlan) return <Card><h1 className="text-2xl font-bold text-slate-950">Brak planu klasy</h1><CreateClassPlanButton classId={context.selected.class.id} /></Card>;
  return <ProgramOverview curriculum={curriculum} programHomeHref="/nauczyciel/program" getSectionHref={(sectionId) => `/nauczyciel/program/${curriculumId}/dzial/${sectionId}`} planEntries={activePlan.entries} classLabel={`${context.selected.class.name} / ${context.selected.class.groupName}`} />;
}
