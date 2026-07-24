"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { scroll, flags } from "@/lib/scrollStore";
import { morph, type Locale } from "@/lib/locale";
import { SHAPES, type ShapePoly } from "@/lib/countryShapes";

const O = new THREE.Object3D();
const C = new THREE.Color();
const HIT = new THREE.Vector3();
const APPROACH = new THREE.Vector3();
const LOCAL = new THREE.Vector3();
const DIR = new THREE.Vector3();
const TARGET = new THREE.Vector3();

// Three real wood surfaces for natural variety. Each contributes its actual
// albedo (colour + grain), normal and roughness — the pellets get their wood
// look from the photographed grain itself, not from a painted-on tint, which is
// what stops them reading as plastic. Grain is rotated to run ALONG the pellet
// (axial extrusion striations), the way pressed pellets actually look.
const VARIANTS = [
  { dir: "oak_veneer_01", slug: "oak_veneer_01", tint: "#efe1c2", rough: 0.5, repeat: [1.6, 3.0] as const },
  { dir: "plywood", slug: "plywood", tint: "#e8cfa0", rough: 0.55, repeat: [1.4, 2.6] as const },
  { dir: "wood", slug: "wood_table_001", tint: "#e3c491", rough: 0.52, repeat: [1.6, 2.8] as const },
];

const SHELL = 2.35; // nominal shell radius of the pellet cloud (local units)

// morph timing (seconds): sphere → map, hold, map → sphere
const OUT = 1.0;
const HOLD = 1.4;
const BACK = 1.1;
const smooth01 = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

// --- country silhouettes -------------------------------------------------
// Real outlines (Natural Earth 110m borders) live in ./countryShapes, projected
// to a flat plane. The pellet cloud rearranges into them, keeping the pellets'
// own wood — nothing is painted on.

function pointInPoly(px: number, py: number, poly: ShapePoly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function polyArea(poly: ShapePoly) {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    a += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
  }
  return Math.abs(a / 2);
}

/**
 * Sample `n` points inside a country's outline and map them to world positions
 * on a flat plane facing the camera. Points are distributed across the
 * (possibly many) polygons in proportion to their area — so Japan's islands each
 * get their fair share — while a single global fit keeps the whole country
 * centred and at a consistent on-screen size, aspect preserved.
 */
function sampleShape(polys: ShapePoly[], n: number): THREE.Vector3[] {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const poly of polys) {
    for (const [x, y] of poly) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const fit = Math.min(4.6 / (maxX - minX), 3.4 / (maxY - minY));

  const areas = polys.map(polyArea);
  const total = areas.reduce((a, b) => a + b, 0) || 1;
  const pts: THREE.Vector3[] = [];

  polys.forEach((poly, idx) => {
    // last polygon absorbs the rounding remainder so we always reach exactly n
    const quota = idx === polys.length - 1 ? n - pts.length : Math.round((n * areas[idx]) / total);
    if (quota <= 0) return;

    let pMinX = Infinity;
    let pMaxX = -Infinity;
    let pMinY = Infinity;
    let pMaxY = -Infinity;
    for (const [x, y] of poly) {
      if (x < pMinX) pMinX = x;
      if (x > pMaxX) pMaxX = x;
      if (y < pMinY) pMinY = y;
      if (y > pMaxY) pMaxY = y;
    }
    const pw = pMaxX - pMinX;
    const ph = pMaxY - pMinY;

    let got = 0;
    let guard = 0;
    const maxTries = quota * 200 + 800;
    while (got < quota && guard < maxTries) {
      guard++;
      const x = pMinX + Math.random() * pw;
      const y = pMinY + Math.random() * ph;
      if (!pointInPoly(x, y, poly)) continue;
      pts.push(
        new THREE.Vector3((x - cx) * fit, -(y - cy) * fit, 0.15 + (Math.random() - 0.5) * 0.12)
      );
      got++;
    }
  });

  // guarantee every pellet has a target even if a sliver under-filled
  for (let i = 0; pts.length < n; i++) pts.push(pts[i % Math.max(1, pts.length)].clone());
  if (pts.length > n) pts.length = n;
  return pts;
}

type Item = {
  base: THREE.Vector3; // resting position on the sphere shell
  target: THREE.Vector3; // where this pellet flies during a morph (set per-switch)
  scale: THREE.Vector3;
  rot: THREE.Euler;
  radial: THREE.Vector3; // outward unit direction (for the poke ripple)
  bright: number;
  phase: number; // per-pellet phase for the map's gentle drift
};

/**
 * Scene 1 — "The Seed". Thousands of instanced wood pellets in a loose
 * spherical shell (an Earth the camera dives into), across three real wood
 * surfaces so the pile looks naturally varied. Depth-of-field (see Post) melts
 * the far pellets so the shot reads as a macro photograph.
 *
 * Interactive while it fills the frame (scroll offset < 0.16): it leans toward
 * the pointer, drags to spin (mouse), and pellets bulge outward under the
 * cursor. Switching the site language (see Header) rearranges the whole sphere
 * into that country's map outline — in the pellets' own wood, nothing painted —
 * then reforms the sphere. All motion is disabled under reduced-motion.
 */
