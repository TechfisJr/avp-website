"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SCENE_Z } from "@/lib/scenes";
import { PALETTE } from "@/lib/theme";
import { floorMat, paintMat, steelDarkMat, accentMat } from "../materials/kit";
import { flags, scroll } from "@/lib/scrollStore";
import { useActiveGroup } from "../useActive";
import Puffs from "../fx/Puffs";

const Z = SCENE_Z.collection;
const O = new THREE.Object3D();
const C = new THREE.Color();
const lerp = THREE.MathUtils.lerp;

// one flake shape, scaled per type so the sort also reads as size-grading
const flakeGeo = new THREE.BoxGeometry(1, 0.18, 0.66);

// three material classes, keyed by type index
const LANE_Z = [-2.6, 0, 2.6]; // sawdust · chips · offcuts
const TYPE_HSL: [number, number, number][] = [
  [0.1, 0.3, 0.64], // fine sawdust — pale
  [0.08, 0.46, 0.46], // wood chips — amber
  [0.07, 0.32, 0.29], // offcuts — dark bark
];
const TYPE_SCALE = [0.17, 0.33, 0.46];

// scene is only worth animating while the camera is on it
const IN = 0.4;
const OUT = 0.6;

/**
 * A flake's position along the sort line, driven by a looping progress p∈[0,1):
 *   fall from hopper → travel the vibrating screen → divert into its lane →
 *   arc across → drop into its bin → settle briefly → repeat.
 * Time-based, so skipping frames while off-screen never desyncs it.
 */
function place(
  p: number,
  ti: number,
  i: number,
  zj: number,
  lx: number,
  lz: number,
  hy: number,
  t: number,
  reduced: boolean
) {
  const laneZ = LANE_Z[ti];
  let x: number;
  let y: number;
  let z: number;

  if (p < 0.1) {
    // fall from the hopper mouth onto the head of the screen
    const s = p / 0.1;
    x = lerp(-7.8, -6.8, s);
    y = lerp(4.7, 3.85, s);
    z = zj;
  } else if (p < 0.48) {
    // ride down the inclined vibrating screen (mixed, spread across the deck)
    const s = (p - 0.1) / 0.38;
    x = lerp(-6.8, 0.8, s);
    y = lerp(3.85, 2.05, s);
    z = zj;
    if (!reduced) {
      y += Math.sin(t * 38 + i) * 0.035;
      z += Math.sin(t * 26 + i * 1.7) * 0.05;
    }
  } else if (p < 0.58) {
    // the air-jet split — divert sideways into this type's lane
    const s = (p - 0.48) / 0.1;
    const e = s * s * (3 - 2 * s);
    x = lerp(0.8, 2.3, s);
    y = lerp(2.05, 1.95, s);
    z = lerp(zj, laneZ, e);
  } else if (p < 0.86) {
    // slide DOWN the chute into the bin — the material stays on the ramp
    // surface the whole way (no floating through the air, which read as a bug)
    const s = (p - 0.58) / 0.28;
    const e = s * s * (3 - 2 * s);
    x = lerp(2.3, 5.3 + lx * 0.4, e);
    y = lerp(1.95, 0.85 + hy, e); // monotonic descent along the chute slope
    z = lerp(laneZ, laneZ + lz * 0.4, e);
  } else {
    // settled in the heap
    x = 5.4 + lx;
    y = 0.7 + hy;
    z = laneZ + lz;
  }

  O.position.set(x, y, z);
  const spin = reduced ? i : i * 0.7 + p * 6;
  O.rotation.set(spin, i * 1.3 + p * 4, i * 2.1);
  const sc = TYPE_SCALE[ti];
  O.scale.set(sc, sc, sc);
  O.updateMatrix();
}

