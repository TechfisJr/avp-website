// Convert the real AVP factory background PNGs into web-optimized WebP textures
// for the FactoryBackdrop WebGL layer. Originals are kept untouched.
//
//   node scripts/optimize-backgrounds.mjs
//
// Emits the runtime files under public/backgrounds:
//   02-factory-entry/factory-aerial.webp
//   03-production/factory-interior-01.webp ... factory-interior-05.webp
//
// Textures are GPU-uploaded, so we bias toward small files over pixel-perfect
// fidelity; the plates are hazed, dimmed and sit behind the 3D anyway.

import { mkdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = join(ROOT, "docs/source-assets/backgrounds");
const OUTPUT_DIR = join(ROOT, "public/backgrounds");

const BACKGROUNDS = [
  ["outside/outside-factory.png", "02-factory-entry/factory-aerial.webp"],
  ["inside/01.png", "03-production/factory-interior-01.webp"],
  ["inside/02.png", "03-production/factory-interior-02.webp"],
  ["inside/03.png", "03-production/factory-interior-03.webp"],
  ["inside/04.png", "03-production/factory-interior-04.webp"],
  ["inside/05.png", "03-production/factory-interior-05.webp"],
];

const FULL_QUALITY = 80;

async function main() {
  let saved = 0;
  let after = 0;
  for (const [sourceName, outputName] of BACKGROUNDS) {
    const src = join(SOURCE_DIR, sourceName);
    const full = join(OUTPUT_DIR, outputName);

    const srcBytes = (await stat(src)).size;

    await mkdir(dirname(full), { recursive: true });
    await sharp(src).webp({ quality: FULL_QUALITY, effort: 5 }).toFile(full);

    const fullBytes = (await stat(full)).size;
    saved += srcBytes;
    after += fullBytes;

    const rel = full.replace(ROOT + "/", "");
    console.log(`${rel}\n  png ${(srcBytes / 1e6).toFixed(2)}MB  ->  webp ${(fullBytes / 1e6).toFixed(2)}MB`);
  }
  console.log(
    `\nDone. ${BACKGROUNDS.length} images. Source PNG ${(saved / 1e6).toFixed(1)}MB  ->  WebP set ${(after / 1e6).toFixed(1)}MB`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
