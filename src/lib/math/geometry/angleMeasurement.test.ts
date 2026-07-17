import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ANGLE_MEASUREMENT_LESSON_SEEDS,
  ANGLE_MEASUREMENT_BASELINE_SNAP_DEGREES,
  ANGLE_MEASUREMENT_CENTER_SNAP_PX,
  analyzeProtractorPlacement,
  createAngleMeasurementGeometryState,
  createPublicAngleMeasurementTask,
  desiredProtractorRotationDegrees,
  isAngleMeasurementLessonSeed,
  measurementAngleDegrees,
  moveMeasurementProtractor,
  readingForSelectedScale,
  rotateMeasurementProtractorTo,
  setMeasurementProtractorScale,
  snapMeasurementProtractorAfterDrop,
} from "@/lib/math/geometry/angleMeasurement";
import { pointById } from "@/lib/math/geometry";

describe("WP-S4-03A — matematyka pomiaru kątów L1", () => {
  it("generuje deterministyczne konfiguracje Start/Dalej/Wyzwanie bez answerSpec", () => {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      const seed = ANGLE_MEASUREMENT_LESSON_SEEDS.independent[difficulty];
      const first = createPublicAngleMeasurementTask(seed);
      expect(createPublicAngleMeasurementTask(seed)).toEqual(first);
      expect(first.difficulty).toBe(difficulty);
      expect(first.generatorId).toBe("geometry-angle-measurement-l1-v1");
      expect(first.invariants).toContain("answer-spec-server-only");
      expect(first).not.toHaveProperty("answerSpec");
      expect(isAngleMeasurementLessonSeed(seed)).toBe(true);
    }
    expect(isAngleMeasurementLessonSeed(430404)).toBe(false);
    expect(isAngleMeasurementLessonSeed(420601)).toBe(false);
  });

  it("wylicza miarę z geometrii, a nie z wpisanej odpowiedzi", () => {
    for (const activity of ["setup", "scale", "series", "independent"] as const) {
      for (const difficulty of ["support", "core", "challenge"] as const) {
        const seed = ANGLE_MEASUREMENT_LESSON_SEEDS[activity][difficulty];
        const task = createPublicAngleMeasurementTask(seed);
        expect(measurementAngleDegrees(createAngleMeasurementGeometryState(seed))).toBeCloseTo(task.angleDegrees, 8);
      }
    }
  });

  it("uznaje gotowość dopiero po ustawieniu środka ORAZ linii bazowej", () => {
    const seed = ANGLE_MEASUREMENT_LESSON_SEEDS.setup.support;
    const task = createPublicAngleMeasurementTask(seed);
    const initial = createAngleMeasurementGeometryState(seed);
    expect(analyzeProtractorPlacement(initial).ready).toBe(false);

    const vertex = pointById(initial.points, "vertex-b")!;
    const centerOnly = moveMeasurementProtractor(initial, vertex);
    expect(analyzeProtractorPlacement(centerOnly)).toMatchObject({ centerAligned: true, baselineAligned: false, ready: false });

    const ready = rotateMeasurementProtractorTo(centerOnly, desiredProtractorRotationDegrees(task));
    expect(analyzeProtractorPlacement(ready)).toMatchObject({ centerAligned: true, baselineAligned: true, ready: true });
  });

  it("po upuszczeniu niezależnie snapuje środek i bazę oraz pozwala oderwać kątomierz", () => {
    const seed = ANGLE_MEASUREMENT_LESSON_SEEDS.setup.support;
    const task = createPublicAngleMeasurementTask(seed);
    const initial = createAngleMeasurementGeometryState(seed);
    const vertex = pointById(initial.points, "vertex-b")!;
    const desiredRotation = desiredProtractorRotationDegrees(task);
    const closeToTargets = rotateMeasurementProtractorTo(
      moveMeasurementProtractor(initial, {
        x: vertex.x + ANGLE_MEASUREMENT_CENTER_SNAP_PX - 1,
        y: vertex.y,
      }),
      desiredRotation + ANGLE_MEASUREMENT_BASELINE_SNAP_DEGREES,
    );

    const snapped = snapMeasurementProtractorAfterDrop(closeToTargets);
    expect(snapped).toMatchObject({ centerSnapped: true, baselineSnapped: true });
    expect(snapped.state.protractor.center).toEqual({ x: vertex.x, y: vertex.y });
    expect(snapped.state.protractor.rotationDegrees).toBe(desiredRotation);
    expect(analyzeProtractorPlacement(snapped.state).ready).toBe(true);

    const pulledAway = rotateMeasurementProtractorTo(
      moveMeasurementProtractor(snapped.state, {
        x: vertex.x + ANGLE_MEASUREMENT_CENTER_SNAP_PX + 1,
        y: vertex.y,
      }),
      desiredRotation + ANGLE_MEASUREMENT_BASELINE_SNAP_DEGREES + 1,
    );
    const releasedAway = snapMeasurementProtractorAfterDrop(pulledAway);
    expect(releasedAway).toMatchObject({ centerSnapped: false, baselineSnapped: false });
    expect(releasedAway.state.protractor.center).toEqual(pulledAway.protractor.center);
    expect(releasedAway.state.protractor.rotationDegrees).toBe(pulledAway.protractor.rotationDegrees);
    expect(analyzeProtractorPlacement(releasedAway.state).ready).toBe(false);
  });

  it("pokazuje odczyt dopełniający po wyborze niewłaściwej skali", () => {
    const seed = ANGLE_MEASUREMENT_LESSON_SEEDS.scale.support;
    const state = createAngleMeasurementGeometryState(seed);
    const task = createPublicAngleMeasurementTask(seed);
    const correct = setMeasurementProtractorScale(state, task.correctScale);
    const wrong = setMeasurementProtractorScale(state, task.correctScale === "outer" ? "inner" : "outer");
    expect(readingForSelectedScale(correct)).toBe(task.angleDegrees);
    expect(readingForSelectedScale(wrong)).toBe(180 - task.angleDegrees);
  });

  it("ma trzy nietypowe orientacje i nie przestawia narzędzia przy zmianie serii", () => {
    const seeds = Object.values(ANGLE_MEASUREMENT_LESSON_SEEDS.series);
    const directions = seeds.map((seed) => createPublicAngleMeasurementTask(seed).baseDirectionDegrees);
    expect(directions.every((direction) => direction % 90 !== 0)).toBe(true);
    expect(new Set(directions)).toHaveLength(3);

    const first = createAngleMeasurementGeometryState(seeds[0]);
    const preserved = {
      ...first.protractor,
      center: { x: 111, y: 222 },
      rotationDegrees: 17,
      scale: "inner" as const,
    };
    const second = createAngleMeasurementGeometryState(seeds[1], "practice", preserved);
    expect(second.protractor).toEqual(preserved);
    expect(analyzeProtractorPlacement(second).ready).toBe(false);
  });

  it("utrzymuje prywatną rubrykę za granicą server-only", () => {
    const serverSource = readFileSync(new URL("./angleMeasurement.server.ts", import.meta.url), "utf8");
    const publicSource = readFileSync(new URL("./angleMeasurement.ts", import.meta.url), "utf8");
    expect(serverSource).toContain('import "server-only"');
    expect(serverSource).toContain("answerSpec");
    expect(serverSource).toContain("readinessRequires");
    expect(publicSource).not.toContain("expectedDegrees:");
    expect(publicSource).not.toContain("answerSpec:");
  });
});
