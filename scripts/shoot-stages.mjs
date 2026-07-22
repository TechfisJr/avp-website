import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const URL = process.env.SHOOT_URL ?? "http://localhost:3000/";
const OUT_DIR = path.resolve(process.env.SHOOT_OUT ?? "docs/qa-shots/vpass");
const STAGES = [
  "sustainable-forest",
  "raw-wood",
  "wood-chips",
  "wood-particles",
  "dry-biomass",
  "pelletization",
  "white-wood-pellet",
  "thermal-upgrading",
  "torrefaction",
  "black-wood-pellet",
  "advanced-bioenergy",
];

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function shoot(name, viewport, isMobile) {
  const page = await browser.newPage({
    viewport,
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: 1,
  });
  // Deterministic: reduce-motion makes jumpToScene instant + smoothing instant.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForSelector(".scroll-world-rail button", { timeout: 15000 });
  await page.waitForTimeout(1200);

  const centers = [];
  for (let i = 0; i < STAGES.length; i++) {
    await page.locator(".scroll-world-rail button").nth(i).click();
    await page.waitForTimeout(650);
    centers.push(await page.evaluate(() => window.scrollY));
    await page.screenshot({
      path: path.join(OUT_DIR, `${name}-${String(i + 1).padStart(2, "0")}-${STAGES[i]}.png`),
      fullPage: false,
    });
  }

  // Value-upgrading interlude: midpoint between white pellet (idx6) and thermal (idx7)
  const interlude = Math.round((centers[6] + centers[7]) / 2);
  await page.evaluate((y) => window.scrollTo(0, y), interlude);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT_DIR, `${name}-interlude.png`), fullPage: false });

  await page.close();
  console.log(`${name} done -> ${OUT_DIR}`);
}

try {
  await shoot("desktop", { width: 1440, height: 900 }, false);
  await shoot("mobile", { width: 390, height: 844 }, true);
} finally {
  await browser.close();
}
