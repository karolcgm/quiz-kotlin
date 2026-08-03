"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Group, Mesh } from "three";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function MysteryBox({ position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  const box = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!box.current) return;
    box.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.08;
  });
  return (
    <group ref={box} position={position} scale={scale}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[1.15, 0.88, 1]} />
        <meshPhysicalMaterial color="#7c3aed" roughness={0.22} metalness={0.18} clearcoat={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.68, 0]}>
        <boxGeometry args={[1.25, 0.16, 1.08]} />
        <meshPhysicalMaterial color="#a855f7" roughness={0.18} metalness={0.25} clearcoat={1} />
      </mesh>
      <mesh castShadow position={[0, 0.16, 0.53]}>
        <boxGeometry args={[0.25, 0.3, 0.08]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.75} roughness={0.2} />
      </mesh>
    </group>
  );
}

function UnitCube({ position }: { position: [number, number, number] }) {
  return (
    <mesh castShadow position={position}>
      <boxGeometry args={[0.34, 0.34, 0.34]} />
      <meshPhysicalMaterial color="#22d3ee" roughness={0.23} metalness={0.12} clearcoat={0.72} />
    </mesh>
  );
}

function UnitStack({ count, origin }: { count: number; origin: [number, number, number] }) {
  const visible = Math.min(Math.max(count, 0), 18);
  return <>{Array.from({ length: visible }, (_, index) => {
    const column = index % 6;
    const row = Math.floor(index / 6);
    return <UnitCube key={index} position={[origin[0] + (column - 2.5) * 0.38, origin[1] + row * 0.37, origin[2]]} />;
  })}</>;
}

function SceneLights() {
  return <>
    <ambientLight intensity={1.4} />
    <hemisphereLight args={["#dbeafe", "#312e81", 1.5]} />
    <directionalLight castShadow intensity={3.4} position={[-5, 7, 6]} />
    <pointLight color="#67e8f9" intensity={24} distance={18} position={[5, 4, 4]} />
    <pointLight color="#c084fc" intensity={16} distance={14} position={[-4, 3, 3]} />
  </>;
}

function BalanceScene({ leftX, leftUnits, rightX, rightUnits, xValue, paused }: { leftX: number; leftUnits: number; rightX: number; rightUnits: number; xValue: number; paused: boolean }) {
  const beam = useRef<Group>(null);
  const leftMass = leftX * xValue + leftUnits;
  const rightMass = rightX * xValue + rightUnits;
  const target = Math.max(-0.16, Math.min(0.16, (rightMass - leftMass) * 0.018));
  useFrame(() => {
    if (!beam.current || paused) return;
    beam.current.rotation.z += (target - beam.current.rotation.z) * 0.07;
  });
  const leftY = 0.55 - Math.sin(target) * 3.7;
  const rightY = 0.55 + Math.sin(target) * 3.7;
  return <>
    <SceneLights />
    <group position={[0, -1.45, 0]}>
      <mesh castShadow position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.3, 0.62, 3.2, 36]} />
        <meshPhysicalMaterial color="#1e1b4b" metalness={0.7} roughness={0.22} clearcoat={0.8} />
      </mesh>
      <mesh castShadow position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.3, 1.55, 0.35, 36]} />
        <meshPhysicalMaterial color="#312e81" metalness={0.62} roughness={0.18} />
      </mesh>
      <group ref={beam} position={[0, 2.75, 0]} rotation={[0, 0, target]}>
        <mesh castShadow>
          <boxGeometry args={[7.8, 0.28, 0.38]} />
          <meshPhysicalMaterial color="#f59e0b" metalness={0.72} roughness={0.2} clearcoat={0.7} />
        </mesh>
        {[-3.5, 3.5].map((x) => <group key={x} position={[x, -1.35, 0]}>
          <mesh castShadow position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1.32, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.18} />
          </mesh>
          <mesh castShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[1.28, 0.9, 0.18, 40]} />
            <meshPhysicalMaterial color="#d97706" metalness={0.65} roughness={0.2} clearcoat={0.6} />
          </mesh>
        </group>)}
      </group>
      <group position={[-3.5, leftY + 0.8, 0.12]}>
        {Array.from({ length: Math.min(leftX, 4) }, (_, index) => <MysteryBox key={index} position={[(index - (Math.min(leftX, 4) - 1) / 2) * 0.82, 0, 0]} scale={0.52} />)}
        <UnitStack count={leftUnits} origin={[0, 0.2, 0.6]} />
      </group>
      <group position={[3.5, rightY + 0.8, 0.12]}>
        {Array.from({ length: Math.min(rightX, 4) }, (_, index) => <MysteryBox key={index} position={[(index - (Math.min(rightX, 4) - 1) / 2) * 0.82, 0, 0]} scale={0.52} />)}
        <UnitStack count={rightUnits} origin={[0, 0.2, 0.6]} />
      </group>
    </group>
    <mesh receiveShadow position={[0, -2.08, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[13, 7]} />
      <meshStandardMaterial color="#e0e7ff" transparent opacity={0.72} />
    </mesh>
  </>;
}

