"use client";

import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scroll } from "@/lib/scrollStore";
import { STATIONS, W, bell, smooth } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import ParticleField from "../fx/ParticleField";
import { useStation } from "../useStation";
import { Conveyor } from "../kit/machines";
import { Chips } from "../kit/biomass";
import { M } from "../kit/industrial";
import { BridgeLog } from "../bridges/BridgePrimitives";

const I = 3;
const S = STATIONS[I];

const chipperRed = new THREE.MeshStandardMaterial({
  color: "#a52b1d",
  emissive: "#4c0c08",
  emissiveIntensity: 0.22,
  roughness: 0.46,
  metalness: 0.25,
});

const cabGlass = new THREE.MeshStandardMaterial({
  color: "#7fa8b7",
  emissive: "#19333b",
  emissiveIntensity: 0.18,
  roughness: 0.22,
  metalness: 0.05,
});

function FeedBunker({ getRun }: { getRun: () => number }) {
  return (
    <group position={[3.6, 0, 0]}>
      <mesh position={[0, 1.15, 0]} material={M.accentBlue}>
        <boxGeometry args={[4.7, 0.42, 2.15]} />
      </mesh>
      {[-1, 1].map((z) => (
        <mesh key={z} position={[0, 1.85, z * 1.15]} rotation={[0, 0, z * 0.02]} material={M.accentBlue}>
          <boxGeometry args={[4.9, 1.15, 0.16]} />
        </mesh>
      ))}
      {[-1.9, -0.95, 0, 0.95, 1.9].map((x) => (
        <mesh key={x} position={[x, 0.55, -1.22]} material={M.housing}>
          <boxGeometry args={[0.08, 1.1, 0.08]} />
        </mesh>
      ))}
      <Conveyor length={4.5} width={1.7} height={1.38} speed={0.7} getRun={getRun} />
      <group position={[0.15, 2.3, 0.02]} rotation={[0, 0.05, 0]}>
        {[-0.72, -0.26, 0.2, 0.68].map((z, i) => (
          <group key={z} position={[-0.4 + i * 0.18, i * 0.1, z]} rotation={[0.02 * i, 0.1 - i * 0.04, 0.02]}>
            <BridgeLog length={3.25 + i * 0.16} radius={0.16 + i * 0.015} />
          </group>
        ))}
      </group>
    </group>
  );
}

