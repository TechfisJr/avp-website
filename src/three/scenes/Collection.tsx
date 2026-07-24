"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SCENE_Z } from "@/lib/scenes";
import { PALETTE } from "@/lib/theme";
import { floorMat, paintMat, steelDarkMat, accentMat, metalMat } from "../materials/kit";
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

const IN = 0.4;
const OUT = 0.6;

/** glowing control-panel readout */
const screenMat = new THREE.MeshStandardMaterial({
  color: "#0b1710",
  emissive: new THREE.Color(PALETTE.greenLight),
  emissiveIntensity: 0.8,
  roughness: 0.35,
});

/** factory shell surfaces */
const wallMat = new THREE.MeshStandardMaterial({
  color: "#7d857f",
  roughness: 0.92,
  metalness: 0.05,
});
const stripeMat = new THREE.MeshStandardMaterial({
  color: "#c9a227",
  roughness: 0.85,
  metalness: 0,
});
const lampMat = new THREE.MeshStandardMaterial({
  color: "#22261f",
  emissive: new THREE.Color("#ffe9c0"),
  emissiveIntensity: 2.2,
  roughness: 0.4,
});

/**
 * A flake's position along the sort line, driven by a looping progress p∈[0,1):
 *   fall from hopper → travel the vibrating screen → divert into its lane →
 *   slide down the chute → settle in its bin → repeat.
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
    const s = p / 0.1;
    x = lerp(-7.8, -6.8, s);
    y = lerp(4.7, 3.85, s);
    z = zj;
  } else if (p < 0.48) {
    const s = (p - 0.1) / 0.38;
    x = lerp(-6.8, 0.8, s);
    y = lerp(3.85, 2.05, s);
    z = zj;
    if (!reduced) {
      y += Math.sin(t * 38 + i) * 0.035;
      z += Math.sin(t * 26 + i * 1.7) * 0.05;
    }
  } else if (p < 0.58) {
    const s = (p - 0.48) / 0.1;
    const e = s * s * (3 - 2 * s);
    x = lerp(0.8, 2.3, s);
    y = lerp(2.05, 1.95, s);
    z = lerp(zj, laneZ, e);
  } else if (p < 0.86) {
    // slide DOWN the chute into the bin — stays on the ramp surface
    const s = (p - 0.58) / 0.28;
    const e = s * s * (3 - 2 * s);
    x = lerp(2.3, 5.3 + lx * 0.4, e);
    y = lerp(1.95, 0.85 + hy, e);
    z = lerp(laneZ, laneZ + lz * 0.4, e);
  } else {
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

/** The animated flake stream + the vibrating screen cabinet it rides in. */
function SortStream({ count = 800 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const deck = useRef<THREE.Group>(null);
  const staticDone = useRef(false);

  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.88, metalness: 0 }),
    []
  );

  const P = useMemo(() => {
    const type = new Uint8Array(count);
    const phase = new Float32Array(count);
    const zj = new Float32Array(count);
    const lx = new Float32Array(count);
    const lz = new Float32Array(count);
    const hy = new Float32Array(count);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      type[i] = i % 3;
      phase[i] = Math.random();
      zj[i] = (Math.random() - 0.5) * 3.0;
      lx[i] = (Math.random() - 0.5) * 1.4;
      lz[i] = (Math.random() - 0.5) * 1.4;
      hy[i] = Math.random() * 0.7;
      spd[i] = 0.09 + Math.random() * 0.03;
    }
    return { type, phase, zj, lx, lz, hy, spd };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

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
    if (o < 0.46 || o > OUT) return; // asleep off-screen / during the video seam

    if (flags.reducedMotion) {
      if (staticDone.current) return;
      staticDone.current = true;
      return;
    }

    const t = state.clock.elapsedTime;
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
      {/* the inclined vibrating screen cabinet (buzzes) */}
      <group ref={deck}>
        <group position={[-3, 2.95, 0]} rotation={[0, 0, 0.235]}>
          {/* deck pan */}
          <mesh material={steelDarkMat} castShadow receiveShadow>
            <boxGeometry args={[8.4, 0.16, 4.4]} />
          </mesh>
          {/* screen slats */}
          {Array.from({ length: 9 }).map((_, k) => (
            <mesh key={k} position={[-3.6 + k * 0.9, 0.12, 0]} material={steelDarkMat}>
              <boxGeometry args={[0.06, 0.1, 4.2]} />
            </mesh>
          ))}
          {/* tall panelled side walls */}
          {[-2.15, 2.15].map((z, k) => (
            <group key={k}>
              <mesh position={[0, 0.42, z]} material={paintMat} castShadow>
                <boxGeometry args={[8.4, 0.95, 0.16]} />
              </mesh>
              {/* rib stiffeners */}
              {Array.from({ length: 6 }).map((_, r) => (
                <mesh key={r} position={[-3.5 + r * 1.4, 0.42, z + (k ? 0.11 : -0.11)]} material={steelDarkMat}>
                  <boxGeometry args={[0.12, 0.9, 0.08]} />
                </mesh>
              ))}
              {/* green trim rail along the top */}
              <mesh position={[0, 0.95, z]} material={accentMat} castShadow>
                <boxGeometry args={[8.4, 0.14, 0.24]} />
              </mesh>
            </group>
          ))}
          {/* twin vibration motors on the flanks */}
          {[-2.5, 2.5].map((z, k) => (
            <group key={k} position={[1.6, -0.35, z]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} material={metalMat} castShadow>
                <cylinderGeometry args={[0.42, 0.42, 1.0, 14]} />
              </mesh>
              {Array.from({ length: 7 }).map((_, f) => (
                <mesh key={f} position={[0, 0, -0.42 + f * 0.14]} rotation={[Math.PI / 2, 0, 0]} material={steelDarkMat}>
                  <cylinderGeometry args={[0.5, 0.5, 0.03, 12]} />
                </mesh>
              ))}
            </group>
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

/** Sprung structural frame carrying the screen cabinet. */
function ScreenFrame() {
  const legs: [number, number][] = [
    [-6.4, -2.1],
    [-6.4, 2.1],
    [0.4, -2.1],
    [0.4, 2.1],
  ];
  return (
    <group>
      {legs.map(([x, z], i) => {
        const h = x < -3 ? 3.6 : 2.2; // the deck is inclined, so legs differ
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, h / 2, 0]} material={steelDarkMat} castShadow receiveShadow>
              <boxGeometry args={[0.34, h, 0.34]} />
            </mesh>
            {/* vibration isolator spring on top */}
            <mesh position={[0, h + 0.18, 0]} material={accentMat} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.36, 10]} />
            </mesh>
            {/* base plate */}
            <mesh position={[0, 0.06, 0]} material={steelDarkMat} receiveShadow>
              <boxGeometry args={[0.7, 0.12, 0.7]} />
            </mesh>
          </group>
        );
      })}
      {/* cross-bracing between the legs */}
      {[-2.1, 2.1].map((z, i) => (
        <mesh key={i} position={[-3, 1.5, z]} rotation={[0, 0, 0.35]} material={steelDarkMat} castShadow>
          <boxGeometry args={[7.2, 0.14, 0.14]} />
        </mesh>
      ))}
      <mesh position={[-3, 0.9, 0]} material={steelDarkMat} castShadow>
        <boxGeometry args={[7.0, 0.16, 4.3]} />
      </mesh>
    </group>
  );
}

