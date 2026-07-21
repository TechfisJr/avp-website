"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Procedural ambient environment map — gives every PBR material (metal,
 * glass, painted panels) a real specular/reflection response without any
 * HDRI file download or network fetch. Baked once (`frames={1}`) from a
 * handful of analytic light shapes and reused for the whole session;
 * `background={false}` keeps BackgroundGradient as the visible backdrop.
 */
export default function SceneEnvironment({ resolution = 64 }: { resolution?: number }) {
  return (
    <Environment resolution={resolution} frames={1} background={false}>
      <Lightformer form="rect" intensity={2.4} color="#fff2d8" position={[4, 6, 4]} scale={[6, 6, 1]} />
      <Lightformer form="rect" intensity={1.0} color="#7fb4c7" position={[-6, 3, -3]} scale={[5, 5, 1]} />
      <Lightformer
        form="rect"
        intensity={0.6}
        color="#1a1512"
        position={[0, -6, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[10, 10, 1]}
      />
      <Lightformer form="ring" intensity={0.4} color="#30343a" position={[0, 1, -10]} scale={10} />
    </Environment>
  );
}
