"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { M } from "./industrial";
import { Chips, WoodResiduePile } from "./biomass";
import { isVisibleInTree } from "./visibility";

type GroupProps = ThreeElements["group"];
import { BELT_VERT, BELT_FRAG } from "../fx/shaders";

/** Parameterized conveyor module: rails, legs, rollers, scrolling belt. */
export function Conveyor({
  length = 8,
  width = 1.4,
  height = 1,
  speed = 1.2,
  getRun,
  ...props
}: {
  length?: number;
  width?: number;
  height?: number;
  speed?: number;
  getRun?: () => number;
} & GroupProps) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const root = useRef<THREE.Group>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSpeed: { value: speed } }),
    [speed]
  );
  useFrame((state) => {
    if (mat.current) {
      if (!isVisibleInTree(root.current)) return;
      const run = getRun ? getRun() : 1;
      mat.current.uniforms.uTime.value = state.clock.elapsedTime * run;
    }
  });
  const legs = Math.max(2, Math.round(length / 3));
  return (
    <group ref={root} {...props}>
      {/* belt */}
      <mesh position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, width]} />
        <shaderMaterial ref={mat} vertexShader={BELT_VERT} fragmentShader={BELT_FRAG} uniforms={uniforms} />
      </mesh>
      {/* side rails */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, height - 0.09, (s * (width + 0.14)) / 2]} material={M.steel}>
          <boxGeometry args={[length, 0.16, 0.1]} />
        </mesh>
      ))}
      {/* rollers */}
      {Array.from({ length: Math.floor(length / 1.2) }, (_, i) => (
        <mesh
          key={i}
          position={[-length / 2 + 0.8 + i * 1.2, height - 0.16, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={M.dark}
        >
          <cylinderGeometry args={[0.09, 0.09, width, 8]} />
        </mesh>
      ))}
      {/* legs */}
      {Array.from({ length: legs }, (_, i) => {
        const x = -length / 2 + 0.6 + (i * (length - 1.2)) / Math.max(1, legs - 1);
        return (
          <mesh key={i} position={[x, height / 2 - 0.1, 0]} material={M.housing}>
            <boxGeometry args={[0.14, height, 0.14]} />
          </mesh>
        );
      })}
    </group>
  );
}

const BAG_NECK_Y = 1.32;
const BAG_LOOP_R = 0.24;

/** Woven-poly FIBC bulk bag — barrel body (rounded base, full belly, cinched
 *  neck) with real strap loops and a printed weight-label patch. The neck
 *  and loops stay their true shape as `fill` changes: only the belly group
 *  scales, and the loops ride down with it, so a half-full bag reads as
 *  slack cloth, not a squashed torus. */
