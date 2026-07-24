import { chromium } from "playwright";
const OUT = process.argv[2] || ".";
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1280,height:800}, deviceScaleFactor:1 });
await p.goto("http://localhost:3000",{waitUntil:"load",timeout:60000});
await p.waitForTimeout(7000);
const setScroll=(f)=>p.evaluate((f)=>{const els=[...document.querySelectorAll("div")];const sc=els.find(e=>e.scrollHeight>e.clientHeight+50);if(sc)sc.scrollTop=(sc.scrollHeight-sc.clientHeight)*f;},f);
async function forestShot(name){
  await setScroll(0.25); await p.waitForTimeout(2500); // let scroll.offset settle to ~0.25
  await p.addStyleTag({content:`.canvas-root,.forest-video,.scene-flash,.loader{visibility:hidden!important} body{background:#141a10!important}`});
  await p.waitForTimeout(500);
  try{ await p.screenshot({path:`${OUT}/${name}.png`,timeout:20000,animations:"disabled"});}catch(e){console.log(name,"fail",e.message.split("\n")[0]);}
}
await forestShot("dom2-forest-1280");
await b.close();