/** Infeed belt conveyor climbing to the hopper. */
function Conveyor() {
  return (
    <group>
      <group position={[-12.2, 3.1, 0]} rotation={[0, 0, 0.34]}>
        <mesh material={steelDarkMat} castShadow receiveShadow>
          <boxGeometry args={[8.6, 0.2, 2.3]} />
        </mesh>
        {[-1.25, 1.25].map((z, k) => (
          <mesh key={k} position={[0, 0.32, z]} material={paintMat} castShadow>
            <boxGeometry args={[8.6, 0.6, 0.14]} />
          </mesh>
        ))}
        {Array.from({ length: 8 }).map((_, k) => (
          <mesh key={k} position={[-3.7 + k * 1.05, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalMat}>
            <cylinderGeometry args={[0.15, 0.15, 2.4, 10]} />
          </mesh>
        ))}
        {[-4.3, 4.3].map((x, k) => (
          <mesh key={k} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalMat} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 2.5, 16]} />
          </mesh>
        ))}
        {/* drive motor at the head */}
        <mesh position={[4.3, 0, 1.6]} rotation={[Math.PI / 2, 0, 0]} material={steelDarkMat} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.8, 12]} />
        </mesh>
      </group>
      {/* vertical support legs */}
      {[[-14.6, 1.0], [-11.4, 2.1], [-8.6, 3.2]].map(([x, h], i) => (
        <group key={i}>
          {[-1.0, 1.0].map((z, k) => (
            <mesh key={k} position={[x, h / 2, z]} material={steelDarkMat} castShadow>
              <boxGeometry args={[0.2, h, 0.2]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Feed hopper with flanged rim and gussets. */
function Hopper() {
  return (
    <group position={[-7.8, 5.4, 0]}>
      <mesh material={paintMat} castShadow receiveShadow>
        <cylinderGeometry args={[1.75, 0.6, 2.0, 20, 1, true]} />
      </mesh>
      {/* flanged rim (laid flat around the cone mouth) */}
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={accentMat} castShadow>
        <torusGeometry args={[1.75, 0.09, 8, 24]} />
      </mesh>
      {/* square inlet box */}
      <mesh position={[0, 1.35, 0]} material={steelDarkMat} castShadow>
        <boxGeometry args={[3.2, 0.5, 3.2]} />
      </mesh>
      {/* gusset plates */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 1.2, -0.2, Math.sin(a) * 1.2]} rotation={[0, -a, 0]} material={steelDarkMat}>
          <boxGeometry args={[0.08, 1.4, 0.7]} />
        </mesh>
      ))}
      {/* legs */}
      {[[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, -2.6, lz]} material={steelDarkMat} castShadow>
          <boxGeometry args={[0.2, 4.4, 0.2]} />
        </mesh>
      ))}
      {/* rotary feeder under the cone */}
      <mesh position={[0, -1.35, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalMat} castShadow>
        <cylinderGeometry args={[0.62, 0.62, 1.3, 14]} />
      </mesh>
    </group>
  );
}

/**
 * Cyclone separator + blower — the signature of any sawdust handling plant:
 * dust-laden air is drawn off the screen hood, spun out in the cyclone, and the
 * fines drop through the cone while clean air leaves via the stack.
 */
function Cyclone() {
  return (
    <group position={[2.6, 0, -5.6]}>
      {/* barrel */}
      <mesh position={[0, 5.4, 0]} material={metalMat} castShadow receiveShadow>
        <cylinderGeometry args={[1.15, 1.15, 2.6, 22]} />
      </mesh>
      {/* seam bands — a torus is built in the XY plane, so lay it flat to band
          the vertical barrel instead of standing up like a wheel */}
      {[4.4, 6.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={accentMat} castShadow>
          <torusGeometry args={[1.17, 0.07, 8, 26]} />
        </mesh>
      ))}
      {/* cone */}
      <mesh position={[0, 3.1, 0]} material={metalMat} castShadow>
        <cylinderGeometry args={[1.15, 0.34, 2.0, 22]} />
      </mesh>
      {/* fines discharge + airlock */}
      <mesh position={[0, 1.85, 0]} material={steelDarkMat} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 12]} />
      </mesh>
      {/* exhaust stack */}
      <mesh position={[0, 7.6, 0]} material={metalMat} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 2.0, 16]} />
      </mesh>
      <mesh position={[0, 8.7, 0]} material={steelDarkMat} castShadow>
        <cylinderGeometry args={[0.62, 0.62, 0.16, 16]} />
      </mesh>
      {/* tangential inlet duct running back from the screen hood */}
      <mesh position={[-2.4, 6.0, 0.9]} rotation={[0, 0.35, 0]} material={metalMat} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 4.6, 14]} />
      </mesh>
      {/* support legs */}
      {[[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.0, z]} material={steelDarkMat} castShadow>
          <boxGeometry args={[0.16, 2.0, 0.16]} />
        </mesh>
      ))}
    </group>
  );
}

