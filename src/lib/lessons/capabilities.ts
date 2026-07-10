import { getBlueprintsForLesson } from "@/lib/assessment/registry";
import type { LessonPackage } from "@/types/lessonPackage";

export interface LessonCapabilities {
  hasNarrative: boolean;
  hasStudentInteraction: boolean;
  hasPrintResources: boolean;
  hasAssessmentBlueprint: boolean;
  hasLivePilot: boolean;
}

export function getLessonCapabilities(lesson: LessonPackage): LessonCapabilities {
  const hasStudentInteraction = lesson.stages.some(
    (stage) =>
      stage.student?.activityMode !== undefined &&
      stage.student.activityMode !== "view" &&
      stage.student.modelId !== undefined,
  );

  return {
    hasNarrative: lesson.stages.length > 0,
    hasStudentInteraction,
    hasPrintResources: lesson.printableResourceIds.length > 0,
    hasAssessmentBlueprint: getBlueprintsForLesson(lesson.id).length > 0,
    hasLivePilot: lesson.stages.some((stage) => stage.live?.enabled === true),
  };
}
