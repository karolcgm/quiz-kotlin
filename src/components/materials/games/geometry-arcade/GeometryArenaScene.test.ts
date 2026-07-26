import { describe, expect, it } from "vitest";
import { Euler, Quaternion, Vector3 } from "three";
import {
  ARENA_CALIBRATIONS,
  worldToModelPoint,
  type GeometryArenaVariant,
} from "./GeometryArenaScene";

const VARIANTS: GeometryArenaVariant[] = [
  "laser",
  "polygon",
  "triangle",
  "quadrilateral",
  "symmetry",
];

describe("kalibracja plansz geometrii 3D", () => {
  it("utrzymuje podniesioną kamerę skierowaną na środek planszy", () => {
    for (const variant of VARIANTS) {
      const calibration = ARENA_CALIBRATIONS[variant];
      const vertical = calibration.camera[1] - calibration.target[1];
      const horizontal = Math.hypot(
        calibration.camera[0] - calibration.target[0],
        calibration.camera[2] - calibration.target[2],
      );
      const elevation = Math.atan2(vertical, horizontal) * 180 / Math.PI;

      expect(elevation).toBeGreaterThanOrEqual(38);
      expect(elevation).toBeLessThanOrEqual(50);
      expect(calibration.fov).toBeGreaterThanOrEqual(40);
      expect(calibration.fov).toBeLessThanOrEqual(45);
    }
  });

  it("ma cztery osobne punkty interakcji wewnątrz każdej planszy", () => {
    for (const variant of VARIANTS) {
      const { portals } = ARENA_CALIBRATIONS[variant];
      expect(portals).toHaveLength(4);
      expect(new Set(portals.map(([x, , z]) => `${x}:${z}`))).toHaveLength(4);
      for (const [x, , z] of portals) {
        expect(Math.abs(x)).toBeLessThanOrEqual(3.5);
        expect(Math.abs(z)).toBeLessThanOrEqual(2.4);
      }
    }
  });

  it("zachowuje koniec lasera po transformacji modelu", () => {
    const calibration = ARENA_CALIBRATIONS.laser;

    for (const portal of calibration.portals) {
      const local = new Vector3(...worldToModelPoint(portal, calibration));
      const restored = local
        .multiplyScalar(calibration.modelScale)
        .applyQuaternion(new Quaternion().setFromEuler(new Euler(...calibration.modelRotation)))
        .add(new Vector3(...calibration.modelPosition));

      expect(restored.distanceTo(new Vector3(...portal))).toBeLessThan(0.000001);
    }
  });
});