function CraneGrapple({ getLocal }: { getLocal: () => number }) {
  const boom = useRef<THREE.Group>(null);
  const claw = useRef<THREE.Group>(null);
  const tines = useRef<THREE.Mesh[]>([]);

  useFrame(() => {
    const local = getLocal();
    const grab = smooth((local - 0.16) / 0.28);
    const lift = smooth((local - 0.42) / 0.24);
    const clawOpen = 0.2 + (1 - grab) * 0.7 + lift * 0.35;
    if (boom.current) {
      boom.current.position.y = lift * 0.35;
      boom.current.rotation.z = -0.26 + grab * 0.12;
    }
    if (claw.current) {
      claw.current.position.y = -1.2 + lift * 0.22;
    }
    tines.current.forEach((mesh, i) => {
      const side = i < 3 ? -1 : 1;
      mesh.rotation.y = side * clawOpen;
    });
  });

  return (
    <group position={[5.65, 0, -1.35]} rotation={[0, -0.35, 0]}>
      <mesh position={[0, 0.95, 0]} material={M.dark}>
        <boxGeometry args={[1.15, 1.75, 1]} />
      </mesh>
      <mesh position={[-0.28, 2.12, 0]} rotation={[0, 0, -0.32]} material={M.housing}>
        <boxGeometry args={[0.26, 2.4, 0.24]} />
      </mesh>
      <mesh position={[0.2, 2.15, 0.52]} rotation={[0, 0, -0.32]} material={M.safetyYellow}>
        <boxGeometry args={[0.08, 1.7, 0.08]} />
      </mesh>
      <group ref={boom} position={[-0.8, 3.2, 0]} rotation={[0, 0, -0.26]}>
        <mesh position={[-1.1, 0, 0]} material={M.dark}>
          <boxGeometry args={[2.45, 0.22, 0.22]} />
        </mesh>
        <mesh position={[-1.1, 0.04, 0]} material={M.safetyYellow}>
          <boxGeometry args={[2.1, 0.055, 0.27]} />
        </mesh>
        <mesh position={[-2.24, -0.58, 0]} material={M.steel}>
          <cylinderGeometry args={[0.028, 0.028, 1.1, 8]} />
        </mesh>
        <group ref={claw} position={[-2.24, -1.2, 0]}>
          <mesh position={[0, 0.1, 0]} material={M.steel}>
            <boxGeometry args={[0.52, 0.12, 0.95]} />
          </mesh>
          {[-1, 1].flatMap((side) =>
            [-0.34, 0, 0.34].map((z, i) => (
              <mesh
                key={`${side}-${z}`}
                ref={(mesh) => {
                  if (mesh) tines.current[side < 0 ? i : i + 3] = mesh;
                }}
                position={[side * 0.18, -0.18, z]}
                rotation={[0.55, side * 0.9, 0]}
                material={M.safetyYellow}
              >
                <boxGeometry args={[0.08, 0.88 - i * 0.08, 0.06]} />
              </mesh>
            ))
          )}
          <group position={[0, -0.38, 0]}>
            {[-0.45, -0.15, 0.15, 0.45].map((z, i) => (
              <group key={z} position={[0.02 * i, -0.08 * i, z]} rotation={[0, 0.15 * i, Math.PI / 2]}>
                <BridgeLog length={1.65 + i * 0.18} radius={0.09} />
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

function GrappleFeedHead({ getLocal }: { getLocal: () => number }) {
  const head = useRef<THREE.Group>(null);
  const tines = useRef<THREE.Mesh[]>([]);

  useFrame(() => {
    const local = getLocal();
    const grab = smooth((local - 0.18) / 0.24);
    const drop = smooth((local - 0.42) / 0.24);
    const open = 0.24 + (1 - grab) * 0.48 + drop * 0.32;
    if (head.current) {
      head.current.position.y = 3.35 - drop * 0.34 + Math.sin(local * Math.PI * 2) * 0.025;
      head.current.rotation.z = -0.12 + grab * 0.08;
    }
    tines.current.forEach((mesh, i) => {
      const side = i < 3 ? -1 : 1;
      mesh.rotation.y = side * open;
    });
  });

  return (
    <group ref={head} position={[3.2, 3.35, 0.12]} rotation={[0, -0.12, -0.12]}>
      <mesh position={[0, 0.58, 0]} material={M.steel}>
        <cylinderGeometry args={[0.026, 0.026, 1.16, 8]} />
      </mesh>
      <mesh material={M.steel}>
        <boxGeometry args={[0.62, 0.12, 1.05]} />
      </mesh>
      {[-1, 1].flatMap((side) =>
        [-0.38, 0, 0.38].map((z, i) => (
          <mesh
            key={`${side}-${z}`}
            ref={(mesh) => {
              if (mesh) tines.current[side < 0 ? i : i + 3] = mesh;
            }}
            position={[side * 0.22, -0.24, z]}
            rotation={[0.6, side * 0.62, 0]}
            material={M.safetyYellow}
          >
            <boxGeometry args={[0.08, 0.92 - i * 0.07, 0.065]} />
          </mesh>
        ))
      )}
      <group position={[0.03, -0.72, 0]}>
        {[-0.42, -0.14, 0.14, 0.42].map((z, i) => (
          <group key={z} position={[0.04 * i, -0.05 * i, z]} rotation={[0, 0.16 * i, Math.PI / 2]}>
            <BridgeLog length={1.7 + i * 0.12} radius={0.085} />
          </group>
        ))}
      </group>
    </group>
  );
}

function ChipperBody({ getRun }: { getRun: () => number }) {
  const drum = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (drum.current) drum.current.rotation.x += delta * 18 * getRun();
  });

  return (
    <group position={[0.6, 0, 0]}>
      <mesh position={[0, 1.15, 0]} material={M.accentBlue}>
        <boxGeometry args={[2.55, 1.75, 1.95]} />
      </mesh>
      <mesh position={[0, 2.05, 0]} material={chipperRed}>
        <boxGeometry args={[2.4, 0.58, 1.9]} />
      </mesh>
      <mesh position={[-1.38, 1.42, 0]} rotation={[0, 0, -0.26]} material={M.steel}>
        <boxGeometry args={[0.9, 0.28, 1.42]} />
      </mesh>
      <group ref={drum} position={[0, 1.2, 1.05]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={M.dark}>
          <cylinderGeometry args={[0.62, 0.62, 0.62, 24]} />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.7, Math.sin(a) * 0.7, 0]} rotation={[0, 0, a]} material={M.steel}>
              <boxGeometry args={[0.42, 0.08, 0.16]} />
            </mesh>
          );
        })}
      </group>
      <mesh position={[1.8, 1.52, 0]} rotation={[0, 0, 0.08]} material={M.housing}>
        <boxGeometry args={[1.4, 0.5, 1.65]} />
      </mesh>
      <mesh position={[0, 0.34, 0]} material={M.steel}>
        <boxGeometry args={[3.2, 0.2, 2.3]} />
      </mesh>
    </group>
  );
}