/** Blower scroll + motor feeding the cyclone. */
function Blower() {
  return (
    <group position={[5.6, 0.95, -5.6]}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={metalMat} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.0, 1.1, 20]} />
      </mesh>
      {/* volute outlet */}
      <mesh position={[0, 1.05, 0]} material={metalMat} castShadow>
        <boxGeometry args={[0.9, 1.1, 1.0]} />
      </mesh>
      {/* motor */}
      <mesh position={[1.35, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={steelDarkMat} castShadow>
        <cylinderGeometry args={[0.46, 0.46, 1.4, 14]} />
      </mesh>
      {/* skid */}
      <mesh position={[0.4, -1.05, 0]} material={steelDarkMat} receiveShadow>
        <boxGeometry args={[3.4, 0.22, 1.6]} />
      </mesh>
    </group>
  );
}

/** Maintenance platform + railing behind the line. */
function Platform() {
  return (
    <group position={[-3.5, 0, -4.4]}>
      <mesh position={[0, 1.7, 0]} material={steelDarkMat} castShadow receiveShadow>
        <boxGeometry args={[9.5, 0.14, 1.7]} />
      </mesh>
      {/* posts + rails */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-4.5 + i * 1.8, 2.25, -0.75]} material={steelDarkMat} castShadow>
          <boxGeometry args={[0.09, 1.1, 0.09]} />
        </mesh>
      ))}
      {[2.35, 1.95].map((y, i) => (
        <mesh key={i} position={[0, y, -0.75]} material={accentMat} castShadow>
          <boxGeometry args={[9.5, 0.08, 0.08]} />
        </mesh>
      ))}
      {/* legs */}
      {[-4.4, 0, 4.4].map((x, i) => (
        <mesh key={i} position={[x, 0.85, 0.7]} material={steelDarkMat} castShadow>
          <boxGeometry args={[0.16, 1.7, 0.16]} />
        </mesh>
      ))}
      {/* ladder */}
      <group position={[4.9, 0.85, 0]}>
        {[-0.28, 0.28].map((z, i) => (
          <mesh key={i} position={[0, 0, z]} material={steelDarkMat} castShadow>
            <boxGeometry args={[0.08, 1.7, 0.08]} />
          </mesh>
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, -0.7 + i * 0.35, 0]} material={steelDarkMat}>
            <boxGeometry args={[0.06, 0.06, 0.62]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Control cabinet with a lit readout. */
function ControlPanel() {
  return (
    <group position={[-8.6, 0, -3.6]} rotation={[0, 0.5, 0]}>
      <mesh position={[0, 1.25, 0]} material={paintMat} castShadow receiveShadow>
        <boxGeometry args={[1.5, 2.5, 0.7]} />
      </mesh>
      <mesh position={[0, 1.75, 0.37]} material={screenMat}>
        <boxGeometry args={[0.95, 0.62, 0.04]} />
      </mesh>
      {/* indicator lamps */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 1.15, 0.37]} material={i === 0 ? accentMat : steelDarkMat}>
          <cylinderGeometry args={[0.06, 0.06, 0.05, 10]} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]} material={steelDarkMat} receiveShadow>
        <boxGeometry args={[1.7, 0.12, 0.9]} />
      </mesh>
    </group>
  );
}

