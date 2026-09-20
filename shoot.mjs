import puppeteer from 'puppeteer-core';
const exe = '/tmp/browsers/chrome/linux-153.0.8010.52/chrome-linux64/chrome';
const browser = await puppeteer.launch({
  executablePath: exe,
  args: ['--no-sandbox','--disable-gpu','--headless=new','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({width:900, height:700, deviceScaleFactor:2});
const url = 'http://localhost:8080/index.html';
page.on('console', m => console.log('PAGE:', m.text()));
page.on('pageerror', e => console.log('ERR:', e.message));
await page.goto(url, {waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,800));
for (const t of ['d4','d6','d8','d10','d12','d20','d100']) {
  await page.evaluate(type => {
    const s = type.slice(1);
    const btn = [...document.querySelectorAll('#types button')].find(b=>b.textContent.trim()==='d'+parseInt(s));
    if (btn) btn.click();
    const rb = document.getElementById('roll');
    if (rb) rb.click();
  }, t);
  await new Promise(r=>setTimeout(r,15000));
  await page.screenshot({path:`/tmp/shots/${t}.png`});
}
await browser.close();
console.log('done');
