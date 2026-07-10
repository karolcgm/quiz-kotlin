import { notFound } from "next/navigation";
import { ProgramTopicList } from "@/components/program/ProgramViews";
import { Card } from "@/components/ui/Card";
import { getProgramSection } from "@/data/curriculum/pl-math-5-2026-classic";
import { getActiveClassCurriculumPlan } from "@/lib/actions/curriculumPlans";
import { getTeacherContext } from "@/lib/teacher/context";

interface PageProps { params: Promise<{ curriculumId: string; sectionId: string }>; }

export async function generateMetadata({ params }: PageProps) {
  const { curriculumId, sectionId } = await params;
  const section = getProgramSection(curriculumId, sectionId);
  return { title: section ? `Dział ${section.number}: ${section.title}` : "Dział planu" };
}

export default async function TeacherProgramSectionPage({ params }: PageProps) {
  const { curriculumId, sectionId } = await params;
  const section = getProgramSection(curriculumId, sectionId);
  if (!section) notFound();
  const context = await getTeacherContext();
  if (context.selected.mode !== "class") return <Card><h1 className="text-2xl font-bold text-slate-950">Wybierz klasę</h1><p className="mt-2 text-slate-600">Nie można oznaczać tematów bez kontekstu klasy.</p></Card>;
  const activePlan = await getActiveClassCurriculumPlan(context.selected.class.id);
  if (!activePlan) return <Card><h1 className="text-2xl font-bold text-slate-950">Brak aktywnego planu</h1></Card>;
  return <ProgramTopicList section={section} programHomeHref={`/nauczyciel/program/${curriculumId}`} planEntries={activePlan.entries} />;
}
