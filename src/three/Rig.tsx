"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { CAM_KEYS } from "@/lib/scenes";
import { scroll as scrollStore, flags, focus } from "@/lib/scrollStore";

const tmpPos = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const vel = new THREE.Vector3();
const fwd = new THREE.Vector3();
const right = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);
const bankedUp = new THREE.Vector3();

const smootherstep = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Drives the camera along a Catmull-Rom spline through CAM_KEYS, plus the
 * cinematic feel:
 *   - eased pacing: smootherstep inside each segment so the camera settles into
 *     every waypoint and glides out (a "held shot → move" rhythm, not a constant
 *     crawl)
 *   - banking: it rolls into lateral moves like a real crane/drone
 *   - speed FOV: a touch wider while travelling fast, for a subtle whoosh
 *   - shares its gaze point with the depth-of-field lens (focus)
 */
export default function Rig() {
  const data = useScroll();

  const { posCurve, targetCurve, ats } = useMemo(() => {
    const posCurve = new THREE.CatmullRomCurve3(
      CAM_KEYS.map((k) => new THREE.Vector3(...k.pos)),
      false,
      "catmullrom",
      0.5
    );
    const targetCurve = new THREE.CatmullRomCurve3(
      CAM_KEYS.map((k) => new THREE.Vector3(...k.target)),
      false,
      "catmullrom",
      0.5
    );
    return { posCurve, targetCurve, ats: CAM_KEYS.map((k) => k.at) };
  }, []);

  const offsetToU = (offset: number) => {
    const n = ats.length - 1;
    const o = THREE.MathUtils.clamp(offset, 0, 1);
    for (let i = 0; i < n; i++) {
      if (o <= ats[i + 1]) {
        const span = ats[i + 1] - ats[i] || 1;
        const raw = (o - ats[i]) / span;
        // PARTIAL easing only — a full smootherstep nearly stops at every
        // waypoint, which with closely-spaced keys reads as a pulsing, nauseating
        // stop-go. Blend mostly toward linear for a continuous, gentle glide.
        const local = raw * 0.55 + smootherstep(raw) * 0.45;
        return (i + local) / n;
      }
    }
    return 1;
  };

  const primed = useRef(false);
  const prevPos = useRef(new THREE.Vector3());
  const roll = useRef(0);
  const fov = useRef(42);

  useFrame((state, delta) => {
    const offset = data.offset;
    scrollStore.offset = offset;

    const u = offsetToU(offset);
    posCurve.getPoint(u, tmpPos);
    targetCurve.getPoint(u, tmpTarget);

    const cam = state.camera as THREE.PerspectiveCamera;
    const k = primed.current ? 1 - Math.exp(-delta / 0.12) : 1;
    if (!primed.current || flags.reducedMotion) {
      cam.position.copy(tmpPos);
      lookTarget.copy(tmpTarget);
      prevPos.current.copy(tmpPos);
      primed.current = true;
    } else {
      cam.position.lerp(tmpPos, k);
      lookTarget.lerp(tmpTarget, k);
    }

    // --- cinematic dynamics (skipped under reduced motion) ---
    if (!flags.reducedMotion) {
      // camera velocity this frame
      vel.copy(cam.position).sub(prevPos.current);
      const speed = vel.length() / Math.max(delta, 0.001);

      // a WHISPER of bank into lateral movement — enough to feel alive, far too
      // little to roll the horizon and make the viewer seasick
      fwd.copy(lookTarget).sub(cam.position).normalize();
      right.copy(fwd).cross(worldUp).normalize();
      const lateral = vel.dot(right) / Math.max(delta, 0.001);
      const targetRoll = THREE.MathUtils.clamp(-lateral * 0.004, -0.022, 0.022);
      roll.current = THREE.MathUtils.lerp(roll.current, targetRoll, 0.04);

      // barely-there speed-driven FOV drift
      const targetFov = 42 + THREE.MathUtils.clamp(speed * 0.025, 0, 2.5);
      fov.current = THREE.MathUtils.lerp(fov.current, targetFov, 0.04);
      if (Math.abs(cam.fov - fov.current) > 0.01) {
        cam.fov = fov.current;
        cam.updateProjectionMatrix();
      }

      // apply the bank by rolling the up-vector around the view axis
      bankedUp.copy(worldUp).applyAxisAngle(fwd, roll.current);
      cam.up.copy(bankedUp);
    } else {
      cam.up.copy(worldUp);
    }

    cam.lookAt(lookTarget);
    prevPos.current.copy(cam.position);
    focus.copy(lookTarget);
  });

  return null;
}
