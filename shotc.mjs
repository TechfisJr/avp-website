import { chromium } from "playwright";
const OUT = process.argv[2] || ".";
const b = await chromium.launch({ args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport:{width:1280,height:800}, deviceScaleFactor:1 });
await p.goto("http://localhost:3000/?q=0",{waitUntil:"load",timeout:120000});
await p.waitForTimeout(12000);
await p.evaluate(()=>document.querySelectorAll('.forest-video,.scene-flash').forEach(e=>e.remove()));
const setScroll=(f)=>p.evaluate((f)=>{const els=[...document.querySelectorAll("div")];const sc=els.find(e=>e.scrollHeight>e.clientHeight+50);if(sc)sc.scrollTop=(sc.scrollHeight-sc.clientHeight)*f;},f);
async function shot(name){ try{ await p.screenshot({path:`${OUT}/${name}.png`,timeout:45000,animations:"disabled"}); }catch(e){ console.log(name,"fail",e.message.split("\n")[0]); } }
await setScroll(0.02); await p.waitForTimeout(1500); await shot("c-hero-1280");
await setScroll(0.25); await p.waitForTimeout(1200); await shot("c-forest-1280");
await b.close();