export function JumboBag({
  fill = 1,
  getFill,
  ...props
}: { fill?: number; getFill?: () => number } & GroupProps) {
  const bodyGroup = useRef<THREE.Group>(null);
  const patch = useRef<THREE.Mesh>(null);
  const loops = useRef<(THREE.Mesh | null)[]>([]);

  const bodyGeo = useMemo(() => {
    const profile = [
      new THREE.Vector2(0.02, 0),
      new THREE.Vector2(0.36, 0.02),
      new THREE.Vector2(0.5, 0.13),
      new THREE.Vector2(0.56, 0.42),
      new THREE.Vector2(0.57, 0.72),
      new THREE.Vector2(0.53, 0.98),
      new THREE.Vector2(0.4, 1.16),
      new THREE.Vector2(BAG_LOOP_R + 0.02, BAG_NECK_Y - 0.06),
      new THREE.Vector2(BAG_LOOP_R, BAG_NECK_Y),
    ];
    const g = new THREE.LatheGeometry(profile, 22);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const theta = Math.atan2(v.z, v.x);
      const weave = 1 + 0.018 * Math.sin(theta * 14) + 0.012 * Math.sin(v.y * 20 + theta * 6);
      const sag = 0.02 * Math.sin(theta * 3 + v.y * 1.4);
      p.setXYZ(i, v.x * weave + sag, v.y, v.z * weave + sag);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  const loopGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, 0.14, 0),
      new THREE.Vector3(0.05, 0.24, 0),
      new THREE.Vector3(-0.05, 0.24, 0),
      new THREE.Vector3(-0.05, 0.14, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.028, 6, true);
  }, []);

  const applyFill = (f: number) => {
    const bodyFill = 0.3 + 0.7 * f;
    const neckY = BAG_NECK_Y * bodyFill;
    if (bodyGroup.current) bodyGroup.current.scale.y = bodyFill;
    if (patch.current) patch.current.position.set(0, neckY * 0.42, 0.565 * Math.min(1, bodyFill + 0.3));
    loops.current.forEach((m, i) => {
      if (!m) return;
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      m.position.set(Math.cos(a) * BAG_LOOP_R, neckY, Math.sin(a) * BAG_LOOP_R);
    });
  };

  useFrame(() => {
    if (!getFill) return;
    if (!isVisibleInTree(bodyGroup.current)) return;
    applyFill(getFill());
  });

  const initialFill = 0.3 + 0.7 * fill;
  const initialNeckY = BAG_NECK_Y * initialFill;

  return (
    <group {...props}>
      <group ref={bodyGroup} scale={[1, initialFill, 1]}>
        <mesh geometry={bodyGeo} material={M.cloth} />
      </group>
      {/* printed weight-label patch */}
      <mesh ref={patch} position={[0, initialNeckY * 0.42, 0.565 * Math.min(1, initialFill + 0.3)]}>
        <planeGeometry args={[0.42, 0.3]} />
        <meshStandardMaterial color="#efe7d4" roughness={0.85} metalness={0} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh
            key={i}
            ref={(m) => {
              loops.current[i] = m;
            }}
            geometry={loopGeo}
            material={M.dark}
            position={[Math.cos(a) * BAG_LOOP_R, initialNeckY, Math.sin(a) * BAG_LOOP_R]}
            rotation={[0, -a, 0]}
          />
        );
      })}
    </group>
  );
}

import { createLogEndMaterial } from "../visual/materials";
const logEndMat = createLogEndMaterial();

const cargoLogs = [
  { p: [-0.9, 1.76, -0.42] as [number, number, number], r: 0.24, l: 4.1 },
  { p: [-0.9, 1.76, 0.42] as [number, number, number], r: 0.22, l: 4.1 },
  { p: [-0.9, 2.14, -0.16] as [number, number, number], r: 0.23, l: 4.0 },
  { p: [-0.9, 2.14, 0.32] as [number, number, number], r: 0.21, l: 4.0 },
  { p: [-0.9, 2.48, 0.08] as [number, number, number], r: 0.22, l: 3.9 },
];

const ease01 = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

