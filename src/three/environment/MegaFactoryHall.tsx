"use client";

import * as THREE from "three";
import { STATIONS } from "@/lib/timeline";
import { M } from "../kit/industrial";

const roofLightMat = new THREE.MeshStandardMaterial({
  color: "#d8d0bd",
  emissive: "#dec99a",
  emissiveIntensity: 0.34,
  roughness: 0.5,
  metalness: 0.04,
});

const wallPanelMat = new THREE.MeshStandardMaterial({
  color: "#242423",
  roughness: 0.86,
  metalness: 0.08,
});

const floorMat = new THREE.MeshStandardMaterial({
  color: "#31302c",
  roughness: 0.92,
  metalness: 0.04,
});

export default function MegaFactoryHall() {
  const frontZ = STATIONS[3].pos[2] + 8;
  const backZ = STATIONS[11].pos[2] - 18;
  const length = frontZ - backZ;
  const centerZ = (frontZ + backZ) / 2;
  const centerX = -1.5;
  const width = 46;
  const leftX = centerX - width / 2;
  const rightX = centerX + width / 2;
  const roofY = 10.5;

  const columnZ = Array.from({ length: 13 }, (_, i) => frontZ - 12 - i * 22);
  const lightZ = Array.from({ length: 7 }, (_, i) => frontZ - 22 - i * 34);
  const panelX = [-18, -10, -2, 6, 14];

  return (
    <group>
      <mesh position={[centerX, 0.025, centerZ]} material={floorMat}>
        <boxGeometry args={[width + 8, 0.05, length + 18]} />
      </mesh>

      <mesh position={[centerX, 5.1, backZ]} material={wallPanelMat}>
        <boxGeometry args={[width, 10.2, 0.45]} />
      </mesh>
      <mesh position={[leftX, 5.1, centerZ]} material={wallPanelMat}>
        <boxGeometry args={[0.45, 10.2, length]} />
      </mesh>
      <mesh position={[rightX, 5.1, centerZ - 36]} material={wallPanelMat}>
        <boxGeometry args={[0.45, 10.2, length - 72]} />
      </mesh>

      <mesh position={[centerX, roofY, centerZ]} rotation={[0, 0, -0.055]} material={M.dark}>
        <boxGeometry args={[width + 3, 0.36, length + 10]} />
      </mesh>
      {panelX.map((x) => (
        <mesh key={x} position={[x, roofY - 0.22, centerZ]} rotation={[0, 0, -0.055]} material={M.housing}>
          <boxGeometry args={[0.22, 0.22, length + 12]} />
        </mesh>
      ))}
      {columnZ.map((z) => (
        <group key={z}>
          <mesh position={[leftX + 1.6, 4.7, z]} material={M.housing}>
            <boxGeometry args={[0.32, 9.4, 0.32]} />
          </mesh>
          <mesh position={[rightX - 1.6, 4.7, z]} material={M.housing}>
            <boxGeometry args={[0.32, 9.4, 0.32]} />
          </mesh>
          <mesh position={[centerX, 8.7, z]} material={M.housing}>
            <boxGeometry args={[width - 3.2, 0.22, 0.22]} />
          </mesh>
        </group>
      ))}

      {lightZ.flatMap((z) =>
        [-9, 11].map((x, i) => (
          <group key={`${x}-${z}`} position={[x, 9.25, z]}>
            <mesh material={M.dark}>
              <boxGeometry args={[2.2, 0.14, 0.62]} />
            </mesh>
            <mesh position={[0, -0.09, 0]} material={roofLightMat}>
              <boxGeometry args={[1.75, 0.045, 0.45]} />
            </mesh>
            <pointLight color="#e8d6aa" intensity={i === 0 ? 4.6 : 4.0} distance={12} decay={1.9} />
          </group>
        ))
      )}

      {columnZ.slice(0, -1).map((z) => (
        <mesh key={z} position={[centerX, 6.9, z - 11]} rotation={[0, 0, 0.18]} material={M.housing}>
          <boxGeometry args={[width - 4.5, 0.11, 0.11]} />
        </mesh>
      ))}
    </group>
  );
}
