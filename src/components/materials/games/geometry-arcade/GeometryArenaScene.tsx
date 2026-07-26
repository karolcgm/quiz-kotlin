"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Quaternion, Vector3, type Group, type Mesh } from "three";

export type GeometryArenaVariant = "laser" | "polygon" | "triangle" | "quadrilateral" | "symmetry";

const COLORS = ["#22d3ee", "#f472b6", "#fbbf24", "#34d399"];
const PORTALS: [number, number, number][] = [[-3.2, .45, -1.8], [3.2, .45, -1.8], [-3.2, .45, 1.8], [3.2, .45, 1.8]];

function Beam({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  const start = new Vector3(...from); const end = new Vector3(...to); const delta = end.clone().sub(start);
  const midpoint = start.clone().add(end).multiplyScalar(.5);
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.clone().normalize());
  return <mesh position={midpoint} quaternion={quaternion}><cylinderGeometry args={[.055, .055, delta.length(), 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} /></mesh>;
}

function Portal({ index, active, onPick }: { index: number; active: boolean; onPick: () => void }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = .42 + Math.sin(clock.elapsedTime * 2 + index) * .08; });
  return <group ref={ref} position={PORTALS[index]} onPointerDown={(event) => { event.stopPropagation(); onPick(); }}>
    <mesh rotation-x={Math.PI / 2}><torusGeometry args={[.48, .13, 12, 32]} /><meshStandardMaterial color={COLORS[index]} emissive={COLORS[index]} emissiveIntensity={active ? 5 : 2} metalness={.55} roughness={.2} /></mesh>
    <mesh scale={active ? .34 : .25}><octahedronGeometry /><meshPhysicalMaterial color={COLORS[index]} emissive={COLORS[index]} emissiveIntensity={active ? 4 : 1.5} transmission={.25} roughness={.12} /></mesh>
    <mesh visible={false} scale={[1.35, .8, 1.35]}><boxGeometry /><meshBasicMaterial /></mesh>
  </group>;
}

function BoardModel({ variant, round, selected }: { variant: GeometryArenaVariant; round: number; selected: number | null }) {
  const spinner = useRef<Mesh>(null);
  useFrame((_, delta) => { if (spinner.current) spinner.current.rotation.y += delta * .22; });
  const pick = selected ?? 0;
  if (variant === "laser") return <group>
    <mesh position={[0, .32, 0]} ref={spinner}><cylinderGeometry args={[.5, .62, .36, 32]} /><meshStandardMaterial color="#334155" metalness={.8} roughness={.22} /></mesh>
    <Beam from={[0,.58,0]} to={PORTALS[pick]} color={COLORS[pick]} />
    <Beam from={[0,.55,0]} to={[round % 2 ? -3 : 3,.55,round % 3 - 1]} color="#a78bfa" />
  </group>;
  const points: [number, number, number][] = variant === "triangle" ? [[-2,.45,1.2],[0,.45,-1.5],[2,.45,1.2]] : variant === "quadrilateral" ? [[-2.2,.45,1.2],[-1.6,.45,-1.3],[2,.45,-1.1],[2.3,.45,1.25]] : [[-2.1,.45,.8],[-1.2,.45,-1.4],[1.1,.45,-1.55],[2.1,.45,.3],[.7,.45,1.5]];
  if (variant === "symmetry") return <group>{[-2,-1,0,1,2].flatMap((x) => [-1,0,1].map((z) => <mesh key={`${x}-${z}`} position={[x*.7,.42,z*.7]} scale={[.48,.16,.48]}><boxGeometry /><meshStandardMaterial color={x === 0 ? "#fbbf24" : x < 0 || (selected !== null && x === selected - 1) ? "#a78bfa" : "#1e3a8a"} emissive={x === 0 ? "#f59e0b" : "#312e81"} emissiveIntensity={1.5} metalness={.5} /></mesh>))}</group>;
  return <group>{points.map((point, index) => <group key={index}><mesh position={point}><sphereGeometry args={[.2,20,20]} /><meshStandardMaterial color={COLORS[index % 4]} emissive={COLORS[index % 4]} emissiveIntensity={3} /></mesh><Beam from={point} to={points[(index+1)%points.length]} color={COLORS[index%4]} /></group>)}</group>;
}

function Scene({ variant, round, selected, choiceCount, onSelect }: { variant: GeometryArenaVariant; round: number; selected: number | null; choiceCount: number; onSelect: (index: number) => void }) {
  return <>
    <ambientLight intensity={1.25} /><hemisphereLight args={["#67e8f9", "#312e81", 1.4]} /><directionalLight castShadow position={[4,8,5]} intensity={2.6} />
    <BoardModel variant={variant} round={round} selected={selected} />
    {Array.from({length: choiceCount}, (_, index) => <Portal key={index} index={index} active={selected===index} onPick={() => onSelect(index)} />)}
  </>;
}

export function GeometryArenaScene(props: { variant: GeometryArenaVariant; round: number; selected: number | null; choiceCount: number; onSelect: (index: number) => void }) {
  const boardImage = `/materials/geometry-arcade/${props.variant === "laser" ? "laser-lab" : props.variant === "polygon" ? "polygon-forge" : props.variant === "triangle" ? "triangle-shipyard" : props.variant === "quadrilateral" ? "quadrilateral-arena" : "symmetry-temple"}.png`;
  return <div className="h-[430px] touch-none overflow-hidden rounded-3xl border-4 border-cyan-300/70 bg-cover bg-center sm:h-[520px]" style={{backgroundImage:`url(${boardImage})`}}>
    <Canvas gl={{alpha:true}} shadows camera={{position:[0,6.6,7.4],fov:45}} dpr={[1,1.5]}><Scene {...props} /></Canvas>
  </div>;
}
