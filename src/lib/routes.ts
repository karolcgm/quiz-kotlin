import { grades } from "@/data/grades";
import { mathCurriculum } from "@/data/mathCurriculum";
import { isCatalogVisible } from "@/data/publicSimulations";
import { simulations } from "@/data/simulations";
import type { CurriculumSection, GradeLevel } from "@/types/curriculum";
import type { Simulation, SimulationStatus, SimulationVisualKind } from "@/types/simulation";

export type GradeBand = "1-3" | "4-6" | "7-8" | "egzamin" | "demo";

export interface SimulationFilters {
  grade?: GradeLevel;
  gradeBand?: GradeBand;
  sectionId?: string;
  status?: SimulationStatus;
  visualKind?: SimulationVisualKind;
  query?: string;
}

export function matchesGradeBand(simulation: Simulation, band: GradeBand): boolean {
  switch (band) {
    case "1-3":
      return simulation.grades.some((grade) => grade >= 1 && grade <= 3);
    case "4-6":
      return simulation.grades.some((grade) => grade >= 4 && grade <= 6);
    case "7-8":
      return simulation.grades.some((grade) => grade >= 7 && grade <= 8);
    case "egzamin":
      return (
        simulation.grades.includes(8) ||
        simulation.ageGroup === "exam" ||
        simulation.tags.some((tag) => /egzamin|ósmoklas/i.test(tag))
      );
    case "demo":
      return (
        simulation.featured === true ||
        simulation.status === "ready" ||
        simulation.status === "mvp"
      );
    default:
      return true;
  }
}

export function getGradeById(id: number) {
  return grades.find((grade) => grade.id === id);
}

export function isValidGrade(id: number): id is GradeLevel {
  return grades.some((grade) => grade.id === id);
}

export function getSimulationBySlug(slug: string): Simulation | undefined {
  return simulations.find((simulation) => simulation.slug === slug);
}

export function getSimulationsByGrade(gradeId: GradeLevel): Simulation[] {
  return simulations.filter(
    (simulation) => simulation.grades.includes(gradeId) && isCatalogVisible(simulation),
  );
}

export function getSectionsForGrade(gradeId: GradeLevel): CurriculumSection[] {
  return mathCurriculum.filter((section) => section.grade === gradeId);
}

export function getSectionById(sectionId: string): CurriculumSection | undefined {
  return mathCurriculum.find((section) => section.id === sectionId);
}

export function getSimulationsBySection(sectionId: string): Simulation[] {
  return simulations.filter(
    (simulation) => simulation.sectionId === sectionId && isCatalogVisible(simulation),
  );
}

export function filterSimulations(filters: SimulationFilters): Simulation[] {
  const normalizedQuery = filters.query?.trim().toLowerCase();

  return simulations.filter((simulation) => {
    if (!isCatalogVisible(simulation)) {
      return false;
    }

    if (filters.gradeBand && !matchesGradeBand(simulation, filters.gradeBand)) {
      return false;
    }

    if (filters.grade && !simulation.grades.includes(filters.grade)) {
      return false;
    }

    if (filters.sectionId && simulation.sectionId !== filters.sectionId) {
      return false;
    }

    if (filters.status && simulation.status !== filters.status) {
      return false;
    }

    if (filters.visualKind && simulation.visualKind !== filters.visualKind) {
      return false;
    }

    if (normalizedQuery) {
      const searchableText = [
        simulation.title,
        simulation.shortDescription,
        simulation.teacherHint,
        ...simulation.tags,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}

export function getSimulationCountsByGrade(): Record<GradeLevel, number> {
  return grades.reduce(
    (counts, grade) => ({
      ...counts,
      [grade.id]: getSimulationsByGrade(grade.id).length,
    }),
    {} as Record<GradeLevel, number>,
  );
}

export function getSimulationCountsBySection(): Record<string, number> {
  return mathCurriculum.reduce<Record<string, number>>((counts, section) => {
    counts[section.id] = getSimulationsBySection(section.id).length;
    return counts;
  }, {});
}

export function getReadySimulations(): Simulation[] {
  return getPublicSimulations().filter(
    (simulation) => simulation.status === "ready" || simulation.status === "mvp",
  );
}

function getPublicSimulations(): Simulation[] {
  return simulations.filter(isCatalogVisible);
}

export function getFeaturedSimulations(limit = 4): Simulation[] {
  const featured = getPublicSimulations().filter((simulation) => simulation.featured);
  const source = featured.length > 0 ? featured : getReadySimulations();
  return source.slice(0, limit);
}
