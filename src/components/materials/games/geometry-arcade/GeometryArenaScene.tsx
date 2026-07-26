"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { Euler, Quaternion, Vector3, type Group, type Mesh } from "three";

export type GeometryArenaVariant = "laser" | "polygon" | "triangle" | "quadrilateral" | "symmetry";

const COLORS = ["#22d3ee", "#f472b6", "#fbbf24", "#34d399"];
type Point3 = [number, number, number];
export type ArenaCalibration = { camera: Point3; target: Point3; fov: number; modelPosition: Point3; modelRotation: Point3; modelScale: number; portalScale: number; portals: Point3[] };

export const ARENA_CALIBRATIONS: Record<GeometryArenaVariant, ArenaCalibration> = {
  laser: { camera:[0,7.2,8.1], target:[0,.3,0], fov:43, modelPosition:[0,.1,.15], modelRotation:[0,0,0], modelScale:.9, portalScale:.82, portals:[[-3.1,.3,-1.55],[3.1,.3,-1.55],[-3.25,.3,1.65],[3.25,.3,1.65]] },
  polygon: { camera:[0,8.4,7.2], target:[0,.2,0], fov:44, modelPosition:[0,.05,.1], modelRotation:[0,0,0], modelScale:.92, portalScale:.78, portals:[[-3.25,.28,-1.75],[3.25,.28,-1.75],[-3.25,.28,1.8],[3.25,.28,1.8]] },
  triangle: { camera:[0,7.8,8.4], target:[0,.25,0], fov:42, modelPosition:[0,.05,-.05], modelRotation:[0,0,0], modelScale:.95, portalScale:.72, portals:[[-2.35,.25,2.15],[-.8,.25,2.15],[.8,.25,2.15],[2.35,.25,2.15]] },
  quadrilateral: { camera:[0,7.6,8.7], target:[0,.25,0], fov:44, modelPosition:[0,.05,0], modelRotation:[0,0,0], modelScale:.92, portalScale:.78, portals:[[0,.28,-2.35],[-3.35,.28,0],[3.35,.28,0],[0,.28,2.35]] },
  symmetry: { camera:[0,8.2,7.8], target:[0,.2,0], fov:44, modelPosition:[0,.03,0], modelRotation:[0,0,0], modelScale:.9, portalScale:.74, portals:[[-3.45,.25,-1.55],[3.45,.25,-1.55],[-3.45,.25,1.55],[3.45,.25,1.55]] },
};

function CameraRig({ calibration }: { calibration: ArenaCalibration }) {
  const camera = useThree((state) => state.camera);
  useLayoutEffect(() => {
    camera.position.set(...calibration.camera);
    camera.lookAt(...calibration.target);
  }, [calibration, camera]);
  return null;
}

export function worldToModelPoint(point: Point3, calibration: ArenaCalibration): Point3 {
  const inverseRotation = new Quaternion()
    .setFromEuler(new Euler(...calibration.modelRotation))
    .invert();
  const local = new Vector3(...point)
    .sub(new Vector3(...calibration.modelPosition))
    .applyQuaternion(inverseRotation)
    .divideScalar(calibration.modelScale);
  return [local.x, local.y, local.z];
}

function Beam({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  const start = new Vector3(...from); const end = new Vector3(...to); const delta = end.clone().sub(start);
  const midpoint = start.clone().add(end).multiplyScalar(.5);
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.clone().normalize());
  return <mesh position={midpoint} quaternion={quaternion}><cylinderGeometry args={[.055, .055, delta.length(), 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} /></mesh>;
}

function Portal({ index, active, position, scale, onPick }: { index: number; active: boolean; position: Point3; scale: number; onPick: () => void }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + index) * .055; });
  return <group ref={ref} position={position} scale={scale} onPointerDown={(event) => { event.stopPropagation(); onPick(); }}>
    <mesh rotation-x={Math.PI / 2}><torusGeometry args={[.48, .13, 12, 32]} /><meshStandardMaterial color={COLORS[index]} emissive={COLORS[index]} emissiveIntensity={active ? 5 : 2} metalness={.55} roughness={.2} /></mesh>
    <mesh scale={active ? .34 : .25}><octahedronGeometry /><meshPhysicalMaterial color={COLORS[index]} emissive={COLORS[index]} emissiveIntensity={active ? 4 : 1.5} transmission={.25} roughness={.12} /></mesh>
    <mesh visible={false} scale={[1.35, .8, 1.35]}><boxGeometry /><meshBasicMaterial /></mesh>
  </group>;
}

