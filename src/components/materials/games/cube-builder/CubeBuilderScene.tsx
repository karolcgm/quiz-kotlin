"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type PointerEvent } from "react";
import { BoxGeometry, Camera, Plane, Raycaster, Vector2, Vector3, type Mesh } from "three";

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

function FallingCube({ x, y, z, offsetX, offsetZ, mode }: { x: number; y: number; z: number; offsetX: number; offsetZ: number; mode: CubeBuilderSceneProps["mode"] }) {
  const cubeRef = useRef<Mesh>(null);
  const destinationY = y + 0.5;

  useFrame((_, delta) => {
    const cube = cubeRef.current;
    if (!cube) return;
    cube.position.y += (destinationY - cube.position.y) * Math.min(1, delta * 9);
    const scale = cube.scale.x + (1 - cube.scale.x) * Math.min(1, delta * 12);
    cube.scale.setScalar(scale);
  });

  return <mesh ref={cubeRef} castShadow receiveShadow position={[x - offsetX, destinationY + 2.8, z - offsetZ]} scale={0.74}>
    <boxGeometry args={[0.94, 0.94, 0.94]} />
    <meshPhysicalMaterial color={mode === "remove" ? "#fb7185" : y % 2 === 0 ? "#34d399" : "#2dd4bf"} roughness={0.28} metalness={0.08} clearcoat={0.45} clearcoatRoughness={0.18} />
    <lineSegments>
      <edgesGeometry args={[new BoxGeometry(0.94, 0.94, 0.94), 18]} />
      <lineBasicMaterial color="#064e3b" transparent opacity={0.62} />
    </lineSegments>
  </mesh>;
}

function Scene({ width, depth, targetHeights, cubes, mode }: CubeBuilderSceneProps) {
  const cells = Array.from({ length: width * depth }, (_, index) => ({ x: index % width, z: Math.floor(index / width) }))
    .filter(({ x, z }) => targetHeights[z]?.[x] > 0);
  const cubeItems = Array.from(cubes, (key) => key.split(":").map(Number) as [number, number, number]);
  const offsetX = (width - 1) / 2;
  const offsetZ = (depth - 1) / 2;
  const columnHeight = (x: number, z: number) => {
    let height = 0;
    while (cubes.has(keyFor(x, height, z))) height += 1;
    return height;
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
    {cells.map(({ x, z }) => {
      const height = columnHeight(x, z);
      const isFilled = height > 0;
      return <mesh
        key={`${x}:${z}`}
        position={[x - offsetX, height + 0.06, z - offsetZ]}
      >
        <boxGeometry args={[0.98, 0.12, 0.98]} />
        <meshStandardMaterial color={isFilled ? mode === "remove" ? "#fb7185" : "#0f766e" : "#2563eb"} transparent opacity={isFilled ? 0.36 : 0.7} />
      </mesh>;
    })}
    {cubeItems.map(([x, y, z]) => <FallingCube key={keyFor(x, y, z)} x={x} y={y} z={z} offsetX={offsetX} offsetZ={offsetZ} mode={mode} />)}
    <gridHelper args={[Math.max(width, depth) + 1.2, Math.max(width, depth) + 1, "#60a5fa", "#bfdbfe"]} position={[0, 0.01, 0]} />
  </>;
}

export function CubeBuilderScene(props: CubeBuilderSceneProps) {
  const cameraRef = useRef<Camera | null>(null);
  const raycasterRef = useRef(new Raycaster());

  const selectColumn = (event: PointerEvent<HTMLDivElement>) => {
    const camera = cameraRef.current;
    if (!camera) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointer = new Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycasterRef.current.setFromCamera(pointer, camera);
    const point = new Vector3();
    const ground = new Plane(new Vector3(0, 1, 0), 0);
    if (!raycasterRef.current.ray.intersectPlane(ground, point)) return;
    const x = Math.round(point.x + (props.width - 1) / 2);
    const z = Math.round(point.z + (props.depth - 1) / 2);
    if (x < 0 || x >= props.width || z < 0 || z >= props.depth || (props.targetHeights[z]?.[x] ?? 0) === 0) return;
    props.onColumnPress(x, z);
  };

  return <div onPointerDown={selectColumn} className="h-[360px] w-full touch-none overflow-hidden rounded-3xl border-4 border-cyan-200 bg-gradient-to-b from-sky-100 to-indigo-100 sm:h-[440px]">
    <Canvas onCreated={(state) => { cameraRef.current = state.camera; }} shadows camera={{ fov: 40 }} dpr={[1, 1.5]} fallback={<p className="p-6 text-center font-bold text-slate-700">Ten model 3D wymaga obsługi WebGL. Skorzystaj z nowszej przeglądarki lub urządzenia.</p>}>
      <Scene {...props} />
    </Canvas>
  </div>;
}
