"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Quaternion, Vector3, type Group } from "three";

export type MirrorKind = "/" | "\\";
export type LaserLevel = {
  start: [number, number];
  direction: [number, number];
  target: [number, number];
  sockets: Array<[number, number]>;
  crystals: Array<[number, number]>;
  obstacles: Array<[number, number]>;
};

type Segment = { from: [number, number]; to: [number, number] };

function reflect([dx, dy]: [number, number], mirror: MirrorKind): [number, number] {
  return mirror === "/" ? [-dy, -dx] : [dy, dx];
}

function traceBeam(level: LaserLevel, mirrors: Record<string, MirrorKind>) {
  let [x, y] = level.start;
  let direction = level.direction;
  let segmentStart: [number, number] = [x, y];
  const segments: Segment[] = [];
  const visited = new Set<string>();
  const litCrystals = new Set<string>();
  let targetHit = false;

  for (let step = 0; step < 70; step += 1) {
    const nextX = x + direction[0];
    const nextY = y + direction[1];
    if (nextX < 0 || nextX > 6 || nextY < 0 || nextY > 4) {
      segments.push({ from: segmentStart, to: [x + direction[0] * .55, y + direction[1] * .55] });
      break;
    }
    x = nextX;
    y = nextY;
    const key = `${x}-${y}`;
    if (level.crystals.some(([cx, cy]) => cx === x && cy === y)) litCrystals.add(key);
    if (x === level.target[0] && y === level.target[1]) {
      segments.push({ from: segmentStart, to: [x, y] });
      targetHit = true;
      break;
    }
    if (level.obstacles.some(([ox, oy]) => ox === x && oy === y)) {
      segments.push({ from: segmentStart, to: [x, y] });
      break;
    }
    if (mirrors[key]) {
      segments.push({ from: segmentStart, to: [x, y] });
      const state = `${key}-${direction.join("-")}`;
      if (visited.has(state)) break;
      visited.add(state);
      direction = reflect(direction, mirrors[key]);
      segmentStart = [x, y];
    }
  }
  return { segments, litCrystals, targetHit };
}

function mapPoint([x, y]: [number, number]): [number, number, number] {
  return [x - 3, .24, y - 2];
}

function BeamSegment({ segment }: { segment: Segment }) {
  const start = new Vector3(...mapPoint(segment.from));
  const end = new Vector3(...mapPoint(segment.to));
  const delta = end.clone().sub(start);
  const midpoint = start.clone().add(end).multiplyScalar(.5);
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.clone().normalize());
  return (
    <group>
      <mesh position={midpoint} quaternion={quaternion}>
        <cylinderGeometry args={[.045, .045, delta.length(), 12]} />
        <meshStandardMaterial color="#fb7185" emissive="#ef4444" emissiveIntensity={7} />
      </mesh>
      <pointLight position={midpoint} color="#ef4444" intensity={2.2} distance={2.2} />
    </group>
  );
}

function Mirror({ position, kind, onCycle }: { position: [number, number]; kind?: MirrorKind; onCycle: () => void }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (group.current && kind) group.current.position.y = .31 + Math.sin(clock.elapsedTime * 3 + position[0]) * .025;
  });
  return (
    <group ref={group} position={mapPoint(position)} onPointerDown={(event) => { event.stopPropagation(); onCycle(); }}>
      <mesh position={[0, -.17, 0]}>
        <cylinderGeometry args={[.26, .31, .12, 24]} />
        <meshStandardMaterial color={kind ? "#0e7490" : "#334155"} metalness={.8} roughness={.25} />
      </mesh>
      {kind ? (
        <group rotation-y={kind === "/" ? -Math.PI / 4 : Math.PI / 4}>
          <mesh scale={[.48, .38, .045]}>
            <boxGeometry />
            <meshPhysicalMaterial color="#cffafe" emissive="#22d3ee" emissiveIntensity={1.8} metalness={.75} roughness={.05} />
          </mesh>
          <mesh position={[0, 0, -.06]} scale={[.54, .44, .035]}>
            <boxGeometry />
            <meshStandardMaterial color="#475569" metalness={.9} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, .03, 0]} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[.18, .035, 10, 28]} />
          <meshStandardMaterial color="#94a3b8" emissive="#475569" emissiveIntensity={1} />
        </mesh>
      )}
      <mesh visible={false} scale={[.78, .8, .78]}><boxGeometry /><meshBasicMaterial /></mesh>
    </group>
  );
}