/** Stylized flatbed truck silhouette with emissive running lights. */
export function Truck({
  lightsOn = true,
  cargoLoad = 1,
  getCargoLoad,
  cargoType = "logs",
  ...props
}: {
  lightsOn?: boolean;
  cargoLoad?: number;
  getCargoLoad?: () => number;
  cargoType?: "logs" | "residue";
} & GroupProps) {
  const cargo = useRef<(THREE.Group | null)[]>([]);
  const residueCargo = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!getCargoLoad) return;
    const visibilityAnchor = cargoType === "logs" ? cargo.current[0] : residueCargo.current;
    if (!isVisibleInTree(visibilityAnchor)) return;
    const load = Math.min(1, Math.max(0, getCargoLoad ? getCargoLoad() : cargoLoad));
    if (residueCargo.current) {
      const u = ease01(load);
      residueCargo.current.visible = u > 0.03;
      residueCargo.current.position.y = 1.08 + Math.sin(u * Math.PI) * 0.12;
      residueCargo.current.scale.set(0.72 + u * 0.18, 0.55 + u * 0.25, 0.66 + u * 0.18);
    }
    cargo.current.forEach((log, i) => {
      if (!log) return;
      const spec = cargoLogs[i];
      const u = ease01((load - i * 0.1) / 0.34);
      log.visible = u > 0.01;
      const sx = spec.p[0] - 3.35 - i * 0.12;
      const sy = spec.p[1] + 1.55 + i * 0.18;
      const sz = spec.p[2] + (i % 2 === 0 ? -1.35 : 1.35);
      log.position.set(
        sx + (spec.p[0] - sx) * u,
        sy + (spec.p[1] - sy) * u + Math.sin(u * Math.PI) * 0.55,
        sz + (spec.p[2] - sz) * u
      );
      log.rotation.set(0, (1 - u) * (i % 2 === 0 ? -0.55 : 0.55), (1 - u) * 0.35);
      log.scale.setScalar(0.78 + u * 0.22);
    });
  });

  return (
    <group {...props}>
      {/* Cabin Body */}
      <mesh position={[2.1, 1.15, 0]} material={M.housing}>
        <boxGeometry args={[1.6, 1.5, 2]} />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[2.91, 1.35, 0]} material={M.dark}>
        <boxGeometry args={[0.02, 0.7, 1.76]} />
      </mesh>

      {/* Side Windows */}
      {[-1, 1].map((s) => (
        <mesh key={`window-${s}`} position={[2.1, 1.35, s * 1.01]} material={M.dark}>
          <boxGeometry args={[0.72, 0.52, 0.02]} />
        </mesh>
      ))}

      {/* Front Grill */}
      <mesh position={[2.91, 0.82, 0]} material={M.dark}>
        <boxGeometry args={[0.02, 0.36, 1.3]} />
      </mesh>

      {/* Front Bumper */}
      <mesh position={[2.93, 0.54, 0]} material={M.steel}>
        <boxGeometry args={[0.12, 0.22, 2.16]} />
      </mesh>

      {/* Chassis Frame */}
      <mesh position={[-0.9, 0.75, 0]} material={M.dark}>
        <boxGeometry args={[4.6, 0.3, 2.1]} />
      </mesh>

      {/* Flatbed Deck */}
      <mesh position={[-0.9, 1.25, 0]} material={M.steel}>
        <boxGeometry args={[4.4, 0.7, 1.9]} />
      </mesh>

      {/* Vertical Exhaust Stack */}
      <mesh position={[1.16, 1.56, -0.84]} material={M.steel}>
        <cylinderGeometry args={[0.06, 0.06, 1.5, 8]} />
      </mesh>

      {/* Wheels with Hubcaps */}
      {[-2.6, -1.2, 1.7].flatMap((x) =>
        [-1, 1].map((s) => (
          <group key={`wheel-${x}-${s}`} position={[x, 0.42, s * 0.95]}>
            {/* Tire */}
            <mesh rotation={[Math.PI / 2, 0, 0]} material={M.dark}>
              <cylinderGeometry args={[0.42, 0.42, 0.3, 14]} />
            </mesh>
            {/* Hubcap rim */}
            <mesh position={[0, 0, s * 0.16]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
              <cylinderGeometry args={[0.18, 0.18, 0.02, 10]} />
            </mesh>
          </group>
        ))
      )}

      {/* Headlights */}
      {lightsOn && [-1, 1].map((s) => (
        <mesh key={`headlight-${s}`} position={[2.92, 0.82, s * 0.75]} rotation={[0, 0, Math.PI / 2]} material={M.steel}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 10]} />
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.01, 10]} />
            <meshStandardMaterial emissive="#ffd9a0" emissiveIntensity={4} color="#fff" />
          </mesh>
        </mesh>
      ))}

      {/* Staggered cargo logs: empty bed -> loaded bed when cargoLoad rises. */}
      {cargoType === "logs" && cargoLogs.map((log, i) => (
        <group
          key={`cargo-${i}`}
          ref={(node) => {
            cargo.current[i] = node;
          }}
          position={log.p}
          visible={!getCargoLoad && cargoLoad > 0.01}
        >
          {/* Log Bark */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={M.bark}>
            <cylinderGeometry args={[log.r, log.r * 0.98, log.l, 12, 1, true]} />
          </mesh>
          {/* End Cap A */}
          <mesh position={[log.l * 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={logEndMat}>
            <cylinderGeometry args={[log.r * 0.98, log.r * 0.98, 0.01, 12]} />
          </mesh>
          {/* End Cap B */}
          <mesh position={[-log.l * 0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={logEndMat}>
            <cylinderGeometry args={[log.r * 0.98, log.r * 0.98, 0.01, 12]} />
          </mesh>
        </group>
      ))}

      {cargoType === "residue" && (
        <group
          ref={residueCargo}
          position={[-0.95, 1.1, 0]}
          scale={[0.9, 0.8, 0.84]}
          visible={!getCargoLoad && cargoLoad > 0.01}
        >
          <WoodResiduePile count={58} area={[1.8, 0.42, 0.75]} />
          <mesh position={[0.05, -0.03, 0]} material={M.dark}>
            <boxGeometry args={[4.1, 0.08, 1.74]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Small in-plant chip cart — used after chipping, never for full logs. */
export function SmallChipCart({
  chipLoad = 1,
  getChipLoad,
  getDump,
  ...props
}: { chipLoad?: number; getChipLoad?: () => number; getDump?: () => number } & GroupProps) {
  const bed = useRef<THREE.Group>(null);
  const chips = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!getChipLoad && !getDump) return;
    if (!isVisibleInTree(bed.current)) return;
    const load = Math.min(1, Math.max(0, getChipLoad ? getChipLoad() : chipLoad));
    const dump = Math.min(1, Math.max(0, getDump ? getDump() : 0));
    if (bed.current) {
      bed.current.rotation.z = -dump * 0.32;
      bed.current.position.y = 0.92 + dump * 0.08;
    }
    if (chips.current) {
      chips.current.visible = load > 0.03;
      chips.current.position.set(dump * 0.28, 1.12 - dump * 0.08, 0);
      chips.current.rotation.z = -dump * 0.32;
      chips.current.scale.setScalar(0.78 + load * 0.22);
    }
  });

  return (
    <group {...props}>
      <mesh position={[0, 0.42, 0]} material={M.dark}>
        <boxGeometry args={[2.1, 0.18, 1.15]} />
      </mesh>
      <group ref={bed} position={[0, 0.92, 0]}>
        <mesh material={M.steel}>
          <boxGeometry args={[1.95, 0.2, 1.1]} />
        </mesh>
        {[-1, 1].map((z) => (
          <mesh key={z} position={[0, 0.28, z * 0.58]} material={M.housing}>
            <boxGeometry args={[1.95, 0.52, 0.08]} />
          </mesh>
        ))}
        <mesh position={[-1.02, 0.28, 0]} material={M.housing}>
          <boxGeometry args={[0.08, 0.52, 1.1]} />
        </mesh>
      </group>
      <group ref={chips}>
        <Chips count={34} position={[0, 1.08, 0]} area={[0.72, 0.16, 0.36]} />
      </group>
      {[-0.68, 0.68].flatMap((x) =>
        [-0.58, 0.58].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.28, z]} rotation={[Math.PI / 2, 0, 0]} material={M.dark}>
            <cylinderGeometry args={[0.24, 0.24, 0.16, 14]} />
          </mesh>
        ))
      )}
      <mesh position={[0.95, 0.9, 0]} material={M.housing}>
        <boxGeometry args={[0.55, 0.75, 0.86]} />
      </mesh>
      <mesh position={[1.24, 0.98, 0]} material={M.dark}>
        <boxGeometry args={[0.04, 0.38, 0.72]} />
      </mesh>
    </group>
  );
}

/** Inclined vibrating screen deck on spring mounts. */
export function ScreenDeck({
  getVibe,
  w = 4,
  d = 2.4,
  ...props
}: { getVibe?: () => number; w?: number; d?: number } & GroupProps) {
  const deck = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!deck.current) return;
    if (!isVisibleInTree(deck.current)) return;
    const amp = (getVibe ? getVibe() : 1) * 0.03;
    deck.current.position.y = 1.35 + Math.sin(state.clock.elapsedTime * 34) * amp;
  });
  return (
    <group {...props}>
      <group ref={deck} rotation={[0, 0, -0.14]}>
        <mesh material={M.steel}>
          <boxGeometry args={[w, 0.12, d]} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[-w / 2 + ((i + 0.5) * w) / 9, 0.07, 0]} material={M.dark}>
            <boxGeometry args={[0.05, 0.03, d * 0.94]} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0.28, (s * d) / 2] } material={M.housing}>
            <boxGeometry args={[w, 0.45, 0.08]} />
          </mesh>
        ))}
      </group>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}${z}`} position={[(x * w) / 2.4, 0.6, (z * d) / 2.6]} material={M.dark}>
            <cylinderGeometry args={[0.09, 0.13, 1.2, 8]} />
          </mesh>
        ))
      )}
    </group>
  );
}

/** Simple intake hopper. */
export function Hopper(props: GroupProps) {
  return (
    <group {...props}>
      <mesh material={M.housing}>
        <cylinderGeometry args={[1.2, 0.35, 1.5, 4, 1, true]} />
      </mesh>
      <mesh position={[0, 0.8, 0]} material={M.steel}>
        <boxGeometry args={[1.9, 0.12, 1.9]} />
      </mesh>
    </group>
  );
}
