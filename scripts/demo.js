#!/usr/bin/env node
/*
 * Builds a self-contained preview copy of dist/ for sharing as a demo link.
 * Root-relative URLs become relative file paths, every page gets a "design
 * preview" banner and noindex, and the consultation form runs in demo mode
 * (it never sends data).   node build.js && node scripts/demo.js <out-dir>
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, '..', 'demo'));
const SKIP = new Set(['.htaccess', '_headers', '_redirects']);

const BANNER = `<div role="note" style="background:#f6b941;color:#081a29;font:600 14px/1.4 Inter,system-ui,sans-serif;text-align:center;padding:10px max(16px,env(safe-area-inset-right,0px)) 10px max(16px,env(safe-area-inset-left,0px))">Design preview prepared by Infuse AI for Justice Energy Co. Not the live website: the form does not send.</div>`;

function walk(dir, base = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const rel = base ? `${base}/${e.name}` : e.name;
    return e.isDirectory() ? walk(path.join(dir, e.name), rel) : [rel];
  });
}

function mapUrl(url, depth) {
  const m = url.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  let p = m[1];
  if (p === '') p = 'home.html';
  else if (p.endsWith('/')) p += 'index.html';
  return '../'.repeat(depth) + p + (m[2] || '') + (m[3] || '');
}

function rewrite(html, rel) {
  const depth = rel.split('/').length - 1;
  return html
    .replace(/(href|src|action|data-success)="\/([^"]*)"/g, (_, attr, url) => `${attr}="${mapUrl(url, depth)}"`)
    .replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, nofollow">')
    .replace(/ data-netlify="true" netlify-honeypot="bot-field"/, ' data-demo')
    .replace('<body>', `<body>\n${BANNER}`);
}

fs.rmSync(OUT, { recursive: true, force: true });
for (const rel of walk(DIST)) {
  if (SKIP.has(path.basename(rel))) continue;
  const src = path.join(DIST, rel);
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (rel.endsWith('.html')) fs.writeFileSync(dest, rewrite(fs.readFileSync(src, 'utf8'), rel));
  else fs.copyFileSync(src, dest);
}
// The homepage also lives at home.html so inner pages can link back to it as a plain file.
fs.copyFileSync(path.join(OUT, 'index.html'), path.join(OUT, 'home.html'));
console.log(`Demo written to ${OUT}`);