export default function HeroPellets({ count = 1500 }: { count?: number }) {
  const gl = useThree((s) => s.gl);
  const group = useRef<THREE.Group>(null);
  const meshes = [
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
  ];

  const paths = VARIANTS.flatMap((v) => [
    `/textures/${v.dir}/${v.slug}_diff_1k.jpg`,
    `/textures/${v.dir}/${v.slug}_nor_gl_1k.jpg`,
    `/textures/${v.dir}/${v.slug}_rough_1k.jpg`,
  ]);
  const tex = useTexture(paths);

  const materials = useMemo(
    () =>
      VARIANTS.map((v, i) => {
        const diff = tex[i * 3];
        const nor = tex[i * 3 + 1];
        const rough = tex[i * 3 + 2];
        [diff, nor, rough].forEach((t) => {
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.center.set(0.5, 0.5);
          t.rotation = Math.PI / 2; // grain axial (along the pellet length)
          t.repeat.set(v.repeat[0], v.repeat[1]);
          t.anisotropy = 8;
        });
        diff.colorSpace = THREE.SRGBColorSpace;
        // MeshPhysicalMaterial: the thin clearcoat is the tell for *pressed
        // sawdust* — real pellets carry a faint waxy sheen from the die that a
        // plain matte surface can't fake.
        return new THREE.MeshPhysicalMaterial({
          map: diff,
          normalMap: nor,
          roughnessMap: rough,
          normalScale: new THREE.Vector2(0.5, 0.5),
          color: v.tint,
          roughness: v.rough,
          metalness: 0,
          envMapIntensity: 1.15,
          clearcoat: 0.18,
          clearcoatRoughness: 0.55,
          sheen: 0.25,
          sheenRoughness: 0.8,
          sheenColor: new THREE.Color("#caa46a"),
        });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // 16 radial segments so each pellet reads as a rounded rod, not a faceted peg.
  const geometry = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16, 1), []);

  const buckets = useMemo(() => {
    const out: Item[][] = [[], [], []];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * golden;
      const shell = SHELL + (Math.random() - 0.5) * 0.5;
      const depth = Math.random() < 0.28 ? 0.45 + Math.random() * 0.5 : 1;
      const radial = new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r).normalize();
      const len = 0.07 + Math.random() * 0.09;
      const dia = 0.4 + Math.random() * 0.12;
      const vv = Math.floor(Math.random() * 3);
      out[vv].push({
        base: radial.clone().multiplyScalar(shell * depth),
        target: new THREE.Vector3(),
        scale: new THREE.Vector3(len * dia, len, len * dia),
        rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        radial,
        bright: 0.82 + Math.random() * 0.32,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return out;
  }, [count]);

  // Per-instance eased "poke" amount (radial push under the cursor).
  const push = useMemo(() => buckets.map((b) => new Float32Array(b.length)), [buckets]);
  // Cached silhouette point clouds, sampled once per country on first use.
  const clouds = useRef<Partial<Record<Locale, THREE.Vector3[]>>>({});

  const drag = useRef({ active: false, lastX: 0, spin: 0, vel: 0 });
  const parallax = useRef(new THREE.Vector2());
  const cursor = useRef("");
  const morphStart = useRef<number | null>(null);

  useLayoutEffect(() => {
    meshes.forEach((ref, vi) => {
      const m = ref.current;
      if (!m) return;
      const items = buckets[vi];
      m.count = items.length;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        O.position.copy(it.base);
        O.rotation.copy(it.rot);
        O.scale.copy(it.scale);
        O.updateMatrix();
        m.setMatrixAt(i, O.matrix);
        C.setScalar(it.bright);
        m.setColorAt(i, C);
      }
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buckets]);

  // Mouse drag-to-spin. Mouse-only so it never steals the touch gesture the page
  // needs for scrolling.
  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || scroll.offset >= 0.16 || flags.reducedMotion) return;
      drag.current.active = true;
      drag.current.lastX = e.clientX;
      drag.current.vel = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const d = (e.clientX - drag.current.lastX) * 0.005;
      drag.current.lastX = e.clientX;
      drag.current.spin += d;
      drag.current.vel = d;
    };
    const onUp = () => {
      drag.current.active = false;
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl]);

  // Assign each pellet a target inside the selected country's outline, and clear
  // any in-flight poke so the sphere is pristine before it flies into the map.
  const beginMorph = (country: Locale, t: number) => {
    let cloud = clouds.current[country];
    if (!cloud) cloud = clouds.current[country] = sampleShape(SHAPES[country], count);
    morphStart.current = t;
    let k = 0;
    meshes.forEach((ref, vi) => {
      const m = ref.current;
      if (!m) return;
      const items = buckets[vi];
      const p = push[vi];
      for (let i = 0; i < items.length; i++) {
        items[i].target.copy(cloud![k % cloud!.length]);
        k++;
        p[i] = 0;
        C.setScalar(items[i].bright);
        m.setColorAt(i, C);
      }
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
  };

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    // pick up a language switch (skip the animation under reduced motion)
    if (morph.pending) {
      morph.pending = false;
      if (!flags.reducedMotion) beginMorph(morph.country, t);
    }

    // morph progress 0→1→0
    let mix = 0;
    if (morphStart.current !== null) {
      const e = t - morphStart.current;
      if (e >= OUT + HOLD + BACK) morphStart.current = null;
      else if (e < OUT) mix = smooth01(e / OUT);
      else if (e < OUT + HOLD) mix = 1;
      else mix = 1 - smooth01((e - OUT - HOLD) / BACK);
    }
    const morphing = mix > 0.001;

    const o = scroll.offset;
    const active = o < 0.16 || morphing;
    if (g.visible !== active) g.visible = active;
    if (!active) {
      if (cursor.current !== "") gl.domElement.style.cursor = cursor.current = "";
      return;
    }

    g.scale.setScalar(1 + THREE.MathUtils.smoothstep(o, 0.05, 0.12) * 0.35);

    if (flags.reducedMotion) {
      g.rotation.set(0, o * 3, 0);
      return;
    }

    // cursor affordance (suppressed while the map is showing)
    const wantCursor = morphing ? "" : drag.current.active ? "grabbing" : "grab";
    if (cursor.current !== wantCursor) gl.domElement.style.cursor = cursor.current = wantCursor;

    // spin inertia
    if (!drag.current.active) {
      drag.current.spin += drag.current.vel;
      drag.current.vel *= 0.94;
      if (Math.abs(drag.current.vel) < 1e-4) drag.current.vel = 0;
    }

    // pointer parallax
    parallax.current.x += (state.pointer.x - parallax.current.x) * 0.06;
    parallax.current.y += (state.pointer.y - parallax.current.y) * 0.06;

    // rotation, flattened toward the camera as the map forms so it's readable
    const steady = 1 - mix;
    g.rotation.y = (t * 0.05 + o * 3 + drag.current.spin + parallax.current.x * 0.28) * steady;
    g.rotation.x = (Math.sin(t * 0.15) * 0.04 - parallax.current.y * 0.16) * steady;
    g.rotation.z = parallax.current.x * 0.05 * steady;

    // --- pointer → shell contact point (poke ripple; only when not morphing) ---
    let hasPoke = false;
    if (!morphing) {
      g.updateMatrixWorld();
      state.raycaster.setFromCamera(state.pointer, state.camera);
      const ray = state.raycaster.ray;
      const R = SHELL * g.scale.x;
      const tca = -ray.origin.dot(ray.direction);
      APPROACH.copy(ray.direction).multiplyScalar(tca).add(ray.origin);
      const d2 = APPROACH.lengthSq();
      if (d2 <= R * R) {
        const thc = Math.sqrt(R * R - d2);
        HIT.copy(ray.direction).multiplyScalar(tca - thc).add(ray.origin);
      } else {
        HIT.copy(APPROACH).setLength(R);
      }
      g.worldToLocal(LOCAL.copy(HIT));
      hasPoke = true;
    }

    const RADIUS = 0.9;
    const STRENGTH = 0.45;
    const ease = 1 - Math.exp(-delta / 0.09);

    meshes.forEach((ref, vi) => {
      const m = ref.current;
      if (!m) return;
      const items = buckets[vi];
      const p = push[vi];
      let colorDirty = false;

      for (let i = 0; i < items.length; i++) {
        const it = items[i];

        if (morphing) {
          // fly from the sphere shell into the map, with a faint living drift
          TARGET.copy(it.target);
          TARGET.z += Math.sin(it.phase + t * 1.6) * 0.05 * mix;
          O.position.copy(it.base).lerp(TARGET, mix);
        } else {
          // poke ripple
          DIR.copy(it.base).sub(LOCAL);
          const dist = DIR.length();
          const fall = hasPoke && dist < RADIUS ? 1 - dist / RADIUS : 0;
          const targetPush = fall * fall * STRENGTH;
          const prev = p[i];
          const next = prev + (targetPush - prev) * ease;
          p[i] = next;
          if (Math.abs(next - prev) < 1e-4 && next < 1e-4) continue;
          O.position.copy(it.radial).multiplyScalar(next).add(it.base);
          C.setScalar(Math.min(1.6, it.bright + next * 1.3));
          m.setColorAt(i, C);
          colorDirty = true;
        }

        O.rotation.copy(it.rot);
        O.scale.copy(it.scale);
        O.updateMatrix();
        m.setMatrixAt(i, O.matrix);
      }

      m.instanceMatrix.needsUpdate = true;
      if (colorDirty && m.instanceColor) m.instanceColor.needsUpdate = true;
    });
  });

  return (
    <group ref={group}>
      {materials.map((mat, i) => (
        <instancedMesh
          key={i}
          ref={meshes[i]}
          args={[geometry, mat, Math.ceil(count / 2)]}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      ))}
    </group>
  );
}