function LaserScene({ level, mirrors, onCycleMirror }: {
  level: LaserLevel;
  mirrors: Record<string, MirrorKind>;
  onCycleMirror: (x: number, y: number) => void;
}) {
  const traced = useMemo(() => traceBeam(level, mirrors), [level, mirrors]);
  const target = mapPoint(level.target);
  const start = mapPoint(level.start);
  const emitterRotation = Math.atan2(level.direction[0], level.direction[1]);

  return (
    <>
      <ambientLight intensity={1.15} />
      <hemisphereLight args={["#67e8f9", "#172554", 1.8]} />
      <directionalLight position={[4, 8, 5]} intensity={2.5} castShadow />
      <group>
        {Array.from({ length: 35 }, (_, index) => {
          const x = index % 7;
          const y = Math.floor(index / 7);
          return (
            <mesh key={index} position={[x - 3, 0, y - 2]} receiveShadow>
              <boxGeometry args={[.94, .13, .94]} />
              <meshStandardMaterial color={(x + y) % 2 ? "#172554" : "#1e3a8a"} metalness={.45} roughness={.48} />
            </mesh>
          );
        })}
        <group position={start} rotation-y={emitterRotation}>
          <mesh position={[0, .08, 0]}>
            <cylinderGeometry args={[.24, .31, .42, 24]} />
            <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={2} metalness={.65} />
          </mesh>
          <mesh position={[0, .14, .28]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[.13, .17, .32, 20]} />
            <meshStandardMaterial color="#fecaca" emissive="#ef4444" emissiveIntensity={4} />
          </mesh>
        </group>
        <group position={target}>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[.34, .1, 14, 36]} />
            <meshStandardMaterial color={traced.targetHit ? "#34d399" : "#a78bfa"} emissive={traced.targetHit ? "#10b981" : "#7c3aed"} emissiveIntensity={traced.targetHit ? 7 : 2.5} />
          </mesh>
          <pointLight color={traced.targetHit ? "#34d399" : "#8b5cf6"} intensity={3} distance={2} />
        </group>
        {level.sockets.map(([x, y]) => (
          <Mirror key={`${x}-${y}`} position={[x, y]} kind={mirrors[`${x}-${y}`]} onCycle={() => onCycleMirror(x, y)} />
        ))}
        {level.crystals.map(([x, y]) => {
          const lit = traced.litCrystals.has(`${x}-${y}`);
          return (
            <mesh key={`${x}-${y}`} position={[x - 3, .42, y - 2]} rotation={[0, Math.PI / 4, 0]}>
              <octahedronGeometry args={[.25]} />
              <meshStandardMaterial color={lit ? "#fde047" : "#64748b"} emissive={lit ? "#facc15" : "#1e293b"} emissiveIntensity={lit ? 6 : 1} />
            </mesh>
          );
        })}
        {level.obstacles.map(([x, y]) => (
          <mesh key={`${x}-${y}`} position={[x - 3, .42, y - 2]} castShadow>
            <boxGeometry args={[.7, .85, .7]} />
            <meshStandardMaterial color="#7f1d1d" metalness={.6} roughness={.3} />
          </mesh>
        ))}
        {traced.segments.map((segment, index) => <BeamSegment key={index} segment={segment} />)}
      </group>
    </>
  );
}

export function LaserLabScene(props: {
  level: LaserLevel;
  mirrors: Record<string, MirrorKind>;
  onCycleMirror: (x: number, y: number) => void;
}) {
  return (
    <div
      className="aspect-[16/10] w-full touch-none overflow-hidden rounded-[1.75rem] border-4 border-cyan-300/70 bg-slate-950 bg-cover bg-center shadow-2xl"
      style={{
        backgroundImage: "linear-gradient(rgba(2,6,23,.18), rgba(30,27,75,.5)), url(/materials/geometry-arcade/laser-lab-v2.webp)",
      }}
    >
      <Canvas
        shadows
        gl={{ alpha: true }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 7.6, 6.8], fov: 43 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <LaserScene {...props} />
      </Canvas>
    </div>
  );
}