/** A collection bin. */
function Bin({ x, z, hsl }: { x: number; z: number; hsl: [number, number, number] }) {
  const chip = useMemo(() => {
    const [h, s, l] = hsl;
    return new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(h, s, l), roughness: 0.7 });
  }, [hsl]);
  return (
    <group position={[x, 0, z]}>
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
      {/* corner posts */}
      {[[-1.25, -1.25], [1.25, -1.25], [-1.25, 1.25], [1.25, 1.25]].map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.78, pz]} material={steelDarkMat} castShadow>
          <boxGeometry args={[0.16, 1.5, 0.16]} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 1.33]} material={chip}>
        <boxGeometry args={[1.2, 0.5, 0.05]} />
      </mesh>
    </group>
  );
}

/**
 * The factory hall the line stands in: concrete floor with painted safety
 * lanes, insulated wall panels on a steel frame, roof trusses and high-bay
 * fixtures. Kept axis-aligned to the view so the building reads square while
 * the machine sits at an angle inside it.
 */
function FactoryShell() {
  return (
    <group>
      {/* concrete floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={floorMat}>
        <planeGeometry args={[90, 80]} />
      </mesh>
      {/* painted safety lanes */}
      {[-10.5, 10.5].map((z, i) => (
        <mesh key={i} position={[0, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]} material={stripeMat}>
          <planeGeometry args={[64, 0.32]} />
        </mesh>
      ))}

      {/* back wall + panel ribs */}
      <group position={[0, 0, -26]}>
        <mesh position={[0, 7.5, 0]} material={wallMat} receiveShadow>
          <boxGeometry args={[90, 15, 0.6]} />
        </mesh>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[0, 1.6 + i * 2.0, 0.36]} material={steelDarkMat}>
            <boxGeometry args={[90, 0.14, 0.14]} />
          </mesh>
        ))}
        {/* structural columns */}
        {[-32, -20, -8, 4, 16, 28].map((x, i) => (
          <mesh key={i} position={[x, 7.5, 0.55]} material={steelDarkMat} castShadow>
            <boxGeometry args={[0.8, 15, 0.5]} />
          </mesh>
        ))}
        {/* roller shutter door */}
        <group position={[22, 0, 0.6]}>
          <mesh position={[0, 3.2, 0]} material={steelDarkMat}>
            <boxGeometry args={[7, 6.4, 0.25]} />
          </mesh>
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[0, 0.5 + i * 0.7, 0.16]} material={metalMat}>
              <boxGeometry args={[7, 0.12, 0.1]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* side walls */}
      {[-34, 34].map((x, i) => (
        <mesh key={i} position={[x, 7.5, -8]} material={wallMat} receiveShadow>
          <boxGeometry args={[0.6, 15, 40]} />
        </mesh>
      ))}

      {/* roof trusses + purlins */}
      {[-22, -11, 0, 11, 22].map((x, i) => (
        <group key={i} position={[x, 13.4, -8]}>
          <mesh material={steelDarkMat} castShadow>
            <boxGeometry args={[0.5, 0.5, 40]} />
          </mesh>
          {/* web bracing */}
          {Array.from({ length: 6 }).map((_, k) => (
            <mesh key={k} position={[0, -0.7, -16 + k * 6.4]} rotation={[0.5, 0, 0]} material={steelDarkMat}>
              <boxGeometry args={[0.2, 1.7, 0.2]} />
            </mesh>
          ))}
        </group>
      ))}
      {[-20, -8, 4].map((z, i) => (
        <mesh key={i} position={[0, 14.2, z]} material={steelDarkMat}>
          <boxGeometry args={[70, 0.4, 0.4]} />
        </mesh>
      ))}

      {/* high-bay light fixtures */}
      {[[-14, -14], [2, -14], [16, -14], [-6, 2], [10, 2]].map(([x, z], i) => (
        <group key={i} position={[x, 10.6, z]}>
          <mesh material={steelDarkMat}>
            <cylinderGeometry args={[0.06, 0.06, 2.6, 6]} />
          </mesh>
          <mesh position={[0, -1.4, 0]} material={steelDarkMat} castShadow>
            <cylinderGeometry args={[0.62, 0.44, 0.34, 14]} />
          </mesh>
          <mesh position={[0, -1.6, 0]} material={lampMat}>
            <cylinderGeometry args={[0.44, 0.44, 0.06, 14]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Scene 3 — the modern sawdust / biomass classification plant. */
export default function Collection() {
  const group = useActiveGroup(IN + 0.02, OUT - 0.01);

  return (
    <group ref={group}>
      <group position={[0, 0, Z]}>
        <FactoryShell />

        {/* the sort line, swung so its output end faces the viewer */}
        <group rotation={[0, -0.38, 0]}>
        <Conveyor />
        <Hopper />
        <ScreenFrame />

        {/* dust hood over the screen head, feeding the cyclone duct */}
        <mesh position={[-5.6, 4.6, 0]} rotation={[0, 0, 0.235]} material={paintMat} castShadow>
          <boxGeometry args={[3.4, 1.1, 4.7]} />
        </mesh>

        {/* diverter head at the sort point + three angled nozzles */}
        <group position={[1.4, 2.35, 0]}>
          {/* painted housing with a green accent band, rather than a solid
              green block — reads as equipment, not a plastic prop */}
          <mesh material={paintMat} castShadow receiveShadow>
            <boxGeometry args={[1.1, 1.0, 6.2]} />
          </mesh>
          <mesh position={[0, 0.34, 0]} material={accentMat} castShadow>
            <boxGeometry args={[1.16, 0.2, 6.26]} />
          </mesh>
          {LANE_Z.map((z, i) => (
            <mesh key={i} position={[0.7, -0.1, z]} rotation={[0, 0, -0.5]} material={steelDarkMat}>
              <cylinderGeometry args={[0.12, 0.2, 0.9, 10]} />
            </mesh>
          ))}
          {/* compressed-air manifold along the top */}
          <mesh position={[-0.1, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalMat} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 6.0, 12]} />
          </mesh>
        </group>

        {/* chutes carrying each sorted class down into its bin */}
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

        <SortStream count={800} />

        {LANE_Z.map((z, i) => (
          <Bin key={i} x={5.4} z={z} hsl={TYPE_HSL[i]} />
        ))}

        <Cyclone />
        <Blower />
        <Platform />
        <ControlPanel />

        {/* air-jet dust at the split, and fine dust drifting off the deck head */}
        <Puffs count={70} center={[2.0, 2.2, 0]} area={[0.5, 1.1, 3.0]} color="#efe6d2" rise={1.4} size={0.5} opacity={0.32} />
        <Puffs count={40} center={[-6.0, 3.9, 0]} area={[1.0, 0.8, 1.8]} color="#e8dcc2" rise={0.9} size={0.45} opacity={0.22} />

          {/* warm key so the line reads warm; cool rim from the back */}
          <pointLight position={[-2, 8, 8]} color={PALETTE.sun} intensity={34} distance={46} decay={1.6} />
          <pointLight position={[6, 5, -6]} color={PALETTE.sky} intensity={12} distance={30} decay={1.8} />
        </group>
      </group>
    </group>
  );
}
