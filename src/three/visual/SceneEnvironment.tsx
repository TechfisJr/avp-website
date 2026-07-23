"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Procedural image-based lighting — the specular/reflection source for every
 * PBR material, with no HDRI download. Baked once (`frames={1}`) and reused for
 * the whole session; `background={false}` keeps BackgroundGradient visible.
 *
 * The shape of this rig matters more than its brightness. A near-uniform
 * environment (what four big flat rects produce) gives every surface the same
 * dull sheen everywhere, which is the classic plastic look. Real rooms have
 * high-contrast structure: a few small, very bright sources that travel across
 * a surface as it turns, broad soft panels for body, and a dark floor so the
 * underside falls off. That variation is what a rotating pellet needs in order
 * to read as a solid object rather than a painted shape.
 */
export default function SceneEnvironment({ resolution = 256 }: { resolution?: number }) {
  return (
    <Environment resolution={resolution} frames={1} background={false}>
      {/* ---- key: hot, small, high-contrast. The travelling highlight. ---- */}
      <Lightformer
        form="rect"
        intensity={7}
        color="#fff4de"
        position={[5, 7, 4]}
        scale={[3, 3, 1]}
      />
      {/* narrow strip — reads as a long specular streak on cylinders/metal */}
      <Lightformer
        form="rect"
        intensity={5}
        color="#ffe9c6"
        position={[3, 5, 6]}
        rotation={[0, -0.5, 0]}
        scale={[0.6, 7, 1]}
      />

      {/* ---- broad soft fill: body, not highlight ---- */}
      <Lightformer
        form="rect"
        intensity={1.1}
        color="#cfe2ee"
        position={[-7, 4, -2]}
        scale={[8, 7, 1]}
      />
      <Lightformer
        form="rect"
        intensity={0.7}
        color="#8fa8bb"
        position={[-4, 2, 7]}
        scale={[6, 4, 1]}
      />

      {/* ---- cool rim from behind: holds silhouettes out of the fog ---- */}
      <Lightformer
        form="ring"
        intensity={2.2}
        color="#bcd8e8"
        position={[0, 3, -11]}
        scale={9}
      />

      {/* ---- warm bounce, low and amber: the biomass/ember undertone ---- */}
      <Lightformer
        form="rect"
        intensity={0.9}
        color="#8a5520"
        position={[2, -3, 3]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[9, 9, 1]}
      />

      {/* ---- dark floor: without this everything is lit from below and flat ---- */}
      <Lightformer
        form="rect"
        intensity={0.12}
        color="#0d0b09"
        position={[0, -7, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[14, 14, 1]}
      />
    </Environment>
  );
}
