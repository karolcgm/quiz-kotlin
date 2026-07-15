import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ANGLE_DRAWING_LESSON_SEEDS,
  analyzeAngleDrawing,
  createAngleDrawingGeometryState,
  createPublicAngleDrawingTask,
  desiredDrawingProtractorRotation,
  expectedSecondRayDirection,
  isAngleDrawingLessonSeed,
  moveDrawingProtractor,
  rotateDrawingProtractor,
  setAngleDrawingPhase,
  setAngleDrawingPointDirection,
  setDrawingProtractorScale,
} from "@/lib/math/geometry/angleDrawing";
import { pointById } from "@/lib/math/geometry";

describe("WP-S4-03B — matematyka rysowania kątów L2", () => {
  it("generuje deterministyczne warianty w odseparowanej przestrzeni seedów", () => {
    for (const activity of ["workflow", "variants", "peer-check", "independent"] as const) {
      for (const difficulty of ["support", "core", "challenge"] as const) {
        const seed = ANGLE_DRAWING_LESSON_SEEDS[activity][difficulty];
        const task = createPublicAngleDrawingTask(seed);
        expect(createPublicAngleDrawingTask(seed)).toEqual(task);
        expect(task).toMatchObject({ activity, difficulty, generatorId: "geometry-angle-drawing-l2-v1" });
        expect(task.invariants).toContain("ordered-base-mark-second-ray");
        expect(task.invariants).toContain("answer-spec-server-only");
        expect(task).not.toHaveProperty("answerSpec");
        expect(isAngleDrawingLessonSeed(seed)).toBe(true);
      }
    }
    expect(isAngleDrawingLessonSeed(430101)).toBe(false);
    expect(isAngleDrawingLessonSeed(431404)).toBe(false);
  });

  it("wylicza niezależnie kierunek BA, znacznik i drugie ramię z tolerancją 1°", () => {
    const seed = ANGLE_DRAWING_LESSON_SEEDS.workflow.support;
    const task = createPublicAngleDrawingTask(seed);
    let state = createAngleDrawingGeometryState(seed);
    const vertex = pointById(state.points, "vertex-b")!;
    state = setAngleDrawingPointDirection(state, "point-a", task.baseDirectionDegrees);
    state = setAngleDrawingPhase(state, "measure-mark");
    state = moveDrawingProtractor(state, vertex);
    state = rotateDrawingProtractor(state, desiredDrawingProtractorRotation(task));
    state = setDrawingProtractorScale(state, task.correctScale);
    state = setAngleDrawingPointDirection(state, "measure-mark", expectedSecondRayDirection(task));
    state = setAngleDrawingPhase(state, "second-ray");
    state = setAngleDrawingPointDirection(state, "point-c", expectedSecondRayDirection(task));
    state = setAngleDrawingPhase(state, "complete");

    expect(analyzeAngleDrawing(state)).toMatchObject({
      phase: "complete",
      baseDifferenceDegrees: 0,
      centerAligned: true,
      baselineAligned: true,
      scaleCorrect: true,
      markerDifferenceDegrees: 0,
      secondRayDifferenceDegrees: 0,
      constructionCorrect: true,
    });
  });

  it("różnicuje miary i nietypowe orientacje dla Start/Dalej/Wyzwanie", () => {
    const tasks = Object.values(ANGLE_DRAWING_LESSON_SEEDS.variants).map(createPublicAngleDrawingTask);
    expect(tasks.map((task) => task.targetDegrees)).toEqual([42, 97, 136]);
    expect(new Set(tasks.map((task) => task.baseDirectionDegrees))).toHaveLength(3);
    expect(tasks.every((task) => task.baseDirectionDegrees % 90 !== 0)).toBe(true);
    expect(new Set(tasks.map((task) => task.startSide))).toEqual(new Set(["left", "right"]));
  });

  it("utrzymuje klucz kolejności, miary, skali i tolerancji wyłącznie za granicą server-only", () => {
    const serverSource = readFileSync(new URL("./angleDrawing.server.ts", import.meta.url), "utf8");
    const publicSource = readFileSync(new URL("./angleDrawing.ts", import.meta.url), "utf8");
    expect(serverSource).toContain('import "server-only"');
    expect(serverSource).toContain("answerSpec");
    expect(serverSource).toContain('orderedSteps: ["base-ray", "measure-mark", "second-ray"]');
    expect(serverSource).toContain("anonymousPeerToleranceDegrees: 1");
    expect(publicSource).not.toContain("answerSpec:");
    expect(publicSource).not.toContain("expectedMarkerDegrees:");
  });
});
