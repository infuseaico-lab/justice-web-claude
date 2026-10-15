#!/usr/bin/env node
/*
 * Renders the raster images the site needs from the SVG artwork:
 *   - Open Graph / social share cards (1200×630) in src/assets/og/
 *   - favicon.ico, apple-touch-icon, PWA icons and a PNG logo in src/assets/img/
 * Requires Playwright with Chromium (npx playwright install chromium) and ImageMagick for favicon.ico.
 *   node scripts/raster.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'src/assets/img');
const OG = path.join(ROOT, 'src/assets/og');
const STATIC = path.join(ROOT, 'src/static');
fs.mkdirSync(OG, { recursive: true });

const services = require('../src/content/services');
const site = require('../src/site.config');

const cards = [
  { file: 'home', image: 'hero-home', eyebrow: 'Southern California', title: 'Energy-efficiency upgrades & retrofits for your home' },
  { file: 'services', image: 'services-cutaway', eyebrow: 'Services', title: 'Water heating, heat pumps, water, turf & LED lighting' },
  { file: 'programs', image: 'programs', eyebrow: 'Programs', title: 'Energy & water programs we work with' },
  { file: 'about', image: 'about', eyebrow: 'About us', title: 'Helping homes use energy and water more wisely' },
  { file: 'contact', image: 'contact', eyebrow: 'Contact', title: 'Request a consultation' },
  ...services.map((s) => ({ file: s.slug, image: s.image, eyebrow: 'Services', title: s.name })),
];

const svgData = (name) => `data:image/svg+xml;base64,${fs.readFileSync(path.join(IMG, `${name}.svg`)).toString('base64')}`;
const logo = fs.readFileSync(path.join(IMG, 'favicon.svg'), 'utf8');

function cardHtml(c) {
  return `<!doctype html><html><head><style>
  body{margin:0;width:1200px;height:630px;font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;}
  .wrap{display:grid;grid-template-columns:560px 640px;height:630px;background:#0f2a3f;}
  .text{padding:64px 56px;display:flex;flex-direction:column;color:#c9d8e2;background:radial-gradient(500px 300px at 0% 100%,rgba(246,185,65,.18),transparent 60%),linear-gradient(140deg,#081a29,#163853);}
  .brand{display:flex;align-items:center;gap:16px;color:#fff;font-weight:800;font-size:28px;}
  .brand svg{width:64px;height:64px}
  .brand small{display:block;font-size:15px;letter-spacing:.18em;color:#14b8a6;font-weight:700}
  .eyebrow{margin-top:auto;color:#f6b941;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:18px}
  h1{color:#fff;font-size:${c.title.length > 40 ? 46 : 56}px;line-height:1.08;margin:14px 0 22px;letter-spacing:-.02em}
  .url{font-size:20px;color:#9fb4c4}
  .img{background:url('${svgData(c.image)}') center/cover no-repeat}
  </style></head><body><div class="wrap"><div class="text">
  <div class="brand">${logo.replace('<svg ', '<svg ')}<div>Justice Energy<small>CO.</small></div></div>
  <div class="eyebrow">${c.eyebrow}</div><h1>${c.title.replace(/&/g, '&amp;')}</h1>
  <div class="url">${site.url.replace(/^https?:\/\//, '')}</div></div><div class="img"></div></div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const c of cards) {
    await page.setContent(cardHtml(c));
    await page.screenshot({ path: path.join(OG, `${c.file}.jpg`), type: 'jpeg', quality: 86 });
  }

  const icon = async (size, out, pad = 0, bg = 'transparent') => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<body style="margin:0;background:${bg}"><div style="width:${size}px;height:${size}px;display:grid;place-items:center">${logo.replace('<svg ', `<svg width="${size - pad * 2}" height="${size - pad * 2}" `)}</div></body>`);
    await page.screenshot({ path: out, omitBackground: bg === 'transparent' });
  };
  await icon(180, path.join(IMG, 'apple-touch-icon.png'), 0, '#0f2a3f');
  await icon(192, path.join(IMG, 'icon-192.png'));
  await icon(512, path.join(IMG, 'icon-512.png'));
  await icon(512, path.join(IMG, 'logo.png'));
  const fav = path.join(IMG, '.fav-48.png');
  await icon(48, fav);
  await browser.close();

  try {
    execFileSync('convert', [fav, '-define', 'icon:auto-resize=48,32,16', path.join(STATIC, 'favicon.ico')]);
  } catch (e) {
    console.warn('ImageMagick not found; favicon.ico not regenerated.');
  }
  fs.rmSync(fav, { force: true });
  console.log(`Rendered ${cards.length} social cards and app icons.`);
})();
