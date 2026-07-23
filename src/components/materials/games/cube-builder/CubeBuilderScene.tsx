"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { BoxGeometry, type Mesh } from "three";

export interface CubeBuilderSceneProps {
  width: number;
  depth: number;
  targetHeights: readonly (readonly number[])[];
  cubes: ReadonlySet<string>;
  mode: "add" | "remove";
  onColumnPress: (x: number, z: number, clickedLevel?: number) => void;
}

function CubeBuilderCamera() {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    // Kamera jest o około 15° wyżej niż poprzednio, a węższy kadr daje ~3× zbliżenie.
    camera.position.set(3.4, 6.5, 4.25);
    camera.lookAt(0, 0.7, 0);
  }, [camera]);

  return null;
}

function keyFor(x: number, y: number, z: number) {
  return `${x}:${y}:${z}`;
}

function FallingCube({ x, y, z, offsetX, offsetZ, mode, onPress }: { x: number; y: number; z: number; offsetX: number; offsetZ: number; mode: CubeBuilderSceneProps["mode"]; onPress: (event: ThreeEvent<PointerEvent>) => void }) {
  const cubeRef = useRef<Mesh>(null);
  const destinationY = y + 0.5;

  useFrame((_, delta) => {
    const cube = cubeRef.current;
    if (!cube) return;
    cube.position.y += (destinationY - cube.position.y) * Math.min(1, delta * 9);
    const scale = cube.scale.x + (1 - cube.scale.x) * Math.min(1, delta * 12);
    cube.scale.setScalar(scale);
  });

  return <mesh ref={cubeRef} castShadow receiveShadow position={[x - offsetX, destinationY + 2.8, z - offsetZ]} scale={0.74} onPointerDown={onPress}>
    <boxGeometry args={[0.94, 0.94, 0.94]} />
    <meshPhysicalMaterial color={mode === "remove" ? "#fb7185" : y % 2 === 0 ? "#34d399" : "#2dd4bf"} roughness={0.28} metalness={0.08} clearcoat={0.45} clearcoatRoughness={0.18} />
    <lineSegments>
      <edgesGeometry args={[new BoxGeometry(0.94, 0.94, 0.94), 18]} />
      <lineBasicMaterial color="#064e3b" transparent opacity={0.62} />
    </lineSegments>
  </mesh>;
}

function Scene({ width, depth, targetHeights, cubes, mode, onColumnPress }: CubeBuilderSceneProps) {
  const cells = Array.from({ length: width * depth }, (_, index) => ({ x: index % width, z: Math.floor(index / width) }))
    .filter(({ x, z }) => targetHeights[z]?.[x] > 0);
  const cubeItems = Array.from(cubes, (key) => key.split(":").map(Number) as [number, number, number]);
  const offsetX = (width - 1) / 2;
  const offsetZ = (depth - 1) / 2;
  const press = (event: ThreeEvent<PointerEvent>, x: number, z: number, level?: number) => {
    event.stopPropagation();
    onColumnPress(x, z, level);
  };

  return <>
    <CubeBuilderCamera />
    <ambientLight intensity={1.5} />
    <hemisphereLight args={["#dbeafe", "#0f766e", 1.25]} />
    <directionalLight castShadow intensity={2.8} position={[4, 8, 5]} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <pointLight color="#a5f3fc" intensity={18} distance={12} position={[-3, 5, 2]} />
    <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.04, 0]}>
      <planeGeometry args={[width + 1.2, depth + 1.2]} />
      <meshStandardMaterial color="#dbeafe" />
    </mesh>
    {cells.map(({ x, z }) => <mesh key={`${x}:${z}`} rotation-x={-Math.PI / 2} position={[x - offsetX, 0, z - offsetZ]} onPointerDown={(event) => press(event, x, z)}>
      <planeGeometry args={[0.9, 0.9]} />
      <meshStandardMaterial color="#bfdbfe" transparent opacity={0.82} />
    </mesh>)}
    {cubeItems.map(([x, y, z]) => <FallingCube key={keyFor(x, y, z)} x={x} y={y} z={z} offsetX={offsetX} offsetZ={offsetZ} mode={mode} onPress={(event) => press(event, x, z, y)} />)}
    <gridHelper args={[Math.max(width, depth) + 1.2, Math.max(width, depth) + 1, "#60a5fa", "#bfdbfe"]} position={[0, 0.01, 0]} />
  </>;
}

export function CubeBuilderScene(props: CubeBuilderSceneProps) {
  return <div className="h-[360px] w-full touch-none overflow-hidden rounded-3xl border-4 border-cyan-200 bg-gradient-to-b from-sky-100 to-indigo-100 sm:h-[440px]">
    <Canvas shadows camera={{ fov: 40 }} dpr={[1, 1.5]} fallback={<p className="p-6 text-center font-bold text-slate-700">Ten model 3D wymaga obsługi WebGL. Skorzystaj z nowszej przeglądarki lub urządzenia.</p>}>
      <Scene {...props} />
    </Canvas>
  </div>;
}
