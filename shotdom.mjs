import { chromium } from "playwright";
const OUT = process.argv[2] || ".";
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1280,height:800}, deviceScaleFactor:1 });
await p.goto("http://localhost:3000",{waitUntil:"load",timeout:60000});
await p.waitForTimeout(6000);
// hide the heavy WebGL canvas + video so we can capture the copy layout fast;
// paint a dark backdrop like the real scenes
await p.addStyleTag({content:`.canvas-root,.forest-video,.scene-flash,.loader{display:none!important} body{background:#0c0e0a!important}`});
const setScroll=(f)=>p.evaluate((f)=>{const els=[...document.querySelectorAll("div")];const sc=els.find(e=>e.scrollHeight>e.clientHeight+50);if(sc)sc.scrollTop=(sc.scrollHeight-sc.clientHeight)*f;},f);
async function shot(n){ try{ await p.screenshot({path:`${OUT}/${n}.png`,timeout:20000,animations:"disabled"});}catch(e){console.log(n,"fail",e.message.split("\n")[0]);} }
await setScroll(0.02); await p.waitForTimeout(600); await shot("dom-hero-1280");
await setScroll(0.25); await p.waitForTimeout(600); await shot("dom-forest-1280");
await p.setViewportSize({width:1024,height:720});
await setScroll(0.02); await p.waitForTimeout(600); await shot("dom-hero-1024");
await b.close();
