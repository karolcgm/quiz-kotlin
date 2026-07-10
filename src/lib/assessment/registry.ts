import { M514_KARTKOWKA_BLUEPRINT } from "@/data/assessments/m514-kartkowka-blueprint";
import type { AssessmentBlueprint } from "@/types/assessmentBlueprint";

const BLUEPRINTS: Record<string, AssessmentBlueprint> = {
  [M514_KARTKOWKA_BLUEPRINT.id]: M514_KARTKOWKA_BLUEPRINT,
};

export function getBlueprintById(id: string): AssessmentBlueprint | undefined {
  return BLUEPRINTS[id];
}

export function getBlueprintsForLesson(lessonPackageId: string): AssessmentBlueprint[] {
  return Object.values(BLUEPRINTS).filter((bp) => bp.lessonPackageId === lessonPackageId);
}

export function listBlueprintSummaries(): { id: string; title: string; kind: string }[] {
  return Object.values(BLUEPRINTS).map((bp) => ({
    id: bp.id,
    title: bp.title,
    kind: bp.kind,
  }));
}
