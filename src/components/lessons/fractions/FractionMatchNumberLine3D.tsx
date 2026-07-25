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
        className="absolute inset-0"
        camera={{ position: [0, 0.35, 10], zoom: 55, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        fallback={<p className="p-6 text-center font-bold text-slate-700">Model osi wymaga obsługi WebGL.</p>}
      >
        <AxisScene points={points} />
      </Canvas>

      {/*
        Warstwa HTML jest celowo stałą częścią modelu, a nie wyłącznie
        awaryjnym komunikatem. Na szkolnych komputerach przeglądarka może
        wyłączyć akcelerację WebGL bez zgłoszenia błędu — Canvas zostaje wtedy
        pusty. Ta warstwa zachowuje dokładnie tę samą geometrię co scena R3F,
        więc oś i podziałka są zawsze widoczne.
      */}
      <div className="pointer-events-none absolute inset-0 [perspective:700px]" aria-hidden data-axis-visible-layer>
        <div
          className="absolute top-[63%] h-10 -translate-y-1/2 rounded-[50%] bg-indigo-950/20 blur-md"
          style={{
            left: `${fractionAxisScreenPercent(0) - 2}%`,
            right: `${98 - fractionAxisScreenPercent(3)}%`,
          }}
          data-axis-floor-shadow
        />
        <div
          className="absolute top-[56%] h-5 -translate-y-[18%] rounded-b-xl border-x border-b border-slate-950/60 bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 shadow-[0_10px_16px_rgba(30,27,75,0.32)] [transform:rotateX(-18deg)]"
          style={{
            left: `${fractionAxisScreenPercent(0)}%`,
            right: `${100 - fractionAxisScreenPercent(3)}%`,
          }}
          data-axis-beam-depth
        />
        <div
          className="absolute top-[56%] h-4 -translate-y-1/2 rounded-full border border-indigo-950/80 bg-gradient-to-b from-white via-indigo-300 via-[25%] to-indigo-800 shadow-[inset_0_2px_2px_rgba(255,255,255,0.9),0_7px_10px_rgba(30,41,59,0.32)] [transform:rotateX(14deg)]"
          style={{
            left: `${fractionAxisScreenPercent(0)}%`,
            right: `${100 - fractionAxisScreenPercent(3)}%`,
          }}
          data-axis-beam
        />
        {Array.from({ length: TICK_COUNT + 1 }, (_, tick) => {
          const major = tick % 8 === 0;
          const position = tick / 8;
          return (
            <span
              key={tick}
              className={`absolute top-[55.5%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-950/60 bg-gradient-to-r from-slate-300 via-white to-slate-700 shadow-[2px_3px_4px_rgba(15,23,42,0.35)] ${major ? "h-14 w-2" : "h-8 w-1.5"}`}
              style={{ left: `${fractionAxisScreenPercent(position)}%` }}
              data-axis-tick={tick}
            />
          );
        })}
        {points.map((point, index) => (
          <span
            key={`${point.id}-stem`}
            className="absolute top-[29%] h-[27%] w-1.5 -translate-x-1/2 rounded-full border border-white/70 shadow-[2px_4px_5px_rgba(15,23,42,0.3)]"
            style={{
              left: `${fractionAxisScreenPercent(point.position)}%`,
              backgroundImage: `linear-gradient(90deg, #ffffffaa, ${["#7c3aed", "#0891b2", "#db2777", "#ea580c"][index % 4]} 45%, #172554aa)`,
            }}
            data-axis-marker-stem={point.id}
          />
        ))}
        {points.map((point, index) => {
          const color = ["#7c3aed", "#0891b2", "#db2777", "#ea580c"][index % 4]!;
          return (
            <span
              key={`${point.id}-pin`}
              className="absolute top-[56%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_4px_7px_rgba(15,23,42,0.45)]"
              style={{
                left: `${fractionAxisScreenPercent(point.position)}%`,
                backgroundImage: `radial-gradient(circle at 32% 25%, #ffffff 0 10%, ${color} 38%, #172554 100%)`,
              }}
              data-axis-pin={point.id}
            />
          );
        })}
        {[0, 1, 2, 3].map((value) => (
          <span
            key={value}
            className="absolute top-[68%] min-w-9 -translate-x-1/2 rounded-xl border border-white bg-gradient-to-b from-white to-indigo-100 px-2 py-1 text-center text-lg font-black text-slate-900 shadow-[0_5px_8px_rgba(30,41,59,0.24)]"
            style={{ left: `${fractionAxisScreenPercent(value)}%` }}
          >
            {value}
          </span>
        ))}
        {points.map((point, index) => (
          <span
            key={point.id}
            className="absolute top-[13%] grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full border-4 border-white text-2xl font-black text-white shadow-[0_9px_0_rgba(30,41,59,0.22),0_13px_18px_rgba(15,23,42,0.28)]"
            style={{
              left: `${fractionAxisScreenPercent(point.position)}%`,
              backgroundImage: `radial-gradient(circle at 32% 22%, #ffffff 0 7%, ${["#a78bfa", "#22d3ee", "#f472b6", "#fb923c"][index % 4]} 18%, ${["#7c3aed", "#0891b2", "#db2777", "#ea580c"][index % 4]} 62%, #312e81 100%)`,
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