function InclinedDischarge({ getRun }: { getRun: () => number }) {
  return (
    <group position={[-2.25, 0.2, 0]} rotation={[0, 0, 0.58]}>
      <Conveyor length={5.9} width={0.72} height={0.35} speed={1.35} getRun={getRun} />
      {[-2.3, -0.6, 1.1].map((x, i) => (
        <mesh key={x} position={[x, -0.42 - i * 0.15, 0]} rotation={[0, 0, -0.58]} material={M.housing}>
          <boxGeometry args={[0.12, 1.65 + i * 0.45, 0.12]} />
        </mesh>
      ))}
      {[-1, 1].map((z) => (
        <mesh key={z} position={[0, 0.56, z * 0.46]} material={M.steel}>
          <boxGeometry args={[6.05, 0.08, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

function RealisticFeedTable() {
  const legX = [-2.45, -0.85, 0.8, 2.45, 3.95];
  return (
    <group position={[0.98, 0, 0]} rotation={[0, -0.02, 0]}>
      {/* Long open receiving trough on a steel frame, based on the real chipper feed table. */}
      <mesh position={[0.7, 1.02, 0]} material={M.housing}>
        <boxGeometry args={[6.9, 0.18, 1.52]} />
      </mesh>
      {[-1, 1].map((z) => (
        <mesh key={z} position={[0.72, 1.54, z * 0.9]} rotation={[z * -0.18, 0, 0]} material={M.accentBlue}>
          <boxGeometry args={[7.05, 0.92, 0.14]} />
        </mesh>
      ))}
      <mesh position={[4.26, 1.62, 0]} rotation={[0, 0, -0.16]} material={M.accentBlue}>
        <boxGeometry args={[1.18, 0.9, 1.95]} />
      </mesh>
      <mesh position={[0.64, 1.2, 0]} material={M.rubber}>
        <boxGeometry args={[6.7, 0.1, 1.18]} />
      </mesh>
      <mesh position={[0.62, 1.96, 0]} material={M.steel}>
        <boxGeometry args={[6.95, 0.08, 1.72]} />
      </mesh>
      {legX.flatMap((x) =>
        [-0.82, 0.82].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.5, z]} material={M.housing}>
            <boxGeometry args={[0.14, 1.0, 0.14]} />
          </mesh>
        ))
      )}
      {legX.slice(0, -1).map((x) => (
        <group key={x} position={[x + 0.82, 0.62, 0]}>
          {[-1, 1].map((z) => (
            <mesh key={z} position={[0, 0, z * 0.9]} rotation={[0, 0, z * 0.34]} material={M.housing}>
              <boxGeometry args={[1.75, 0.08, 0.08]} />
            </mesh>
          ))}
        </group>
      ))}
      {[-2.2, -1.1, 0, 1.1, 2.2].map((x) => (
        <mesh key={x} position={[x + 0.72, 1.96, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
          <cylinderGeometry args={[0.025, 0.025, 1.55, 8]} />
        </mesh>
      ))}
      <group position={[1.5, 2.05, 0.03]} rotation={[0, 0.02, 0]}>
        {[-0.54, -0.18, 0.18, 0.54].map((z, i) => (
          <group key={z} position={[-0.35 + i * 0.46, i * 0.05, z]} rotation={[0.04 * i, -0.02, 0.02 * i]}>
            <BridgeLog length={3.6 - i * 0.22} radius={0.16 + i * 0.012} />
          </group>
        ))}
      </group>
    </group>
  );
}

function RealisticChipperUnit({ getRun }: { getRun: () => number }) {
  const drum = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (drum.current) drum.current.rotation.z += delta * 18 * getRun();
  });

  return (
    <group position={[-3.25, 0, -0.04]}>
      <mesh position={[0.1, 1.1, 0]} material={M.housing}>
        <boxGeometry args={[1.7, 0.36, 2.06]} />
      </mesh>
      <mesh position={[0.18, 1.36, 0]} material={chipperRed}>
        <boxGeometry args={[1.45, 0.9, 1.88]} />
      </mesh>
      <mesh position={[0.02, 1.8, 0.95]} rotation={[Math.PI / 2, 0, 0]} material={chipperRed}>
        <cylinderGeometry args={[0.55, 0.55, 0.22, 28]} />
      </mesh>
      <mesh position={[-0.95, 1.46, 0]} rotation={[0, 0, -0.18]} material={M.steel}>
        <boxGeometry args={[1.28, 0.18, 1.36]} />
      </mesh>
      <mesh position={[0.98, 1.46, 0.98]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
        <cylinderGeometry args={[0.34, 0.34, 0.36, 20]} />
      </mesh>
      <group ref={drum} position={[0.02, 1.8, 1.08]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={M.dark}>
          <cylinderGeometry args={[0.42, 0.42, 0.26, 22]} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0]} rotation={[0, 0, a]} material={M.steel}>
              <boxGeometry args={[0.28, 0.06, 0.18]} />
            </mesh>
          );
        })}
      </group>
      <mesh position={[-0.15, 0.48, 0]} material={M.housing}>
        <boxGeometry args={[2.4, 0.18, 2.2]} />
      </mesh>
      {[-0.8, 0.8].map((z) => (
        <mesh key={z} position={[0.3, 0.84, z]} material={M.safetyYellow}>
          <boxGeometry args={[1.85, 0.06, 0.06]} />
        </mesh>
      ))}
    </group>
  );
}

