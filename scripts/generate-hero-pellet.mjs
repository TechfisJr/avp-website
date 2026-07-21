import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

globalThis.FileReader = class {
  result = null;
  onloadend = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }

  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString("base64")}`;
      this.onloadend?.();
    });
  }
};

const OUT = path.resolve("public/models/hero-pellet.glb");
const SEGMENTS = 56;
const RINGS = 72;
const CAP_RINGS = 14;
const LENGTH = 1.9;
const RADIUS = 0.38;
const BEVEL = 0.18;

function hash(x, y = 0, z = 0) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smooth(x) {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
}

function addVertex(arrays, x, y, z, c) {
  arrays.positions.push(x, y, z);
  arrays.colors.push(c.r, c.g, c.b);
  return arrays.positions.length / 3 - 1;
}

function pelletColor(theta, y, cap = 0) {
  const longitudinal = Math.sin(y * 34 + theta * 5.5) * 0.045;
  const flecks = hash(Math.floor(theta * 18), Math.floor(y * 26), cap) > 0.82 ? -0.12 : 0;
  const warm = 0.075 + hash(theta * 3, y * 2, 5) * 0.018;
  const sat = 0.34 + hash(theta * 7, y * 4, cap) * 0.12;
  const light = 0.36 + longitudinal + flecks + hash(theta * 13, y * 9, cap) * 0.08 + cap * 0.08;
  return new THREE.Color().setHSL(warm, sat, Math.min(0.58, Math.max(0.2, light)));
}

function radiusAt(y, theta) {
  const absY = Math.abs(y);
  const edge = smooth((LENGTH / 2 - absY) / BEVEL);
  const bevelRadius = THREE.MathUtils.lerp(RADIUS * 0.9, RADIUS, edge);
  const longRidge =
    Math.sin(theta * 24 + y * 18) * 0.003 +
    Math.sin(theta * 9 - y * 28) * 0.0035 +
    (hash(Math.floor(theta * 20), Math.floor((y + 1) * 34), 2) - 0.5) * 0.008;
  return bevelRadius + longRidge;
}

function makePelletGeometry() {
  const arrays = { positions: [], colors: [], indices: [] };

  for (let yIndex = 0; yIndex <= RINGS; yIndex++) {
    const v = yIndex / RINGS;
    const y = -LENGTH / 2 + v * LENGTH;
    for (let s = 0; s <= SEGMENTS; s++) {
      const u = s / SEGMENTS;
      const theta = u * Math.PI * 2;
      const r = radiusAt(y, theta);
      const compression = Math.sin(v * Math.PI) * 0.003 * Math.sin(theta * 42 + y * 22);
      addVertex(
        arrays,
        Math.cos(theta) * (r + compression),
        y,
        Math.sin(theta) * (r + compression),
        pelletColor(theta, y)
      );
    }
  }

  for (let yIndex = 0; yIndex < RINGS; yIndex++) {
    for (let s = 0; s < SEGMENTS; s++) {
      const a = yIndex * (SEGMENTS + 1) + s;
      const b = a + 1;
      const c = a + SEGMENTS + 1;
      const d = c + 1;
      arrays.indices.push(a, c, b, b, c, d);
    }
  }

  for (const sign of [-1, 1]) {
    const centerIndex = addVertex(arrays, 0, sign * (LENGTH / 2 + 0.008), 0, pelletColor(0, sign * LENGTH, 1));
    const ringStart = arrays.positions.length / 3;

    for (let ring = 1; ring <= CAP_RINGS; ring++) {
      const rn = ring / CAP_RINGS;
      for (let s = 0; s <= SEGMENTS; s++) {
        const theta = (s / SEGMENTS) * Math.PI * 2;
        const saw = (hash(ring * 17, s * 11, sign) - 0.5) * 0.018;
        const radial = RADIUS * 0.88 * rn + saw * rn;
        const convex = sign * (0.022 * (1 - rn * rn) + (hash(ring, s, 3) - 0.5) * 0.008);
        addVertex(
          arrays,
          Math.cos(theta) * radial,
          sign * LENGTH / 2 + convex,
          Math.sin(theta) * radial,
          pelletColor(theta, sign * LENGTH * rn, 1)
        );
      }
    }

    for (let s = 0; s < SEGMENTS; s++) {
      const a = ringStart + s;
      const b = ringStart + s + 1;
      arrays.indices.push(sign > 0 ? centerIndex : b, sign > 0 ? a : a, sign > 0 ? b : centerIndex);
    }

    for (let ring = 1; ring < CAP_RINGS; ring++) {
      const row = ringStart + (ring - 1) * (SEGMENTS + 1);
      const next = row + SEGMENTS + 1;
      for (let s = 0; s < SEGMENTS; s++) {
        const a = row + s;
        const b = a + 1;
        const c = next + s;
        const d = c + 1;
        arrays.indices.push(sign > 0 ? a : b, sign > 0 ? c : a, sign > 0 ? b : c);
        arrays.indices.push(sign > 0 ? b : d, sign > 0 ? c : b, sign > 0 ? d : c);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(arrays.positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(arrays.colors, 3));
  geometry.setIndex(arrays.indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  return geometry;
}

const material = new THREE.MeshStandardMaterial({
  name: "Compressed wood pellet - matte PBR",
  color: "#9b6b3d",
  roughness: 0.86,
  metalness: 0,
  vertexColors: true,
});

const pellet = new THREE.Mesh(makePelletGeometry(), material);
pellet.name = "HeroWoodPellet";
pellet.userData = {
  realWorldDiameterMm: 6,
  realWorldLengthMm: 18,
  artDirection: "single compressed wood pellet, rounded cut ends, procedural fiber grain, matte PBR",
};

const scene = new THREE.Scene();
scene.name = "AVP hero pellet";
scene.add(pellet);

const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(scene, {
  binary: true,
  includeCustomExtensions: false,
  onlyVisible: true,
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, Buffer.from(glb));
console.log(`Wrote ${OUT} (${Math.round(Buffer.byteLength(Buffer.from(glb)) / 1024)} KB)`);