/** The animated flake stream + the vibrating screen deck it rides on. */
function SortStream({ count = 1100 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const deck = useRef<THREE.Group>(null);
  const staticDone = useRef(false);

  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.88, metalness: 0 }),
    []
  );

  // per-flake constants
  const P = useMemo(() => {
    const type = new Uint8Array(count);
    const phase = new Float32Array(count);
    const zj = new Float32Array(count);
    const lx = new Float32Array(count);
    const lz = new Float32Array(count);
    const hy = new Float32Array(count);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      type[i] = i % 3; // even split across the three classes
      phase[i] = Math.random();
      zj[i] = (Math.random() - 0.5) * 3.0; // lateral spread on the deck
      lx[i] = (Math.random() - 0.5) * 1.4;
      lz[i] = (Math.random() - 0.5) * 1.4;
      hy[i] = Math.random() * 0.7;
      spd[i] = 0.09 + Math.random() * 0.03; // cycles/sec
    }
    return { type, phase, zj, lx, lz, hy, spd };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // initial placement + per-type colour (also the frozen reduced-motion frame)
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const reduced = flags.reducedMotion;
    for (let i = 0; i < count; i++) {
      const ti = P.type[i];
      place(P.phase[i], ti, i, P.zj[i], P.lx[i], P.lz[i], P.hy[i], 0, reduced);
      m.setMatrixAt(i, O.matrix);
      const [h, s, l] = TYPE_HSL[ti];
      C.setHSL(h, s, l + (Math.random() - 0.5) * 0.08);
      m.setColorAt(i, C);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [P, count]);

  useFrame((state) => {
    const o = scroll.offset;
    // start the 1,100-instance animation only once the forest video's exit
    // blur is essentially done — the two peaking together is what lagged the seam
    if (o < 0.46 || o > OUT) return; // asleep off-screen

    if (flags.reducedMotion) {
      if (staticDone.current) return; // frozen frame already placed
      staticDone.current = true;
      return;
    }

    const t = state.clock.elapsedTime;

    // the deck buzzes
    if (deck.current) deck.current.position.y = Math.sin(t * 38) * 0.03;

    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < count; i++) {
      const p = (t * P.spd[i] + P.phase[i]) % 1;
      place(p, P.type[i], i, P.zj[i], P.lx[i], P.lz[i], P.hy[i], t, false);
      m.setMatrixAt(i, O.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* the inclined vibrating screen deck (buzzes) */}
      <group ref={deck}>
        <group position={[-3, 2.95, 0]} rotation={[0, 0, 0.235]}>
          <mesh material={steelDarkMat} castShadow receiveShadow>
            <boxGeometry args={[8.4, 0.16, 4.4]} />
          </mesh>
          {/* screen slats */}
          {Array.from({ length: 9 }).map((_, k) => (
            <mesh key={k} position={[-3.6 + k * 0.9, 0.12, 0]} material={steelDarkMat}>
              <boxGeometry args={[0.06, 0.1, 4.2]} />
            </mesh>
          ))}
          {/* side rails */}
          {[-2.15, 2.15].map((z, k) => (
            <mesh key={k} position={[0, 0.22, z]} material={paintMat} castShadow>
              <boxGeometry args={[8.4, 0.5, 0.14]} />
            </mesh>
          ))}
        </group>
      </group>

      <instancedMesh
        ref={mesh}
        args={[flakeGeo, mat, count]}
        castShadow
        receiveShadow
        frustumCulled={false}
      />
    </>
  );
}

/** A simple open-top collection bin. */
function Bin({ x, z, hsl }: { x: number; z: number; hsl: [number, number, number] }) {
  const chip = useMemo(() => {
    const [h, s, l] = hsl;
    return new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(h, s, l), roughness: 0.7 });
  }, [hsl]);
  return (
    <group position={[x, 0, z]}>
      {/* floor + walls */}
      <mesh position={[0, 0.08, 0]} material={steelDarkMat} receiveShadow>
        <boxGeometry args={[2.6, 0.16, 2.6]} />
      </mesh>
      {[
        [0, 0.75, -1.25, 2.6, 1.4, 0.14],
        [0, 0.45, 1.25, 2.6, 0.8, 0.14],
        [-1.25, 0.75, 0, 0.14, 1.4, 2.6],
        [1.25, 0.75, 0, 0.14, 1.4, 2.6],
      ].map((b, i) => (
        <mesh key={i} position={[b[0], b[1], b[2]]} material={paintMat} castShadow>
          <boxGeometry args={[b[3], b[4], b[5]]} />
        </mesh>
      ))}
      {/* a colour chip on the front so the class is legible */}
      <mesh position={[0, 0.5, 1.33]} material={chip}>
        <boxGeometry args={[1.2, 0.5, 0.05]} />
      </mesh>
    </group>
  );
}