function BoardModel({ variant, round, selected, laserPortals }: { variant: GeometryArenaVariant; round: number; selected: number | null; laserPortals: Point3[] }) {
  const spinner = useRef<Mesh>(null);
  useFrame((_, delta) => { if (spinner.current) spinner.current.rotation.y += delta * .22; });
  const pick = selected ?? 0;
  if (variant === "laser") return <group>
    <mesh position={[0, .32, 0]} ref={spinner}><cylinderGeometry args={[.5, .62, .36, 32]} /><meshStandardMaterial color="#334155" metalness={.8} roughness={.22} /></mesh>
    <Beam from={[0,.58,0]} to={laserPortals[pick]} color={COLORS[pick]} />
    <Beam from={[0,.55,0]} to={[round % 2 ? -3 : 3,.55,round % 3 - 1]} color="#a78bfa" />
  </group>;
  const points: [number, number, number][] = variant === "triangle" ? [[-2,.45,1.2],[0,.45,-1.5],[2,.45,1.2]] : variant === "quadrilateral" ? [[-2.2,.45,1.2],[-1.6,.45,-1.3],[2,.45,-1.1],[2.3,.45,1.25]] : [[-2.1,.45,.8],[-1.2,.45,-1.4],[1.1,.45,-1.55],[2.1,.45,.3],[.7,.45,1.5]];
  if (variant === "symmetry") return <group>{[-2,-1,0,1,2].flatMap((x) => [-1,0,1].map((z) => <mesh key={`${x}-${z}`} position={[x*.7,.42,z*.7]} scale={[.48,.16,.48]}><boxGeometry /><meshStandardMaterial color={x === 0 ? "#fbbf24" : x < 0 || (selected !== null && x === selected - 1) ? "#a78bfa" : "#1e3a8a"} emissive={x === 0 ? "#f59e0b" : "#312e81"} emissiveIntensity={1.5} metalness={.5} /></mesh>))}</group>;
  return <group>{points.map((point, index) => <group key={index}><mesh position={point}><sphereGeometry args={[.2,20,20]} /><meshStandardMaterial color={COLORS[index % 4]} emissive={COLORS[index % 4]} emissiveIntensity={3} /></mesh><Beam from={point} to={points[(index+1)%points.length]} color={COLORS[index%4]} /></group>)}</group>;
}

function Scene({ variant, round, selected, choiceCount, onSelect }: { variant: GeometryArenaVariant; round: number; selected: number | null; choiceCount: number; onSelect: (index: number) => void }) {
  const calibration = ARENA_CALIBRATIONS[variant];
  const localLaserPortals = calibration.portals.map((point) => worldToModelPoint(point, calibration));
  return <>
    <CameraRig calibration={calibration} />
    <ambientLight intensity={1.25} /><hemisphereLight args={["#67e8f9", "#312e81", 1.4]} /><directionalLight castShadow position={[4,8,5]} intensity={2.6} />
    <group position={calibration.modelPosition} rotation={calibration.modelRotation} scale={calibration.modelScale}><BoardModel variant={variant} round={round} selected={selected} laserPortals={localLaserPortals} /></group>
    {Array.from({length: choiceCount}, (_, index) => <Portal key={index} index={index} active={selected===index} position={calibration.portals[index]} scale={calibration.portalScale} onPick={() => onSelect(index)} />)}
  </>;
}

export function GeometryArenaScene(props: { variant: GeometryArenaVariant; round: number; selected: number | null; choiceCount: number; onSelect: (index: number) => void }) {
  const boardImage = `/materials/geometry-arcade/${props.variant === "laser" ? "laser-lab" : props.variant === "polygon" ? "polygon-forge" : props.variant === "triangle" ? "triangle-shipyard" : props.variant === "quadrilateral" ? "quadrilateral-arena" : "symmetry-temple"}.png`;
  return <div className="aspect-video w-full touch-none overflow-hidden rounded-3xl border-4 border-cyan-300/70 bg-cover bg-center" style={{backgroundImage:`url(${boardImage})`}}>
    <Canvas key={props.variant} gl={{alpha:true}} shadows camera={{fov:ARENA_CALIBRATIONS[props.variant].fov}} dpr={[1,1.5]}><Scene {...props} /></Canvas>
  </div>;
}
