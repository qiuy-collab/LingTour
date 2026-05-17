const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push(`console:${msg.type()}:${msg.text()}`));
  page.on('pageerror', err => logs.push(`pageerror:${err.message}`));
  page.on('requestfailed', req => logs.push(`requestfailed:${req.url()} ${req.failure()?.errorText}`));
  await page.goto('http://localhost:3000/interpreting/', { waitUntil: 'networkidle', timeout: 120000 });
  const result = {
    title: await page.title(),
    url: page.url(),
    snippet: (await page.locator('body').innerText()).slice(0, 700),
    logs,
  };
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
