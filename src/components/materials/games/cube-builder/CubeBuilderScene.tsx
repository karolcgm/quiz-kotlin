"use client";

import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect } from "react";

export interface CubeBuilderSceneProps {
  width: number;
  depth: number;
  height: number;
  cubes: ReadonlySet<string>;
  mode: "add" | "remove";
  onColumnPress: (x: number, z: number, clickedLevel?: number) => void;
}

function CubeBuilderCamera() {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.position.set(5.8, 6.4, 7.2);
    camera.lookAt(0, 0.8, 0);
  }, [camera]);

  return null;
}

function keyFor(x: number, y: number, z: number) {
  return `${x}:${y}:${z}`;
}

function Scene({ width, depth, cubes, mode, onColumnPress }: CubeBuilderSceneProps) {
  const cells = Array.from({ length: width * depth }, (_, index) => ({
    x: index % width,
    z: Math.floor(index / width),
  }));
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
    <directionalLight castShadow intensity={2.2} position={[4, 7, 4]} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.04, 0]}>
      <planeGeometry args={[width + 1.2, depth + 1.2]} />
      <meshStandardMaterial color="#dbeafe" />
    </mesh>
    {cells.map(({ x, z }) => <mesh
      key={`${x}:${z}`}
      rotation-x={-Math.PI / 2}
      position={[x - offsetX, 0, z - offsetZ]}
      onPointerDown={(event) => press(event, x, z)}
    >
      <planeGeometry args={[0.9, 0.9]} />
      <meshStandardMaterial color="#bfdbfe" transparent opacity={0.82} />
    </mesh>)}
    {cubeItems.map(([x, y, z]) => <mesh
      castShadow
      receiveShadow
      key={keyFor(x, y, z)}
      position={[x - offsetX, y + 0.5, z - offsetZ]}
      onPointerDown={(event) => press(event, x, z, y)}
    >
      <boxGeometry args={[0.92, 0.92, 0.92]} />
      <meshStandardMaterial color={mode === "remove" ? "#fb7185" : "#22c55e"} roughness={0.55} />
    </mesh>)}
    <gridHelper args={[Math.max(width, depth) + 1.2, Math.max(width, depth) + 1, "#60a5fa", "#bfdbfe"]} position={[0, 0.01, 0]} />
  </>;
}

export function CubeBuilderScene(props: CubeBuilderSceneProps) {
  return <div className="h-[360px] w-full touch-none overflow-hidden rounded-3xl border-4 border-cyan-200 bg-gradient-to-b from-sky-100 to-indigo-100 sm:h-[440px]">
    <Canvas shadows dpr={[1, 1.5]} fallback={<p className="p-6 text-center font-bold text-slate-700">Ten model 3D wymaga obsługi WebGL. Skorzystaj z nowszej przeglądarki lub urządzenia.</p>}>
      <Scene {...props} />
    </Canvas>
  </div>;
}
