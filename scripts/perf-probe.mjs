import { chromium } from "playwright";

const URL = process.env.PROBE_URL ?? "http://localhost:3000/";
const REDUCE = process.env.REDUCE === "1";
const DRIVE = process.env.DRIVE ?? "scrollto"; // "scrollto" | "wheel"

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
if (REDUCE) await p.emulateMedia({ reducedMotion: "reduce" });

const errs = [];
p.on("console", (m) => { if (["error"].includes(m.type())) errs.push(m.text()); });
p.on("pageerror", (e) => errs.push("pageerror: " + e.message));

await p.goto(URL, { waitUntil: "networkidle", timeout: 45000 });
await p.waitForSelector(".scroll-world-rail button", { timeout: 15000 });
await p.waitForTimeout(1200);

await p.evaluate(() => {
  window.__f = { dts: [], last: performance.now(), on: true };
  const step = (now) => { window.__f.dts.push(now - window.__f.last); window.__f.last = now; if (window.__f.on) requestAnimationFrame(step); };
  requestAnimationFrame((t) => { window.__f.last = t; requestAnimationFrame(step); });
});

const DURATION = 4000;
if (DRIVE === "wheel") {
  await p.mouse.move(720, 450);
  const t0 = Date.now();
  while (Date.now() - t0 < DURATION) {
    await p.mouse.wheel(0, 90);
    await p.waitForTimeout(16);
  }
} else {
  await p.evaluate(async (dur) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const start = performance.now();
    while (performance.now() - start < dur) {
      window.scrollTo(0, max * ((performance.now() - start) / dur));
      await new Promise((r) => setTimeout(r, 16));
    }
  }, DURATION);
}

const res = await p.evaluate(() => {
  window.__f.on = false;
  const f = window.__f.dts.slice(2);
  const n = f.length;
  const mean = f.reduce((a, c) => a + c, 0) / n;
  return {
    frames: n,
    avg_fps: +(1000 / mean).toFixed(1),
    mean_dt_ms: +mean.toFixed(1),
    max_dt_ms: +Math.max(...f).toFixed(1),
    dropped_over32ms: f.filter((d) => d > 32).length,
    jank_pct_over32: +((f.filter((d) => d > 32).length / n) * 100).toFixed(1),
  };
});

await b.close();
console.log(JSON.stringify({ mode: REDUCE ? "reduced-motion" : "normal", drive: DRIVE, ...res, errors: errs.slice(0, 5) }, null, 2));
