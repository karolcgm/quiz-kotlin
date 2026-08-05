"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, Object3D } from "three";

interface VolumeBlocksScene3DProps {
  dimensions: [number, number, number];
  label: string;
}

const MODEL_VERTICAL_OFFSET = 0.55;

function Blocks({ dimensions }: Pick<VolumeBlocksScene3DProps, "dimensions">) {
  const mesh = useRef<InstancedMesh>(null);
  const [length, width, height] = dimensions;
  const count = length * width * height;
  const scale = Math.min(0.92, 5.6 / Math.max(length, width, height));
  const cube = useMemo(() => new Object3D(), []);
  const colors = useMemo(() => [new Color("#38bdf8"), new Color("#818cf8"), new Color("#22d3ee")], []);

  useEffect(() => {
    if (!mesh.current) return;
    let instance = 0;
    for (let y = 0; y < height; y += 1) {
      for (let z = 0; z < width; z += 1) {
        for (let x = 0; x < length; x += 1) {
          cube.position.set(
            (x - (length - 1) / 2) * scale,
            (y - (height - 1) / 2) * scale,
            (z - (width - 1) / 2) * scale,
          );
          cube.scale.setScalar(scale * 0.94);
          cube.updateMatrix();
          mesh.current.setMatrixAt(instance, cube.matrix);
          mesh.current.setColorAt(instance, colors[y % colors.length]!);
          instance += 1;
        }
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [colors, cube, height, length, scale, width]);

  return (
    <group position={[0, MODEL_VERTICAL_OFFSET, 0]} rotation={[0, -0.58, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.42} metalness={0.04} />
      </instancedMesh>
    </group>
  );
}

export function VolumeBlocksScene3D({ dimensions, label }: VolumeBlocksScene3DProps) {
  return (
    <div role="img" aria-label={label} data-model-position="raised" className="h-72 w-full overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 via-cyan-50 to-white sm:h-80">
      <Canvas
        aria-hidden="true"
        shadows
        camera={{ position: [0, 4.8, 11.5], fov: 38, near: 0.1, far: 40 }}
        dpr={[1, 1.35]}
        fallback={<div className="grid h-full place-items-center font-black text-sky-900">Model bryły: {dimensions.join(" × ")}</div>}
      >
        <color attach="background" args={["#ecfeff"]} />
        <ambientLight intensity={1.8} />
        <directionalLight castShadow position={[6, 9, 8]} intensity={2.6} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <Blocks dimensions={dimensions} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.15 + MODEL_VERTICAL_OFFSET, 0]} receiveShadow>
          <planeGeometry args={[18, 18]} />
          <shadowMaterial transparent opacity={0.16} />
        </mesh>
      </Canvas>
    </div>
  );
}