function RealisticDischargeConveyor({ getRun }: { getRun: () => number }) {
  return (
    <group position={[-5.18, 2.66, 0]} rotation={[0, 0, -0.46]}>
      <Conveyor length={7.4} width={0.72} height={0.42} speed={1.55} getRun={getRun} />
      <mesh position={[3.88, 0.52, 0]} material={M.housing}>
        <boxGeometry args={[0.72, 0.58, 0.86]} />
      </mesh>
      <mesh position={[-3.92, 0.5, 0]} rotation={[0, 0, -0.16]} material={M.steel}>
        <boxGeometry args={[0.72, 0.16, 0.72]} />
      </mesh>
      {[-1, 1].map((z) => (
        <mesh key={z} position={[0, 0.62, z * 0.5]} material={M.accentBlue}>
          <boxGeometry args={[7.55, 0.16, 0.12]} />
        </mesh>
      ))}
      {[-2.9, -1.25, 0.55, 2.3].map((x, i) => (
        <mesh key={x} position={[x, -0.42 - i * 0.1, 0]} rotation={[0, 0, 0.46]} material={M.housing}>
          <boxGeometry args={[0.11, 1.55 + i * 0.34, 0.11]} />
        </mesh>
      ))}
      {[-1, 1].map((z) => (
        <mesh key={z} position={[0, 0.86, z * 0.46]} material={M.steel}>
          <boxGeometry args={[7.5, 0.08, 0.08]} />
        </mesh>
      ))}
      {[-2.55, -1.3, -0.05, 1.2, 2.45].map((x, i) => (
        <mesh key={x} position={[x, 0.5, (i % 2 === 0 ? -0.1 : 0.12)]} rotation={[0.1 * i, 0.18, 0.04 * i]} material={M.chip}>
          <boxGeometry args={[0.26, 0.055, 0.14]} />
        </mesh>
      ))}
    </group>
  );
}