/** Scene 3 — the biomass classification line (optical sort). */
export default function Collection() {
  const group = useActiveGroup(IN + 0.02, OUT - 0.01);

  return (
    <group ref={group}>
      {/* concrete yard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, Z]} receiveShadow material={floorMat}>
        <planeGeometry args={[70, 60]} />
      </mesh>

      <group position={[0, 0, Z]}>
        {/* hopper feeding the head of the screen */}
        <group position={[-7.8, 5.4, 0]}>
          <mesh material={paintMat} castShadow>
            <cylinderGeometry args={[1.7, 0.55, 2.0, 20, 1, true]} />
          </mesh>
          <mesh position={[0, 1.2, 0]} material={steelDarkMat} castShadow>
            <boxGeometry args={[3.2, 0.5, 3.2]} />
          </mesh>
          {/* legs */}
          {[[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].map(([lx, lz], i) => (
            <mesh key={i} position={[lx, -2.6, lz]} material={steelDarkMat} castShadow>
              <boxGeometry args={[0.18, 4.4, 0.18]} />
            </mesh>
          ))}
        </group>

        {/* diverter head at the sort point + three angled nozzles */}
        <group position={[1.4, 2.35, 0]}>
          <mesh material={accentMat} castShadow>
            <boxGeometry args={[1.1, 1.0, 6.2]} />
          </mesh>
          {LANE_Z.map((z, i) => (
            <mesh key={i} position={[0.7, -0.1, z]} rotation={[0, 0, -0.5]} material={steelDarkMat}>
              <cylinderGeometry args={[0.12, 0.2, 0.9, 10]} />
            </mesh>
          ))}
        </group>

        {/* chutes carrying each sorted class down into its bin — gives the
            sliding material a real surface (it used to fly through the air) */}
        {LANE_Z.map((z, i) => (
          <group key={`chute-${i}`} position={[3.8, 1.4, z]} rotation={[0, 0, -0.35]}>
            <mesh material={steelDarkMat} castShadow receiveShadow>
              <boxGeometry args={[3.5, 0.1, 1.7]} />
            </mesh>
            {[-0.85, 0.85].map((sz, k) => (
              <mesh key={k} position={[0, 0.18, sz]} material={paintMat} castShadow>
                <boxGeometry args={[3.5, 0.34, 0.08]} />
              </mesh>
            ))}
          </group>
        ))}

        {/* the animated sorted flake stream + vibrating deck */}
        <SortStream count={800} />

        {/* three graded bins */}
        {LANE_Z.map((z, i) => (
          <Bin key={i} x={5.4} z={z} hsl={TYPE_HSL[i]} />
        ))}

        {/* air-jet dust at the split, and fine dust drifting off the deck head */}
        <Puffs count={70} center={[2.0, 2.2, 0]} area={[0.5, 1.1, 3.0]} color="#efe6d2" rise={1.4} size={0.5} opacity={0.32} />
        <Puffs count={40} center={[-6.0, 3.9, 0]} area={[1.0, 0.8, 1.8]} color="#e8dcc2" rise={0.9} size={0.45} opacity={0.22} />

        {/* warm key so the yard reads warm; cool rim from the back */}
        <pointLight position={[-2, 8, 8]} color={PALETTE.sun} intensity={34} distance={46} decay={1.6} />
        <pointLight position={[6, 5, -6]} color={PALETTE.sky} intensity={12} distance={30} decay={1.8} />
      </group>
    </group>
  );
}
