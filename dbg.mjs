import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/tmp/browsers/chrome/linux-153.0.8010.52/chrome-linux64/chrome',
  args: ['--no-sandbox','--disable-gpu','--headless=new','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({width:900,height:700});
page.on('console', m => console.log('PAGE:', m.text()));
page.on('pageerror', e => console.log('ERR:', e.message));
await page.goto('http://localhost:8080/index.html', {waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,1000));
const info = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('#types button')].find(b=>b.textContent.trim()==='d10');
  btn.click();
  document.getElementById('roll').click();
  return {dieType: window.dieType, btns: [...document.querySelectorAll('#types button')].map(b=>b.textContent.trim())};
});
console.log(JSON.stringify(info));
await new Promise(r=>setTimeout(r,6000));
const st = await page.evaluate(() => ({dieType: window.dieType, rolling: window.rolling, n: window.activeDice ? window.activeDice.length : -1}));
console.log(JSON.stringify(st));
await page.screenshot({path:'/tmp/shots/dbg10.png'});
await browser.close();
