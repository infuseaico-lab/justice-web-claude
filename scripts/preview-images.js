// Dev helper: renders every SVG illustration into one contact sheet PNG for review.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const dir = path.join(__dirname, '..', 'src', 'assets', 'img');
  const out = process.argv[2] || 'contact-sheet.png';
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.svg') && f !== 'favicon.svg');
  const html = `<body style="margin:0;display:grid;grid-template-columns:repeat(3,600px);gap:8px;background:#333">${files
    .map((f) => `<div><img src="data:image/svg+xml;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}" width="600"><div style="color:#fff;font:14px sans-serif">${f}</div></div>`)
    .join('')}</body>`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1820, height: 800 } });
  await page.setContent(html);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
})();
