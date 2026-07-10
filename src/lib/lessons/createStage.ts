import type { LessonStage, QuestionReference } from "@/types/lessonPackage";

type StageInput = Omit<
  LessonStage,
  "questions" | "discussionPrompts" | "accessibilityNotes" | "revealSteps"
> &
  Partial<Pick<LessonStage, "questions" | "discussionPrompts" | "accessibilityNotes" | "revealSteps">>;

const DEFAULT_ACCESSIBILITY = [
  "Duży kontrast i czytelna czcionka na tablicy.",
  "Cele dotykowe min. 48×48 px na tablecie.",
];

export function createLessonStage(partial: StageInput, questions: QuestionReference[] = []): LessonStage {
  return {
    questions,
    discussionPrompts: [],
    accessibilityNotes: DEFAULT_ACCESSIBILITY,
    revealSteps: [{ id: "start", label: "Start" }],
    ...partial,
  };
}
