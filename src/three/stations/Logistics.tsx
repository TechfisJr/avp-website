"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATIONS, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import { useStation } from "../useStation";
import { Truck } from "../kit/machines";
import { M } from "../kit/industrial";
import { DASH_VERT, DASH_FRAG } from "../fx/shaders";
import { createPaintedMetalMaterial } from "../visual/materials";

const I = 12;
const S = STATIONS[I];
const O = new THREE.Object3D();

const seaMat = new THREE.MeshStandardMaterial({ color: "#0a1522", roughness: 0.2, metalness: 0.75, envMapIntensity: 0.6 });
const hullMat = createPaintedMetalMaterial({ color: "#1e2d3a", roughness: 0.55, metalness: 0.35 }, { scale: 4 });
const containerMat = createPaintedMetalMaterial({ roughness: 0.6, metalness: 0.2 }, { scale: 6 });
const moonPathMat = new THREE.MeshBasicMaterial({
  color: "#bcd8ea",
  transparent: true,
  opacity: 0.16,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

function RouteArc({ from, to, height, getDraw, delay }: {
  from: [number, number]; to: [number, number]; height: number;
  getDraw: () => number; delay: number;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(from[0], 0.5, from[1]),
      new THREE.Vector3(
        (from[0] + to[0]) / 2 + (to[1] - from[1]) * 0.06,
        height,
        (from[1] + to[1]) / 2 - (to[0] - from[0]) * 0.06
      ),
      new THREE.Vector3(to[0], 0.5, to[1]),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.05, 5, false);
  }, [from, to, height]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDraw: { value: 0 },
      uColor: { value: new THREE.Color("#8fb6d4") },
    }),
    []
  );
  useFrame((stateR) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = stateR.clock.elapsedTime;
    mat.current.uniforms.uDraw.value = smooth((getDraw() - delay) / 0.4);
  });
  return (
    <mesh geometry={geo}>
      <shaderMaterial
        ref={mat}
        vertexShader={DASH_VERT}
        fragmentShader={DASH_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** S12 — the floor falls away into a night ocean: quay, bulk carrier gliding
 *  under a real moonlit key + quay practicals, great-circle routes drawing
 *  toward distant markets. The ship is lit, not silhouetted into nothing. */
export default function Logistics({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const ship = useRef<THREE.Group>(null);
  const shipKey = useRef<THREE.PointLight>(null);
  const containers = useRef<THREE.InstancedMesh>(null);
  const COUNT = 18;

  useLayoutEffect(() => {
    if (!containers.current) return;
    const C = new THREE.Color();
    let n = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 6; c++) {
        O.position.set(-3.5 + c * 1.45, 1.9 + r * 0.75, 0);
        O.rotation.set(0, 0, 0);
        O.scale.set(1.35, 0.7, 2.2);
        O.updateMatrix();
        containers.current.setMatrixAt(n, O.matrix);
        C.setHSL(0.05 + Math.random() * 0.12, 0.35, 0.3 + Math.random() * 0.14);
        containers.current.setColorAt(n, C);
        n++;
      }
    }
    containers.current.instanceMatrix.needsUpdate = true;
    if (containers.current.instanceColor) containers.current.instanceColor.needsUpdate = true;
  }, []);

  useFrame((stateR) => {
    if (!ship.current || !state.current.active) return;
    const local = state.current.local;
    const e = stateR.clock.elapsedTime;
    const x = -14 + smooth((local - 0.1) / 0.7) * 20;
    ship.current.position.x = x;
    ship.current.position.y = Math.sin(e * 0.5) * 0.08;
    ship.current.rotation.z = Math.sin(e * 0.4) * 0.012;
    if (shipKey.current) shipKey.current.position.x = x - 3;
  });

  return (
    <group ref={group} position={S.pos}>
      {/* night ocean */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} material={seaMat}>
        <planeGeometry args={[140, 120]} />
      </mesh>
      {/* moonlight path across the water, gives the sea presence instead of pure black */}
      <mesh rotation={[-Math.PI / 2, 0, 0.15]} position={[6, 0.02, -14]} material={moonPathMat}>
        <planeGeometry args={[8, 70]} />
      </mesh>

      {/* quay */}
      <mesh position={[0, 0.6, 16]} material={M.concrete}>
        <boxGeometry args={[46, 1.4, 12]} />
      </mesh>
      <Truck position={[-6, 1.3, 16]} rotation={[0, 0.15, 0]} />
      {/* quay light poles — a port-at-night string of practicals */}
      {[-18, -6, 6, 18].map((x) => (
        <group key={x} position={[x, 1.3, 21]}>
          <mesh material={M.dark}>
            <cylinderGeometry args={[0.07, 0.09, 4.4, 8]} />
          </mesh>
          <mesh position={[0, 2.3, 0]}>
            <sphereGeometry args={[0.16, 10, 8]} />
            <meshStandardMaterial color="#0a0a0a" emissive="#ffd9a0" emissiveIntensity={2.4} />
          </mesh>
          <pointLight position={[0, 2.3, 0]} color="#ffd9a0" intensity={9} distance={13} decay={1.9} />
        </group>
      ))}
      {/* quay crane silhouette */}
      <group position={[7, 1.3, 14]}>
        <mesh position={[0, 5, 0]} material={M.housing}>
          <boxGeometry args={[0.6, 10, 0.6]} />
        </mesh>
        <mesh position={[-3, 9.6, 0]} rotation={[0, 0, 0.06]} material={M.housing}>
          <boxGeometry args={[12, 0.5, 0.5]} />
        </mesh>
        <mesh position={[0, 10.3, 0]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#0a0a0a" emissive="#ff3b30" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* bulk carrier */}
      <group ref={ship} position={[-6, 0, -4]}>
        <mesh position={[0, 1.1, 0]} material={hullMat}>
          <boxGeometry args={[11, 1.8, 3]} />
        </mesh>
        <mesh position={[5.9, 1.1, 0]} rotation={[0, 0, -0.5]} material={hullMat}>
          <boxGeometry args={[2.4, 1.8, 3]} />
        </mesh>
        {/* waterline stripe for hull readability */}
        <mesh position={[0, 0.25, 1.52]} material={M.dark}>
          <boxGeometry args={[11, 0.3, 0.03]} />
        </mesh>
        <mesh position={[0, 0.25, -1.52]} material={M.dark}>
          <boxGeometry args={[11, 0.3, 0.03]} />
        </mesh>
        <mesh position={[-4.4, 2.9, 0]} material={M.housing}>
          <boxGeometry args={[1.6, 2, 2.4]} />
        </mesh>
        {/* bridge windows — a lit row, not one dot */}
        {[-0.55, 0, 0.55].map((z) => (
          <mesh key={z} position={[-4.38, 3.55, z]}>
            <boxGeometry args={[0.06, 0.28, 0.4]} />
            <meshStandardMaterial color="#0a0a0a" emissive="#ffd9a0" emissiveIntensity={2.2} />
          </mesh>
        ))}
        {/* masthead nav lights */}
        <mesh position={[-4.4, 4.3, 0.9]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#0a0a0a" emissive="#3fd158" emissiveIntensity={3} />
        </mesh>
        <mesh position={[-4.4, 4.3, -0.9]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#0a0a0a" emissive="#ff3b30" emissiveIntensity={3} />
        </mesh>
        <instancedMesh ref={containers} args={[undefined, undefined, COUNT]} material={containerMat} />
        {/* deck floods so the containers/superstructure read against the dark sea */}
        <pointLight position={[-4.4, 5, 0]} color="#e8e0cc" intensity={10} distance={9} decay={2} />
        <pointLight position={[2, 3.5, 0]} color="#dce8f0" intensity={8} distance={10} decay={2} />
      </group>
      {/* cold moon key rimming the ship as it crosses the frame */}
      <pointLight ref={shipKey} position={[-9, 6, -6]} color="#a9c8dc" intensity={38} distance={22} decay={1.7} />

      {/* route arcs to distant markets */}
      <RouteArc from={[2, -2]} to={[-46, -34]} height={10} delay={0} getDraw={() => state.current.local} />
      <RouteArc from={[2, -2]} to={[40, -40]} height={13} delay={0.12} getDraw={() => state.current.local} />
      <RouteArc from={[2, -2]} to={[-12, -52]} height={8} delay={0.24} getDraw={() => state.current.local} />

      <pointLight position={[0, 10, 6]} color="#8fb6d4" intensity={22} distance={40} decay={1.7} />
    </group>
  );
}
