import { chromium } from "playwright";
const OUT = process.argv[2] || ".";
const b = await chromium.launch({ args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport:{width:1280,height:720}, deviceScaleFactor:1 });
const errs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{if(m.type()==="error")errs.push(m.text())});
await p.goto("http://localhost:3000",{waitUntil:"load",timeout:120000});
await p.waitForTimeout(14000);
const setScroll=(f)=>p.evaluate((f)=>{const els=[...document.querySelectorAll("div")];const sc=els.find(e=>e.scrollHeight>e.clientHeight+50);if(sc)sc.scrollTop=(sc.scrollHeight-sc.clientHeight)*f;},f);
for(const [n,f] of [["f1",0.18],["f2",0.26],["f3",0.34],["f4",0.41]]){
  await setScroll(f); await p.waitForTimeout(1800);
  try{ await p.screenshot({path:`${OUT}/forest-${n}.png`,timeout:120000,animations:"disabled"}); }catch(e){ console.log(n,"fail",e.message.split("\n")[0]); }
}
console.log("errors:", errs.length?JSON.stringify(errs.slice(0,6)):"none");
await b.close();