function LeftWarehouseReceivingBay() {
  return (
    <group>
      <mesh position={[-7.55, 4.05, 2.92]} material={M.housing}>
        <boxGeometry args={[6.8, 0.28, 0.26]} />
      </mesh>
      {[-10.4, -7.5, -4.8].map((x) => (
        <mesh key={x} position={[x, 2.1, 2.86]} material={M.housing}>
          <boxGeometry args={[0.18, 4.2, 0.18]} />
        </mesh>
      ))}
      <mesh position={[-8.65, 0.48, 0.45]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.55, 1, 1]} material={M.chip}>
        <circleGeometry args={[1.55, 28]} />
      </mesh>
      <mesh position={[-13.1, 0.18, 0.82]} rotation={[0, -0.34, 0]} material={M.rubber}>
        <boxGeometry args={[7.2, 0.08, 0.72]} />
      </mesh>
      {[-1, 1].map((z) => (
        <mesh key={z} position={[-13.1, 0.32, 0.82 + z * 0.42]} rotation={[0, -0.34, 0]} material={M.steel}>
          <boxGeometry args={[7.35, 0.08, 0.08]} />
        </mesh>
      ))}
      {[-16.3, -14.7, -13.1, -11.5].map((x, i) => (
        <mesh key={x} position={[x, 0.48, 0.18 + i * 0.12]} rotation={[0.08 * i, -0.34, 0.08 * i]} material={M.chip}>
          <boxGeometry args={[0.38, 0.06, 0.16]} />
        </mesh>
      ))}
      <pointLight position={[-11.5, 7.1, 1.8]} color="#e7d2a8" intensity={15} distance={15} decay={1.8} />
    </group>
  );
}

