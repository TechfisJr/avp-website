import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { chromium } from "playwright";

const OUT_DIR = path.resolve(".next/visual-smoke");
const URL = process.env.SMOKE_URL ?? "http://localhost:3000/";

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buffer) {
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") throw new Error("Not a PNG");

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
      if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
        throw new Error(`Unsupported PNG format bitDepth=${bitDepth} colorType=${colorType}`);
      }
    }
    if (type === "IDAT") idat.push(data);
    if (type === "IEND") break;
    offset += length + 12;
  }

  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(width * height * channels);
  let src = 0;

  for (let y = 0; y < height; y++) {
    const filter = inflated[src++];
    const row = inflated.subarray(src, src + stride);
    src += stride;
    const out = pixels.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;

    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? out[x - channels] : 0;
      const up = prev ? prev[x] : 0;
      const upLeft = prev && x >= channels ? prev[x - channels] : 0;
      const raw = row[x];
      if (filter === 0) out[x] = raw;
      else if (filter === 1) out[x] = (raw + left) & 255;
      else if (filter === 2) out[x] = (raw + up) & 255;
      else if (filter === 3) out[x] = (raw + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) out[x] = (raw + paeth(left, up, upLeft)) & 255;
      else throw new Error(`Unsupported PNG filter ${filter}`);
    }
  }

  return { width, height, channels, pixels };
}

function analyzePng(file) {
  const { width, height, channels, pixels } = decodePng(fs.readFileSync(file));
  let lit = 0;
  let bright = 0;
  const total = width * height;
  for (let i = 0; i < total; i++) {
    const p = i * channels;
    const r = pixels[p];
    const g = pixels[p + 1];
    const b = pixels[p + 2];
    const a = channels === 4 ? pixels[p + 3] : 255;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (a > 0 && luma > 12) lit++;
    if (a > 0 && luma > 48) bright++;
  }
  return {
    width,
    height,
    litRatio: Number((lit / total).toFixed(4)),
    brightRatio: Number((bright / total).toFixed(4)),
  };
}

async function capture(page, viewportName, label, progress) {
  // Map progress across the cinematic track only — the contact footer now
  // follows it in normal flow, so document height is no longer the timeline.
  await page.evaluate((p) => {
    const track = document.getElementById("cinematic-track");
    const top = track.getBoundingClientRect().top + window.scrollY;
    const span = Math.max(1, track.offsetHeight - window.innerHeight);
    window.scrollTo(0, top + span * p);
  }, progress);
  await page.waitForTimeout(3000);

  const fullPath = path.join(OUT_DIR, `${viewportName}-${label}.png`);
  const canvasPath = path.join(OUT_DIR, `${viewportName}-${label}-canvas.png`);
  await page.screenshot({ path: fullPath, fullPage: false });
  await page.locator("canvas").screenshot({ path: canvasPath });
  const analysis = analyzePng(canvasPath);
  if (analysis.litRatio < 0.01 || analysis.brightRatio < 0.0003) {
    throw new Error(`${viewportName}/${label} canvas appears blank: ${JSON.stringify(analysis)}`);
  }
  return { label, fullPath, canvasPath, analysis };
}

async function runViewport(browser, viewportName, viewport, shots) {
  const page = await browser.newPage({ viewport });
  // Headless Chromium rasterises WebGL in software; this scene runs at a
  // couple of fps here, which is slow enough that Playwright's own
  // visibility/stability checks time out at their defaults.
  page.setDefaultTimeout(90000);
  const consoleMessages = [];
  page.on("console", (msg) => {
    const text = msg.text();
    const ignored =
      text.includes("Download the React DevTools") ||
      text.includes("[HMR] connected") ||
      text.includes("THREE.Clock: This module has been deprecated") ||
      text.includes("GPU stall due to ReadPixels");
    if (!ignored && ["error", "warning"].includes(msg.type())) {
      consoleMessages.push(`${msg.type()}: ${text}`);
    }
  });
  page.on("pageerror", (err) => consoleMessages.push(`pageerror: ${err.message}`));

  await page.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForSelector("canvas", { state: "attached", timeout: 90000 });
  await page.waitForTimeout(4000);

  const results = [];
  for (const shot of shots) {
    results.push(await capture(page, viewportName, shot.label, shot.progress));
  }
  await page.close();

  if (consoleMessages.length > 0) {
    throw new Error(`${viewportName} console errors/warnings:\n${consoleMessages.join("\n")}`);
  }

  return { viewportName, viewport, results };
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const report = [];
  report.push(
    await runViewport(browser, "desktop", { width: 1440, height: 960 }, [
      { label: "hero", progress: 0 },
      { label: "forest", progress: 0.09 },
      { label: "grinder", progress: 0.29 },
    ])
  );
  report.push(
    await runViewport(browser, "mobile", { width: 390, height: 844, isMobile: true }, [
      { label: "hero", progress: 0 },
      { label: "forest", progress: 0.09 },
    ])
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
