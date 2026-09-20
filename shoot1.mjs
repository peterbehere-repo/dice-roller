const t = process.argv[2];
const browser = await (await import('puppeteer-core')).launch({
  executablePath: '/tmp/browsers/chrome/linux-153.0.8010.52/chrome-linux64/chrome',
  args: ['--no-sandbox','--disable-gpu','--headless=new','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({width:900, height:700, deviceScaleFactor:2});
page.on('pageerror', e => console.log('ERR:', e.message));
await page.goto('http://localhost:8080/index.html', {waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,800));
await page.evaluate(ty => {
  window.setSimSpeed(20);
  const btn = [...document.querySelectorAll('#types button')].find(b=>b.textContent.trim()===ty);
  if (btn) btn.click();
  document.getElementById('roll').click();
}, t);
await new Promise(r=>setTimeout(r,12000));
const rolling = await page.evaluate(()=>document.getElementById('roll').textContent);
console.log('BTN:', rolling);
await page.screenshot({path:`/tmp/shots/${t}.png`});
await browser.close();