function SceneShell({ label, description, children, fallback, overlay }: { label: string; description: string; children: (paused: boolean) => ReactNode; fallback: ReactNode; overlay?: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [userPaused, setUserPaused] = useState(false);
  const paused = reducedMotion || userPaused;
  return <figure className="overflow-hidden rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-950 via-indigo-900 to-violet-950 shadow-xl" aria-label={label} data-algebra-scene-3d>
    <div className="relative h-[19rem] sm:h-[23rem]">
      <Canvas shadows camera={{ position: [0, 2.4, 10.5], fov: 42, near: 0.1, far: 60 }} dpr={[1, 1.5]} fallback={fallback}>
        {children(paused)}
      </Canvas>
      {overlay}
      <button type="button" disabled={reducedMotion} onClick={() => setUserPaused((value) => !value)} className="absolute right-3 top-3 min-h-11 rounded-xl bg-slate-950/80 px-4 text-sm font-black text-white ring-1 ring-white/30 disabled:opacity-70">
        {reducedMotion ? "Animacje ograniczone" : paused ? "Wznów animację" : "Zatrzymaj animację"}
      </button>
    </div>
    <figcaption className="border-t border-white/15 bg-slate-950/75 px-4 py-3 text-center text-sm font-bold text-indigo-50">{description}</figcaption>
  </figure>;
}

export function AlgebraBalanceScene3D({ leftX = 1, leftUnits = 3, rightX = 0, rightUnits = 8, xValue = 5, revealValue = true }: { leftX?: number; leftUnits?: number; rightX?: number; rightUnits?: number; xValue?: number; revealValue?: boolean }) {
  const left = leftX * xValue + leftUnits;
  const right = rightX * xValue + rightUnits;
  const relation = left === right ? "waga jest w równowadze" : left > right ? "lewa szalka jest cięższa" : "prawa szalka jest cięższa";
  const description = revealValue
    ? `Dla x = ${xValue}: lewa strona ma wartość ${left}, prawa ${right}; ${relation}.`
    : left === right
      ? "Waga jest w równowadze. Wartość ukryta w pudełku x pozostaje zakryta do czasu rozwiązania."
      : "Waga porównuje obie strony. Wartość ukryta w pudełku x pozostaje zakryta do czasu sprawdzenia.";
  return <SceneShell label="Trójwymiarowy model wagi równania" description={description} fallback={<div className="grid h-full place-items-center p-6 text-center font-bold text-white">Model wagi równania. Wartość x jest ukryta.</div>}>
    {(paused) => <BalanceScene leftX={leftX} leftUnits={leftUnits} rightX={rightX} rightUnits={rightUnits} xValue={xValue} paused={paused} />}
  </SceneShell>;
}

function MachineScene({ progress, paused }: { progress: number; paused: boolean }) {
  const token = useRef<Mesh>(null);
  const targetX = -4.8 + progress * 3.2;
  useFrame(({ clock }) => {
    if (!token.current) return;
    if (!paused) token.current.position.x += (targetX - token.current.position.x) * 0.08;
    token.current.position.y = 0.3 + (paused ? 0 : Math.sin(clock.elapsedTime * 3) * 0.08);
    token.current.rotation.y += paused ? 0 : 0.018;
  });
  return <>
    <SceneLights />
    <group position={[0, 0, 0]}>
      {[-2.3, 0.8, 3.9].map((x, index) => <group key={x} position={[x, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.35, 2.7, 2.4]} />
          <meshPhysicalMaterial color={index === 0 ? "#0e7490" : index === 1 ? "#7c3aed" : "#059669"} transparent opacity={0.38} roughness={0.14} metalness={0.18} clearcoat={1} />
        </mesh>
        <mesh castShadow position={[0, 0, 1.22]}>
          <torusGeometry args={[0.72, 0.09, 16, 48]} />
          <meshStandardMaterial color={index === 0 ? "#67e8f9" : index === 1 ? "#c084fc" : "#6ee7b7"} emissiveIntensity={1.5} emissive={index === 0 ? "#0891b2" : index === 1 ? "#7c3aed" : "#059669"} />
        </mesh>
      </group>)}
      <mesh castShadow position={[0.7, -1.05, 0]}>
        <boxGeometry args={[10.8, 0.35, 1.3]} />
        <meshPhysicalMaterial color="#1e1b4b" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh ref={token} castShadow position={[-4.8, 0.3, 1.25]}>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshPhysicalMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.4} roughness={0.18} metalness={0.38} clearcoat={1} />
      </mesh>
      <MysteryBox position={[-5.1, -0.62, 0]} scale={0.65} />
    </group>
    <mesh receiveShadow position={[0, -1.3, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[15, 7]} /><meshStandardMaterial color="#e0e7ff" transparent opacity={0.6} /></mesh>
  </>;
}

export function AlgebraMachineScene3D({ input = 4, progress = 0, labels = ["Podstaw x", "Wykonaj mnożenie", "Dodaj lub odejmij", "Odczytaj wynik"], stepValues }: { input?: number; progress?: number; labels?: string[]; stepValues?: string[] }) {
  const safeProgress = Math.max(0, Math.min(3, progress));
  const visibleValues = stepValues ?? [`x = ${input}`, "działanie 1", "działanie 2", "wynik"];
  const machineOverlay = <div className="pointer-events-none absolute inset-x-2 bottom-3 grid grid-cols-4 gap-1 sm:inset-x-4 sm:gap-2" data-machine-values>
    {visibleValues.map((value, index) => <div key={`${value}-${index}`} className={`rounded-xl border-2 px-1 py-2 text-center font-mono text-sm font-black shadow-lg backdrop-blur-sm sm:px-2 sm:text-xl ${index === safeProgress ? "border-amber-300 bg-amber-300 text-amber-950 ring-4 ring-amber-100/70" : index < safeProgress ? "border-emerald-300 bg-emerald-100/95 text-emerald-950" : "border-white/50 bg-slate-950/85 text-white"}`}><span className="block text-[.6rem] font-black uppercase tracking-wider opacity-75 sm:text-[.7rem]">{index === 0 ? "wejście" : index === visibleValues.length - 1 ? "wyjście" : `komora ${index}`}</span>{value}</div>)}
  </div>;
  return <div className="space-y-3">
    <SceneShell label="Trójwymiarowa maszyna wartości wyrażenia" description={`Do maszyny wkładamy x = ${input}. Aktywny krok: ${labels[safeProgress] ?? labels[0]}.`} fallback={<div className="grid h-full place-items-center p-6 text-center font-bold text-white">Maszyna wartości: x = {input}, krok {safeProgress + 1}.</div>} overlay={machineOverlay}>
      {(paused) => <MachineScene progress={safeProgress} paused={paused} />}
    </SceneShell>
    <ol className="grid gap-2 sm:grid-cols-4" aria-label="Kroki maszyny wartości">
      {labels.map((label, index) => <li key={label} className={`rounded-xl px-3 py-2 text-center text-sm font-black ${index === safeProgress ? "bg-violet-700 text-white ring-4 ring-violet-200" : index < safeProgress ? "bg-emerald-100 text-emerald-950" : "bg-slate-100 text-slate-600"}`}>{index + 1}. {label}</li>)}
    </ol>
  </div>;
}

function TilesScene({ xCount, unitCount, paused }: { xCount: number; unitCount: number; paused: boolean }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || paused) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.08;
  });
  return <>
    <SceneLights />
    <group ref={group} position={[0, -0.7, 0]}>
      {Array.from({ length: Math.min(xCount, 8) }, (_, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        return <MysteryBox key={index} position={[(col - 1.5) * 1.7, row * 1.25, 0]} scale={0.72} />;
      })}
      <UnitStack count={unitCount} origin={[0, -0.05, 1.35]} />
    </group>
    <mesh receiveShadow position={[0, -1.45, -0.9]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[13, 7]} /><meshStandardMaterial color="#ede9fe" transparent opacity={0.72} /></mesh>
  </>;
}

export function AlgebraTilesScene3D({ xCount = 3, unitCount = 0 }: { xCount?: number; unitCount?: number }) {
  return <SceneShell label="Trójwymiarowe klocki algebraiczne" description={`${xCount} jednakowych paczek x${unitCount ? ` oraz ${unitCount} osobnych jednostek` : ""}. Łączymy tylko elementy tego samego rodzaju.`} fallback={<div className="grid h-full place-items-center p-6 text-center font-bold text-white">{xCount} paczek x i {unitCount} jednostek.</div>}>
    {(paused) => <TilesScene xCount={xCount} unitCount={unitCount} paused={paused} />}
  </SceneShell>;
}