function SideExcavatorLoader({ getLocal }: { getLocal: () => number }) {
  const boom = useRef<THREE.Group>(null);
  const stick = useRef<THREE.Group>(null);
  const grapple = useRef<THREE.Group>(null);

  useFrame(() => {
    const local = getLocal();
    const lift = smooth((local - 0.08) / 0.28);
    const dump = smooth((local - 0.42) / 0.28);
    if (boom.current) boom.current.rotation.z = -0.78 + lift * 0.14;
    if (stick.current) stick.current.rotation.z = 1.04 - dump * 0.22;
    if (grapple.current) {
      grapple.current.rotation.z = -0.24 + dump * 0.42;
      grapple.current.position.y = -0.05 - dump * 0.18;
    }
  });

  return (
    <group position={[5.05, 0, 1.72]} rotation={[0, 0.02, 0]} scale={0.9}>
      <mesh position={[0, 0.34, 0]} material={M.rubber}>
        <boxGeometry args={[2.34, 0.38, 1.16]} />
      </mesh>
      {[-0.5, 0.5].map((z) => (
        <mesh key={z} position={[0, 0.42, z]} material={M.dark}>
          <boxGeometry args={[2.48, 0.34, 0.22]} />
        </mesh>
      ))}
      {[-0.55, 0.55].flatMap((z) =>
        [-0.92, -0.28, 0.36, 0.96].map((x) => (
          <mesh key={`${x}-${z}`} position={[x, 0.32, z]} rotation={[Math.PI / 2, 0, 0]} material={M.rubber}>
            <cylinderGeometry args={[0.23, 0.23, 0.18, 18]} />
          </mesh>
        ))
      )}
      <mesh position={[0.18, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.housing}>
        <cylinderGeometry args={[0.68, 0.68, 0.46, 24]} />
      </mesh>
      <mesh position={[0.48, 1.0, 0]} material={M.dark}>
        <boxGeometry args={[1.05, 0.68, 1.04]} />
      </mesh>
      <mesh position={[-0.36, 1.1, 0]} material={M.safetyYellow}>
        <boxGeometry args={[1.0, 0.88, 0.96]} />
      </mesh>
      <mesh position={[-0.72, 1.32, 0.5]} rotation={[0.02, 0, -0.12]} material={cabGlass}>
        <boxGeometry args={[0.5, 0.48, 0.055]} />
      </mesh>
      <mesh position={[-0.32, 1.34, 0.5]} material={cabGlass}>
        <boxGeometry args={[0.36, 0.44, 0.055]} />
      </mesh>
      <mesh position={[-0.56, 1.16, 0.52]} material={M.dark}>
        <boxGeometry args={[0.72, 0.045, 0.045]} />
      </mesh>
      <mesh position={[-0.08, 1.15, 0.52]} material={M.dark}>
        <boxGeometry args={[0.045, 0.5, 0.045]} />
      </mesh>
      <mesh position={[-0.4, 1.58, 0]} material={M.dark}>
        <boxGeometry args={[0.98, 0.08, 0.98]} />
      </mesh>
      <mesh position={[1.0, 1.02, 0]} material={M.housing}>
        <boxGeometry args={[0.62, 0.62, 1.0]} />
      </mesh>
      <mesh position={[1.37, 1.16, -0.1]} material={M.dark}>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
      </mesh>
      <group ref={boom} position={[-0.85, 1.58, 0]} rotation={[0, 0, -0.78]}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
          <cylinderGeometry args={[0.18, 0.18, 0.62, 18]} />
        </mesh>
        {[-0.16, 0.16].map((z) => (
          <mesh key={z} position={[-1.36, 0, z]} material={M.housing}>
            <boxGeometry args={[2.95, 0.2, 0.12]} />
          </mesh>
        ))}
        <mesh position={[-1.36, 0.11, 0]} material={M.safetyYellow}>
          <boxGeometry args={[2.52, 0.055, 0.12]} />
        </mesh>
        <mesh position={[-1.48, -0.18, 0]} material={M.steel}>
          <boxGeometry args={[2.05, 0.055, 0.07]} />
        </mesh>
        <mesh position={[-1.28, -0.34, 0]} rotation={[0, 0, 0.26]} material={M.steel}>
          <boxGeometry args={[1.75, 0.08, 0.08]} />
        </mesh>
        <mesh position={[-2.78, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
          <cylinderGeometry args={[0.14, 0.14, 0.56, 18]} />
        </mesh>
        <mesh position={[-2.78, -0.2, 0]} rotation={[0, 0, 0.72]} material={M.steel}>
          <boxGeometry args={[0.08, 0.95, 0.08]} />
        </mesh>
        <group ref={stick} position={[-2.74, 0, 0]} rotation={[0, 0, 1.04]}>
          {[-0.13, 0.13].map((z) => (
            <mesh key={z} position={[-1.05, 0, z]} material={M.housing}>
              <boxGeometry args={[2.25, 0.17, 0.1]} />
            </mesh>
          ))}
          <mesh position={[-1.05, 0.08, 0]} material={M.safetyYellow}>
            <boxGeometry args={[1.82, 0.045, 0.1]} />
          </mesh>
          <mesh position={[-0.84, -0.22, 0]} rotation={[0, 0, -0.22]} material={M.steel}>
            <boxGeometry args={[1.46, 0.06, 0.07]} />
          </mesh>
          <mesh position={[-2.12, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
            <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
          </mesh>
          <group ref={grapple} position={[-2.18, -0.05, 0]} rotation={[0, 0, -0.24]}>
            <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
              <cylinderGeometry args={[0.12, 0.12, 0.74, 14]} />
            </mesh>
            <mesh position={[0, -0.06, 0]} material={M.steel}>
              <boxGeometry args={[0.64, 0.12, 0.92]} />
            </mesh>
            {[-1, 1].flatMap((side) =>
              [-0.32, 0, 0.32].map((z, i) => (
                <mesh key={`${side}-${z}`} position={[side * 0.26, -0.36, z]} rotation={[0.6, side * 0.86, 0]} material={M.dark}>
                  <boxGeometry args={[0.08, 0.86 - i * 0.06, 0.06]} />
                </mesh>
              ))
            )}
            <group position={[-0.1, -0.44, 0]}>
              {[-0.36, -0.1, 0.16, 0.42].map((z, i) => (
                <group key={z} position={[0.04 * i, -0.04 * i, z]} rotation={[0, 0.18 * i, 0.08 * i]}>
                  <BridgeLog length={1.5 + i * 0.16} radius={0.08} />
                </group>
              ))}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function FactoryShell({ fixtureRefs }: { fixtureRefs: MutableRefObject<THREE.MeshStandardMaterial[]> }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={M.concrete}>
        <circleGeometry args={[30, 24]} />
      </mesh>
      {[-5, 0, 5].map((x, i) => (
        <group key={x} position={[x, 7.5, -2.4]}>
          <mesh material={M.dark}>
            <boxGeometry args={[1.7, 0.14, 0.52]} />
          </mesh>
          <mesh position={[0, -0.09, 0]}>
            <boxGeometry args={[1.45, 0.04, 0.42]} />
            <meshStandardMaterial
              ref={(m: THREE.MeshStandardMaterial | null) => {
                if (m) fixtureRefs.current[i] = m;
              }}
              color="#111315"
              emissive="#e4d6b4"
              emissiveIntensity={0}
            />
          </mesh>
          <pointLight position={[0, -0.35, 0]} color="#e4d6b4" intensity={8} distance={11} decay={1.9} />
        </group>
      ))}
    </>
  );
}

/** S03 — wood chipping line: grapple feed, long chipper body, inclined
 * conveyor, and elevated chip drop. This replaces the old screen-deck visual
 * so the chapter reads like actual wood-chip production. */
export default function Screening({ quality }: { quality: Quality }) {
  const { group, state } = useStation(I);
  const q = quality.particleScale;
  const fixtures = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame(() => {
    if (group.current) {
      const visible = scroll.t > (I - 2) * W && scroll.t < (I + 1) * W;
      if (group.current.visible !== visible) group.current.visible = visible;
    }
    if (!state.current.active) return;
    const on = 1.25 * smooth((state.current.local - 0.04) / 0.28);
    fixtures.current.forEach((m) => {
      if (m) m.emissiveIntensity = on;
    });
  });

  const run = () => bell(state.current.local);

  return (
    <group ref={group} position={S.pos}>
      <FactoryShell fixtureRefs={fixtures} />
      <LeftWarehouseReceivingBay />

      <RealisticFeedTable />
      <SideExcavatorLoader getLocal={() => state.current.local} />
      <RealisticChipperUnit getRun={run} />
      <RealisticDischargeConveyor getRun={run} />

      <mesh position={[-8.58, 0.42, 0]} scale={[1.55, 1, 1.05]} material={M.chip}>
        <coneGeometry args={[1.45, 0.86, 26]} />
      </mesh>
      <Chips count={quality.tier === 0 ? 54 : 104} position={[-8.55, 0.82, 0]} area={[1.4, 0.26, 0.82]} />

      <pointLight position={[2.6, 4.2, 2.8]} color="#f7d7a8" intensity={20} distance={13} decay={1.8} />
      <pointLight position={[-4.8, 4.8, 1.4]} color="#ffd69a" intensity={16} distance={14} decay={1.8} />
      <pointLight position={[5.8, 3.5, 2.4]} color="#9ec7df" intensity={7} distance={12} decay={1.8} />

      {/* feed-zone dust and splinters from the grapple drop */}
      <ParticleField
        count={Math.round(90 * q) + 16}
        area={[1.4, 0.45, 1.1]}
        center={[4.0, 2.45, 0.25]}
        colorA="#d4ae78"
        colorB="#8c5a2b"
        size={0.82}
        life={1.4}
        gravity={-2.8}
        spread={0.65}
        shape="shard"
        blending={THREE.NormalBlending}
        getIntensity={() => 0.7 * smooth((state.current.local - 0.16) / 0.28)}
      />

      {/* small chips riding upward on the discharge conveyor */}
      <ParticleField
        count={Math.round(70 * q) + 14}
        area={[3.2, 0.16, 0.42]}
        center={[-5.45, 2.9, 0]}
        colorA="#c99e63"
        colorB="#8c5a2b"
        size={0.42}
        life={1.2}
        rise={0.18}
        spread={0.08}
        curl={0.06}
        shape="shard"
        blending={THREE.NormalBlending}
        getIntensity={() => 0.34 * bell(state.current.local)}
      />

      {/* controlled elevated drop from the conveyor head into the chip pile. */}
      <ParticleField
        count={Math.round(190 * q) + 36}
        area={[0.28, 0.22, 0.32]}
        center={[-8.35, 4.55, 0]}
        colorA="#d9b47a"
        colorB="#8c5a2b"
        size={0.86}
        life={1.25}
        gravity={-6.4}
        spread={0.18}
        curl={0.12}
        shape="shard"
        blending={THREE.NormalBlending}
        getIntensity={() => 0.58 * bell(state.current.local)}
      />

      <ParticleField
        count={Math.round(80 * q) + 12}
        area={[6.4, 2.1, 3.5]}
        center={[-1.1, 2.2, 0]}
        colorA="#e8d9b0"
        colorB="#7a6440"
        size={0.75}
        life={3.2}
        rise={0.12}
        spread={0.24}
        curl={0.4}
        getIntensity={() => 0.3 * bell(state.current.local)}
      />
    </group>
  );
}
