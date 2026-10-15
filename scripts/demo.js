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
const SKIP = new Set(['.htaccess', '_headers', '_redirects', 'slots.json']);

const BANNER = `<div role="note" style="background:#16243b;color:#ffffff;font:600 14px/1.4 Inter,system-ui,sans-serif;text-align:center;padding:10px max(16px,env(safe-area-inset-right,0px)) 10px max(16px,env(safe-area-inset-left,0px))">Design preview prepared by Infuse AI for Justice Energy Co. Not the live website: the form does not send.</div>`;

// The preview viewer keeps the scroll position when moving between pages; start each page at the top
// unless the link points at a section (#anchor) or the visitor has already started scrolling.
const TOP = `<script>(function(){if(location.hash)return;try{history.scrollRestoration='manual'}catch(e){}var moved=false;['wheel','touchstart','keydown','mousedown'].forEach(function(t){addEventListener(t,function(){moved=true},{once:true,passive:true})});function top(){if(!moved)window.scrollTo(0,0)}top();addEventListener('DOMContentLoaded',top);addEventListener('load',function(){top();setTimeout(top,60);setTimeout(top,250);setTimeout(top,700)});addEventListener('pageshow',top)})();</script>`;

function walk(dir, base = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const rel = base ? `${base}/${e.name}` : e.name;
    return e.isDirectory() ? walk(path.join(dir, e.name), rel) : [rel];
  });
}

function mapUrl(url, depth) {
  const m = url.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  // Page photos are served by .htaccess on the live site; the preview uses the defaults directly.
  let p = m[1].replace(/^img\/slot\//, 'assets/slots/');
  if (p === '') p = 'home.html';
  else if (p.endsWith('/')) p += 'index.html';
  return '../'.repeat(depth) + p + (m[2] || '') + (m[3] || '');
}

function rewrite(html, rel) {
  const depth = rel.split('/').length - 1;
  return html
    .replace(/(href|src|action|data-success)="\/([^"]*)"/g, (_, attr, url) => `${attr}="${mapUrl(url, depth)}"`)
    .replace(/srcset="([^"]*)"/g, (_, set) => `srcset="${set.replace(/\/(img\/slot\/[^\s,]+)/g, (__, u) => mapUrl(u, depth))}"`)
    .replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, nofollow">')
    .replace(/ data-netlify="true" netlify-honeypot="bot-field"/, ' data-demo')
    .replace('<body>', `<body>\n${BANNER}`)
    .replace('</head>', `${TOP}\n</head>`);
}

fs.rmSync(OUT, { recursive: true, force: true });
for (const rel of walk(DIST)) {
  if (SKIP.has(path.basename(rel)) || rel.startsWith('admin/')) continue;
  const src = path.join(DIST, rel);
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (rel.endsWith('.php')) {
    // PHP does not run in the preview: the gallery page is shown in its empty state, the admin is left out.
    if (rel !== 'gallery/index.php') continue;
    let html = fs.readFileSync(src, 'utf8');
    const empty = html.match(/<!--gallery:empty-->([\s\S]*?)<!--\/gallery:empty-->/)[1];
    html = html.replace(/<!--gallery:php-->[\s\S]*?<!--\/gallery:php-->/, empty);
    fs.writeFileSync(dest.replace(/index\.php$/, 'index.html'), rewrite(html, rel.replace(/index\.php$/, 'index.html')));
    continue;
  }
  if (rel.endsWith('.html')) fs.writeFileSync(dest, rewrite(fs.readFileSync(src, 'utf8'), rel));
  else fs.copyFileSync(src, dest);
}
// The homepage also lives at home.html so inner pages can link back to it as a plain file.
fs.copyFileSync(path.join(OUT, 'index.html'), path.join(OUT, 'home.html'));
console.log(`Demo written to ${OUT}`);
