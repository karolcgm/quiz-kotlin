// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import type { LessonStage } from "@/types/lessonPackage";
import type { LessonSessionStageSnapshot } from "@/types/lessonSession";

afterEach(cleanup);

const stage: LessonStage = {
  id: "geometry-foundation",
  kind: "explore",
  title: "Laboratorium geometrii",
  studentInstruction: "Przesuwaj wierzchołki.",
  teacherInstruction: "Pokaż zmianę własności.",
  estimatedMinutes: 8,
  board: { layout: "model", headline: "Geometria", modelId: "geometry-lab", modelSeed: 11 },
  student: { activityMode: "practice", instruction: "Zbuduj figurę.", modelId: "geometry-lab", modelSeed: 11 },
  revealSteps: [],
  questions: [],
  discussionPrompts: [],
  accessibilityNotes: ["Przeciąganie ma alternatywę współrzędnych."],
};

describe("renderery wspólnego modelu geometrycznego", () => {
  it("udostępnia geometry-lab na tablicy i tablecie przez LessonStageView", () => {
    const { container, rerender } = render(<LessonStageView lessonId="lesson" stage={stage} channel="board" revealIndex={0} />);
    expect(container.querySelector('[data-geometry-lab][data-mode="demo"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId="lesson" stage={stage} channel="student" revealIndex={0} />);
    expect(container.querySelector('[data-geometry-lab][data-mode="practice"]')).toBeInTheDocument();
  });

  it("udostępnia model na tablicy live i respektuje readOnly", () => {
    const snapshot: LessonSessionStageSnapshot = {
      id: "geometry-foundation",
      kind: "explore",
      title: "Laboratorium geometrii",
      estimatedMinutes: 8,
      boardHeadline: "Geometria",
      modelId: "geometry-lab",
      modelSeed: 11,
      questions: [],
    };
    const { container } = render(<BoardStageDisplay stage={snapshot} stageIndex={0} stageCount={1} solutionRevealed={false} interactive={false} />);
    expect(container.querySelector('[data-geometry-lab][data-mode="demo"]')).toBeInTheDocument();
    expect(container.querySelector("[data-geometry-handle]")).toBeNull();
  });
});
