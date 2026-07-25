"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { OrthographicCamera } from "three";

const AXIS_START = -6;
const AXIS_LENGTH = 12;
const VIEW_WIDTH = 14;
const MAX_VALUE = 3;
const TICK_COUNT = 24;

export interface FractionMatchAxisPoint {
  id: string;
  position: number;
}

export function fractionAxisWorldX(position: number): number {
  return AXIS_START + position / MAX_VALUE * AXIS_LENGTH;
}

export function fractionAxisScreenPercent(position: number): number {
  return (fractionAxisWorldX(position) + VIEW_WIDTH / 2) / VIEW_WIDTH * 100;
}

function ResponsiveAxisCamera() {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);

  useEffect(() => {
    if (!(camera instanceof OrthographicCamera)) return;
    camera.position.set(0, 0.35, 10);
    camera.zoom = Math.max(1, width / VIEW_WIDTH);
    camera.updateProjectionMatrix();
  }, [camera, width]);

  return null;
}

function AxisScene({ points }: { points: readonly FractionMatchAxisPoint[] }) {
  return (
    <>
      <ResponsiveAxisCamera />
      <ambientLight intensity={1.8} />
      <hemisphereLight args={["#e0f2fe", "#312e81", 1.5]} />
      <directionalLight castShadow intensity={3.2} position={[-3, 6, 7]} />
      <pointLight color="#67e8f9" intensity={22} distance={14} position={[4, 4, 5]} />

      <group rotation={[0.08, 0, 0]} position={[0, -0.15, 0]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[12.5, 0.18, 0.34]} />
          <meshPhysicalMaterial color="#312e81" roughness={0.24} metalness={0.28} clearcoat={0.7} />
        </mesh>

        {Array.from({ length: TICK_COUNT + 1 }, (_, tick) => {
          const major = tick % 8 === 0;
          const x = AXIS_START + tick / TICK_COUNT * AXIS_LENGTH;
          return (
            <mesh key={tick} castShadow position={[x, major ? 0.28 : 0.2, 0.04]}>
              <boxGeometry args={[major ? 0.075 : 0.045, major ? 0.72 : 0.43, 0.22]} />
              <meshPhysicalMaterial color={major ? "#0f172a" : "#475569"} roughness={0.3} metalness={0.18} />
            </mesh>
          );
        })}

        {points.map((point, index) => {
          const x = fractionAxisWorldX(point.position);
          const color = ["#7c3aed", "#0891b2", "#db2777", "#ea580c"][index % 4]!;
          return (
            <group key={point.id} position={[x, 0.88, 0.08]} data-axis-scene-marker={point.id} data-axis-position={point.position} data-axis-world-x={x}>
              <mesh castShadow position={[0, -0.34, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.55, 18]} />
                <meshStandardMaterial color={color} />
              </mesh>
              <mesh castShadow>
                <sphereGeometry args={[0.22, 28, 20]} />
                <meshPhysicalMaterial color={color} roughness={0.2} metalness={0.12} clearcoat={0.85} />
              </mesh>
              <mesh position={[0, 0, -0.12]}>
                <torusGeometry args={[0.29, 0.035, 14, 36]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        })}
      </group>

      <mesh receiveShadow position={[0, -1.12, -0.8]}>
        <planeGeometry args={[13.5, 2.8]} />
        <meshStandardMaterial color="#e0e7ff" transparent opacity={0.48} />
      </mesh>
    </>
  );
}

export function FractionMatchNumberLine3D({ points }: { points: readonly FractionMatchAxisPoint[] }) {
  return (
    <section
      className="relative mx-auto h-[18rem] w-full max-w-4xl touch-none overflow-hidden rounded-3xl border-4 border-indigo-200 bg-gradient-to-b from-sky-50 via-indigo-50 to-violet-100 shadow-xl"
      aria-label="Oś liczbowa od zera do trzech"
      data-fraction-axis-3d
    >
      <Canvas
        orthographic
        shadows
        camera={{ position: [0, 0.35, 10], zoom: 55, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        fallback={<p className="p-6 text-center font-bold text-slate-700">Model osi wymaga obsługi WebGL.</p>}
      >
        <AxisScene points={points} />
      </Canvas>

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[0, 1, 2, 3].map((value) => (
          <span
            key={value}
            className="absolute top-[65%] -translate-x-1/2 rounded-lg bg-white/90 px-2 py-1 text-lg font-black text-slate-900 shadow"
            style={{ left: `${fractionAxisScreenPercent(value)}%` }}
          >
            {value}
          </span>
        ))}
        {points.map((point, index) => (
          <span
            key={point.id}
            className="absolute top-[16%] grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full border-4 border-white text-xl font-black text-white shadow-lg"
            style={{
              left: `${fractionAxisScreenPercent(point.position)}%`,
              backgroundColor: ["#7c3aed", "#0891b2", "#db2777", "#ea580c"][index % 4],
            }}
            data-axis-marker={point.id}
            data-axis-position={point.position}
            data-axis-world-x={fractionAxisWorldX(point.position)}
          >
            {point.id}
          </span>
        ))}
      </div>
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-indigo-950/90 px-4 py-1 text-xs font-bold text-white shadow">
        Każda całość jest podzielona na 8 równych części.
      </p>
    </section>
  );
}
