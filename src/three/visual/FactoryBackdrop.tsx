"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { scroll } from "@/lib/scrollStore";
import { N, clamp01, lerp } from "@/lib/timeline";
import type { Quality } from "@/lib/quality";
import { FACTORY_BACKDROPS, type BackdropDef } from "./factoryBackdrops";

// The reality layer: real AVP factory photography composited as a camera-locked
// matte between the BackgroundGradient dome and the 3D machinery. It is NOT a
// DOM image (the canvas is opaque and full-screen) and NOT a slideshow — plates
// are gated to the same scroll windows as the stations + FlowBridges, hazed to
// the live fog color so photo and 3D share one color temperature, dimmed so the
// transformation always leads, and feathered so there is never a hard rectangle.

const IMG_ASPECT = 1672 / 941;
const DIST = 50; // camera-space distance of the matte plane

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform vec3 uTint;
  uniform vec2 uPan, uAnchor;
  uniform float uOpacity, uTintAmt, uDim, uZoom, uPlaneAspect;
  const float uImgAspect = ${IMG_ASPECT.toFixed(6)};

  void main() {
    // object-fit: cover, biased to the crop anchor, with cinematic zoom + pan
    vec2 s = uPlaneAspect > uImgAspect
      ? vec2(1.0, uImgAspect / uPlaneAspect)
      : vec2(uPlaneAspect / uImgAspect, 1.0);
    vec2 uv = (vUv - uAnchor) * s / uZoom + uAnchor + uPan;
    vec3 col = texture2D(uMap, uv).rgb;

    // haze / colour-match toward the active fog colour, stronger toward the top
    float haze = clamp(uTintAmt * mix(0.85, 1.15, vUv.y), 0.0, 1.0);
    col = mix(col, uTint, haze);
    col *= (1.0 - uDim); // keep readable — never crushed to black

    // feathered edges + soft radial vignette → dissolves into the fog dome
    vec2 d = abs(vUv - 0.5) * 2.0;
    float edge = smoothstep(1.0, 0.72, max(d.x, d.y));
    float rad = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(1.1, 1.0)));
    float a = uOpacity * edge * mix(0.72, 1.0, rad);

    gl_FragColor = vec4(col, a);
  }
`;

const sstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** trapezoid opacity envelope for a plate at global scroll t */
function envelope(def: BackdropDef, t: number): number {
  if (t <= def.enterAt || t >= def.exitAt) return 0;
  const up = sstep(def.enterAt, def.holdFrom, t);
  const down = 1 - sstep(def.holdTo, def.exitAt, t);
  return Math.min(up, down) * def.maxOpacity;
}

const fogCol = new THREE.Color("#1a120a");

function BackdropPlane({ def, quality }: { def: BackdropDef; quality: Quality }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const tex = useRef<THREE.Texture | null>(null);
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);

  const url = `${def.src}.webp`;

  const uniforms = useMemo(
    () => ({
      uMap: { value: null as THREE.Texture | null },
      uTint: { value: new THREE.Color("#1a120a") },
      uPan: { value: new THREE.Vector2(0, 0) },
      uAnchor: { value: new THREE.Vector2(def.anchor[0], def.anchor[1]) },
      uOpacity: { value: 0 },
      uTintAmt: { value: def.tintAmt },
      uDim: { value: def.dim },
      uZoom: { value: def.zoomFrom },
      uPlaneAspect: { value: 1.777 },
    }),
    [def]
  );

  // Proximity gate: load the texture only when the camera is within ~2 windows
  // of this plate, dispose it when far — so all plates are never GPU-resident
  // at once. Preloaded plates (journey start) stay latched on.
  const [near, setNear] = useState(def.preload);

  useEffect(() => {
    if (!near) return;
    let disposed = false;
    new THREE.TextureLoader().load(url, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.wrapS = loaded.wrapT = THREE.ClampToEdgeWrapping;
      loaded.minFilter = THREE.LinearFilter;
      loaded.magFilter = THREE.LinearFilter;
      loaded.generateMipmaps = false;
      loaded.anisotropy = quality.tier > 0 ? Math.min(4, gl.capabilities.getMaxAnisotropy()) : 1;
      if (disposed) {
        loaded.dispose();
        return;
      }
      tex.current = loaded;
    });
    return () => {
      disposed = true;
      tex.current?.dispose();
      tex.current = null;
      if (mat.current) mat.current.uniforms.uMap.value = null;
    };
  }, [near, url, gl, quality.tier]);

  useFrame((state) => {
    const t = scroll.t;
    const margin = 2 / N;
    const isNear = def.preload || (t > def.enterAt - margin && t < def.exitAt + margin);
    if (isNear !== near) setNear(isNear);

    const op = envelope(def, t);
    const m = mesh.current;
    const mm = mat.current;
    if (!m || !mm) return;
    if (op < 0.002 || !tex.current) {
      if (m.visible) m.visible = false;
      return;
    }
    if (!m.visible) m.visible = true;

    // push uniforms onto the live material every frame (never rely on the
    // memoized object surviving R3F reconciliation)
    const u = mm.uniforms;
    u.uMap.value = tex.current;
    u.uOpacity.value = op;

    // window progress drives the cinematic push-in + lateral drift
    const p = clamp01((t - def.enterAt) / (def.exitAt - def.enterAt));
    u.uZoom.value = lerp(def.zoomFrom, def.zoomTo, p);
    u.uPan.value.set(
      lerp(def.panFrom[0], def.panTo[0], p),
      lerp(def.panFrom[1], def.panTo[1], p)
    );

    // colour-match to whatever Atmosphere has the fog set to this frame
    const fog = scene.fog as THREE.FogExp2 | null;
    u.uTint.value.copy(fog?.color ?? fogCol);

    // camera-lock: fill the FOV at DIST, oriented to the camera
    const cam = state.camera as THREE.PerspectiveCamera;
    m.position.copy(cam.position);
    m.quaternion.copy(cam.quaternion);
    m.translateZ(-DIST);
    const h = 2 * DIST * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const w = h * (state.size.width / state.size.height);
    m.scale.set(w, h, 1);
    u.uPlaneAspect.value = state.size.width / state.size.height;
  });

  return (
    <mesh
      ref={mesh}
      visible={false}
      renderOrder={-900 + def.station * 0.05}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthTest
        depthWrite={false}
        fog={false}
        toneMapped
      />
    </mesh>
  );
}

export default function FactoryBackdrop({ quality }: { quality: Quality }) {
  return (
    <>
      {FACTORY_BACKDROPS.filter((d) => d.active).map((def) => (
        <BackdropPlane key={def.id} def={def} quality={quality} />
      ))}
    </>
  );
}
