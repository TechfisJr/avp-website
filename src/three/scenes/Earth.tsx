"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SCENE_Z } from "@/lib/scenes";
import { PALETTE } from "@/lib/theme";
import { steelDarkMat, paintMat, floorMat } from "../materials/kit";
import { useActiveGroup } from "../useActive";
import { flags } from "@/lib/scrollStore";
import Puffs from "../fx/Puffs";

const Z = SCENE_Z.earth;
const R = 10;
const PLANET = new THREE.Vector3(0, 10, Z - 16);

const oceanMat = new THREE.MeshStandardMaterial({
  color: "#3f6f9c",
  roughness: 0.4,
  metalness: 0.1,
  envMapIntensity: 1,
});
const landMat = new THREE.MeshStandardMaterial({
  color: PALETTE.green,
  roughness: 0.85,
  metalness: 0,
  flatShading: true,
});
const O = new THREE.Object3D();

/** Scene 7 — the clean flame and the green planet. */
export default function Earth() {
  const group = useActiveGroup(0.9, 1.01);
  const planet = useRef<THREE.Group>(null);
  const flameLight = useRef<THREE.PointLight>(null);
  const land = useRef<THREE.InstancedMesh>(null);

  const landmasses = useMemo(() => {
    const golden = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: 9 }, (_, i) => {
      const y = 1 - (i / 8) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * golden;
      return {
        dir: new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r).normalize(),
        scale: 2 + Math.random() * 2.6,
        flat: 0.5 + Math.random() * 0.4,
      };
    });
  }, []);

  useFrame((state, delta) => {
    if (planet.current && !flags.reducedMotion) planet.current.rotation.y += delta * 0.06;
    if (flameLight.current) {
      const f = flags.reducedMotion ? 1 : 0.8 + Math.sin(state.clock.elapsedTime * 8) * 0.2;
      flameLight.current.intensity = 34 * f;
    }
    // place landmasses on the ocean surface once meshes exist
    const m = land.current;
    if (m && !m.userData.placed) {
      landmasses.forEach((lm, i) => {
        O.position.copy(lm.dir).multiplyScalar(R * 0.99);
        O.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), lm.dir);
        O.scale.set(lm.scale, lm.scale * lm.flat, lm.scale);
        O.updateMatrix();
        m.setMatrixAt(i, O.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
      m.userData.placed = true;
    }
  });

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, Z]} receiveShadow material={floorMat}>
        <planeGeometry args={[50, 40]} />
      </mesh>

      {/* the clean boiler / furnace */}
      <group position={[0, 2.2, Z]}>
        <mesh material={paintMat} castShadow receiveShadow>
          <boxGeometry args={[5, 4.4, 4]} />
        </mesh>
        {/* dark combustion mouth facing the camera */}
        <mesh position={[0, -0.3, 2.05]} rotation={[Math.PI / 2, 0, 0]} material={steelDarkMat}>
          <cylinderGeometry args={[1.3, 1.3, 0.4, 24]} />
        </mesh>
        <mesh position={[0, -0.3, 2.1]}>
          <circleGeometry args={[1.15, 24]} />
          <meshBasicMaterial color="#1a1207" />
        </mesh>
        {/* flue */}
        <mesh position={[0, 3.6, -1]} material={steelDarkMat} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 3, 16]} />
        </mesh>
      </group>

      {/* clean flame — warm additive puffs + flicker light */}
      <Puffs
        count={55}
        center={[0, 2.2, Z + 2.2]}
        area={[0.55, 3, 0.4]}
        color={PALETTE.sun}
        colorB={PALETTE.ember}
        rise={3}
        size={0.8}
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
      <pointLight ref={flameLight} position={[0, 2.4, Z + 3]} color={PALETTE.pellet} distance={20} decay={1.7} />

      {/* the green planet, revealed on pull-back */}
      <group ref={planet} position={PLANET.toArray()}>
        <mesh material={oceanMat} castShadow receiveShadow>
          <sphereGeometry args={[R, 48, 48]} />
        </mesh>
        <instancedMesh ref={land} args={[undefined, landMat, 9]} castShadow>
          <icosahedronGeometry args={[1, 1]} />
        </instancedMesh>
        {/* soft atmosphere halo */}
        <mesh scale={1.06}>
          <sphereGeometry args={[R, 32, 32]} />
          <meshBasicMaterial color={PALETTE.sky} transparent opacity={0.16} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      </group>

      <pointLight position={[10, 18, Z - 6]} color={PALETTE.sun} intensity={40} distance={70} decay={1.3} />
      <pointLight position={[-12, 8, Z + 6]} color={PALETTE.sky} intensity={24} distance={50} decay={1.5} />
    </group>
  );
}
