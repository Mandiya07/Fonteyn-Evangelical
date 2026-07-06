import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 403) {
      console.log('403 RESPONSE:', response.url());
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('Goto error:', e.message));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log("HTML length:", html.length);
  if (html.length < 500) {
     console.log("HTML:", html);
  }
  
  await browser.close();
})();
