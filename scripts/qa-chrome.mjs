/**
 * QA for the content/chrome layer: bilingual toggle, header nav, the three
 * station modules (specs / stats / markets) and the contact footer.
 *
 * Run the dev or prod server first, then:
 *   npm run qa:chrome            desktop 1440x960
 *   npm run qa:chrome:mobile     390x844 touch viewport
 * Override the target with SMOKE_URL=...
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const URL = process.env.SMOKE_URL ?? "http://localhost:3000/";
const OUT = path.resolve(".next/qa-chrome");
const MOBILE = process.argv.includes("--mobile") || process.env.QA_MOBILE === "1";

const failures = [];
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
};

/** Scroll to a station's dwell point using the same math as src/lib/navigate.ts. */
async function gotoStation(page, index, total = 15) {
  await page.evaluate(
    ({ i, n }) => {
      const track = document.getElementById("cinematic-track");
      const top = track.getBoundingClientRect().top + window.scrollY;
      const span = Math.max(1, track.offsetHeight - window.innerHeight);
      window.scrollTo(0, top + ((i + 0.45) / n) * span);
    },
    { i: index, n: total }
  );
  await page.waitForTimeout(2600);
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
// Headless Chromium rasterises WebGL in software, so this scene runs at a
// couple of frames per second here regardless of how it performs on a real
// GPU. Every wait below is sized for that, not for production.
const page = await browser.newPage({
  viewport: MOBILE ? { width: 390, height: 844 } : { width: 1440, height: 960 },
  isMobile: MOBILE,
  hasTouch: MOBILE,
});

const noise = [
  "Download the React DevTools",
  "[HMR]",
  "[Fast Refresh]",
  "THREE.Clock: This module has been deprecated",
  "GPU stall due to ReadPixels",
];
const problems = [];
page.on("console", (m) => {
  const text = m.text();
  if (m.type() === "error" && !noise.some((n) => text.includes(n))) {
    problems.push(`console.error: ${text}`);
  }
});
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));

page.setDefaultTimeout(60000);

const shot = (name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });

try {
  await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForSelector("canvas", { timeout: 20000 });
  await page.waitForTimeout(2000);

  // --- header ---------------------------------------------------------
  check("header renders", await page.locator("header.site-header").isVisible());
  const navCount = await page.locator(".site-nav li").count();
  check(
    MOBILE ? "mobile menu toggle present" : "nav has 6 sections",
    MOBILE ? await page.locator(".menu-toggle").isVisible() : navCount === 6,
    `count=${navCount}`
  );
  await shot("01-hero-en");

  // --- hero copy in English -------------------------------------------
  const heroEn = await page.locator(".section.align-center .headline").first().innerText();
  check("hero headline is EN", heroEn.includes("Renewable energy"), heroEn.replace(/\n/g, " "));

  // --- language toggle -------------------------------------------------
  await page.locator('.lang-toggle button:has-text("VI")').click();
  await page.waitForTimeout(900);
  const heroVi = await page.locator(".section.align-center .headline").first().innerText();
  check("hero headline switches to VI", heroVi.includes("Năng lượng tái tạo"), heroVi.replace(/\n/g, " "));
  check("document lang follows toggle", (await page.getAttribute("html", "lang")) === "vi");
  // innerText reflects CSS text-transform, so compare case-insensitively
  const navVi = await page.locator(".site-nav li button").first().innerText().catch(() => "");
  if (!MOBILE) check("nav labels translate", navVi.trim().toLowerCase() === "sản phẩm", navVi);
  await shot("02-hero-vi");

  await page.locator('.lang-toggle button:has-text("EN")').click();
  await page.waitForTimeout(700);
  check("toggles back to EN", (await page.getAttribute("html", "lang")) === "en");

  // --- station 9: quality specs ---------------------------------------
  await gotoStation(page, 9);
  const specRows = await page.locator(".spec-row").count();
  const specText = await page.locator(".specs").innerText();
  check("spec table has 5 rows", specRows === 5, `count=${specRows}`);
  check("spec values present", /6–8 mm/.test(specText) && /16\.5–19 MJ\/kg/.test(specText) && /97\.5%/.test(specText));
  check("standard cited", /ISO 17225-2/.test(specText) && /ENplus A1/.test(specText));
  await shot("03-quality-specs");

  // --- station 11: stats count-up --------------------------------------
  await gotoStation(page, 11);
  const statText = await page.locator(".stats").innerText();
  check("stats counted up to final figures", /2,000,000/.test(statText) && /600\+/.test(statText), statText.replace(/\n/g, " | "));
  check("24/7 and Top 5 present", /24\/7/.test(statText) && /Top 5/.test(statText));
  await shot("04-stats");

  // --- station 12: markets ---------------------------------------------
  await gotoStation(page, 12);
  const marketText = await page.locator(".markets").innerText();
  check("three markets listed", (await page.locator(".market").count()) === 3);
  check(
    "JP/KR/EU schemes present",
    /Japan/.test(marketText) && /FIT/.test(marketText) && /South Korea/.test(marketText) && /RPS/.test(marketText) && /Europe/.test(marketText)
  );
  await shot("05-markets");

  // --- contact footer ---------------------------------------------------
  await page.evaluate(() => document.getElementById("contact").scrollIntoView());
  await page.waitForTimeout(1600);
  const footText = await page.locator("#contact").innerText();
  check("footer address", /62-70 B4/.test(footText) && /Sala/.test(footText) && /Ho Chi Minh City/.test(footText));
  check("footer phone", /\+84 28 3636 4427/.test(footText));
  check("footer email", /info@anvietenergy\.com/.test(footText));
  check("no placeholder contact left", !/avpbiomass\.example/.test(await page.content()));
  await shot("06-contact");

  // --- header nav actually navigates ------------------------------------
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
  if (!MOBILE) {
    await page.locator('.site-nav button:has-text("Quality")').click();
    await page.waitForTimeout(2600);
    const visible = await page.locator(".specs").evaluate((el) => {
      const section = el.closest(".section");
      return parseFloat(getComputedStyle(section).opacity);
    });
    check("nav → Quality reveals the spec station", visible > 0.5, `opacity=${visible.toFixed(2)}`);
    await shot("07-nav-quality");
  }

  // --- mobile menu ------------------------------------------------------
  if (MOBILE) {
    await page.locator(".menu-toggle").click();
    await page.waitForTimeout(500);
    check("mobile menu opens", await page.locator("#mobile-nav").isVisible());
    check("menu-toggle reports expanded", (await page.getAttribute(".menu-toggle", "aria-expanded")) === "true");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    check("Escape closes the menu", (await page.locator("#mobile-nav").count()) === 0);
    await shot("08-mobile-menu");
  }

  check("no console errors / page errors", problems.length === 0, problems.slice(0, 4).join(" ‖ "));

  // --- reduced motion ----------------------------------------------------
  // Heavy scroll choreography is off; the copy and figures must still be there.
  const rmPage = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    reducedMotion: "reduce",
  });
  rmPage.setDefaultTimeout(60000);
  const rmProblems = [];
  rmPage.on("pageerror", (e) => rmProblems.push(e.message));
  // forced to the mid tier (?q=1) so the software renderer can actually
  // produce frames; the reduced-motion behaviour under test is tier-agnostic
  await rmPage.goto(URL + "?q=1", { waitUntil: "networkidle", timeout: 60000 });
  await rmPage.waitForTimeout(5000);

  const rmHero = await rmPage.locator(".section.align-center .headline").first().innerText();
  check("reduced-motion: hero copy visible", rmHero.includes("Renewable energy"), rmHero.replace(/\n/g, " "));
  const rmSpecOpacity = await rmPage.locator(".spec-row").first().evaluate((el) => getComputedStyle(el).opacity);
  check("reduced-motion: modules not left at opacity 0", parseFloat(rmSpecOpacity) === 1, `opacity=${rmSpecOpacity}`);
  // Sections are still revealed by scroll position (only the smoothing, camera
  // drift and grain are disabled), so walk to the stats station to read them.
  await gotoStation(rmPage, 11);
  const rmStats = await rmPage.locator(".stats").innerText();
  check("reduced-motion: stats show final figures", /2,000,000/.test(rmStats), rmStats.replace(/\n/g, " | ").slice(0, 60));
  check("reduced-motion: no page errors", rmProblems.length === 0, rmProblems.slice(0, 3).join(" ‖ "));
  await rmPage.screenshot({ path: path.join(OUT, "09-reduced-motion.png") });
  await rmPage.close();
} catch (err) {
  check("run completed", false, err.message);
  await shot("99-failure").catch(() => {});
} finally {
  await browser.close();
}

console.log(`\nScreenshots: ${OUT}`);
if (failures.length) {
  console.error(`\n${failures.length} FAILURE(S):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
