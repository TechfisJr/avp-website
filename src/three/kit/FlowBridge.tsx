"use client";

import { type ReactNode, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { scroll } from "@/lib/scrollStore";
import { STATIONS, W, smooth, stationLocal } from "@/lib/timeline";

type V3 = [number, number, number];
type GroupProps = Omit<ThreeElements["group"], "position" | "children">;

export type FlowBridgeFrame = {
  progress: number;
  rawProgress: number;
  visible: boolean;
  group: THREE.Group;
  elapsedTime: number;
};

type FlowBridgeProps = {
  from: number;
  to: number;
  exitOffset: V3;
  enterOffset: V3;
  departAt?: number;
  arriveUntil?: number;
  arcHeight?: number;
  holdAtEndUntil?: number;
  orientAlongPath?: boolean;
  children: ReactNode;
  onFrame?: (state: FlowBridgeFrame) => void;
} & GroupProps;

const A = new THREE.Vector3();
const B = new THREE.Vector3();
const P = new THREE.Vector3();
const DIR = new THREE.Vector3();

function stationPoint(index: number, offset: V3, target: THREE.Vector3) {
  const s = STATIONS[index];
  target.set(s.pos[0] + offset[0], s.pos[1] + offset[1], s.pos[2] + offset[2]);
  return target;
}

/**
 * World-space handoff object that lives only during the travel band between
 * two stations. Timing is based on global scroll windows, not clamped
 * stationLocal values, so bridges cannot remain visible after their segment.
 */
export default function FlowBridge({
  from,
  to,
  exitOffset,
  enterOffset,
  departAt = 0.6,
  arriveUntil = 0.25,
  arcHeight = 0,
  holdAtEndUntil = 0,
  orientAlongPath = false,
  children,
  onFrame,
  ...props
}: FlowBridgeProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;

    const start = from * W + W * departAt;
    const end = to * W + W * arriveUntil;
    const near = scroll.t >= start - W * 0.75 && scroll.t <= end + W * 0.45;
    if (!near) {
      if (g.visible) g.visible = false;
      return;
    }

    const rawProgress = (scroll.t - start) / Math.max(0.0001, end - start);
    const holdingAtEnd = rawProgress > 1 && stationLocal(scroll.t, to) <= holdAtEndUntil;
    const visible = rawProgress >= 0 && (rawProgress <= 1 || holdingAtEnd);

    if (g.visible !== visible) g.visible = visible;
    if (!visible) {
      onFrame?.({ progress: rawProgress < 0 ? 0 : 1, rawProgress, visible, group: g, elapsedTime: state.clock.elapsedTime });
      return;
    }

    const progress = holdingAtEnd ? 1 : smooth(rawProgress);
    stationPoint(from, exitOffset, A);
    stationPoint(to, enterOffset, B);
    P.lerpVectors(A, B, progress);
    P.y += Math.sin(progress * Math.PI) * arcHeight;
    g.position.copy(P);

    if (orientAlongPath) {
      DIR.subVectors(B, A).normalize();
      g.rotation.y = Math.atan2(DIR.x, DIR.z);
    }

    onFrame?.({ progress, rawProgress, visible, group: g, elapsedTime: state.clock.elapsedTime });
  });

  return (
    <group ref={group} visible={false} {...props}>
      {children}
    </group>
  );
}
