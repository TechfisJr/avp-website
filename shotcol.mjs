import { chromium } from "playwright";
const OUT = process.argv[2] || ".";
const b = await chromium.launch({ args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport:{width:1100,height:660}, deviceScaleFactor:1 });
await p.goto("http://localhost:3000/?q=0",{waitUntil:"load",timeout:90000});
await p.waitForTimeout(14000);
await p.evaluate(()=>document.querySelectorAll('.forest-video,.scene-flash').forEach(e=>e.remove()));
const setScroll=(f)=>p.evaluate((f)=>{const els=[...document.querySelectorAll("div")];const sc=els.find(e=>e.scrollHeight>e.clientHeight+50);if(sc)sc.scrollTop=(sc.scrollHeight-sc.clientHeight)*f;},f);
for(const [n,f] of [["col2-a",0.50],["col2-b",0.54]]){
  await setScroll(f); await p.waitForTimeout(2500);
  try{ await p.screenshot({path:`${OUT}/${n}.png`,timeout:55000,animations:"disabled"}); console.log(n,"ok"); }catch(e){ console.log(n,"fail"); }
}
await b.close();
