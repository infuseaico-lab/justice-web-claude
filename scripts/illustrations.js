#!/usr/bin/env node
/*
 * Generates the site's illustrations as SVG files in src/assets/img.
 * All artwork is original, illustrative and drawn from shared primitives so
 * every page keeps one visual language. Run: node scripts/illustrations.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'src', 'assets', 'img');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  navy: '#1f3354',
  navy2: '#2c4670',
  navy3: '#406093',
  teal: '#406093',
  teal2: '#4a8be0',
  tealLight: '#b9d3f4',
  mint: '#e3eefb',
  amber: '#f6b941',
  amberLight: '#ffe3a1',
  coral: '#e9785f',
  blue: '#3b8fd1',
  blueLight: '#cfe6f6',
  wall: '#ffffff',
  wall2: '#eef3fa',
  wall3: '#dde6f2',
  ground: '#efe7d6',
  ground2: '#e2d6bd',
  rock: '#c9c1b2',
  rock2: '#b3aa98',
  leaf: '#5a9a36',
  leaf2: '#7cbf52',
  leaf3: '#93d16b',
  sage: '#9fbfa6',
};
const FONT = "Inter, 'Segoe UI', Roboto, Arial, sans-serif";

const baseDefs = `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d9eff3"/><stop offset="0.65" stop-color="#eef7f6"/><stop offset="1" stop-color="#fbf6ea"/>
  </linearGradient>
  <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0f2a3f"/><stop offset="1" stop-color="#1d4766"/>
  </linearGradient>
  <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.amber}" stop-opacity="0.55"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffe7a8" stop-opacity="0.85"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="warmGlass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff1c7"/><stop offset="1" stop-color="#ffd06a"/>
  </linearGradient>
  <linearGradient id="coolGlass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e9f7fb"/><stop offset="1" stop-color="#b9e0ea"/>
  </linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#e7edf1"/><stop offset="0.5" stop-color="#ffffff"/><stop offset="1" stop-color="#d6e0e7"/>
  </linearGradient>
  <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffe7a8" stop-opacity="0.75"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/>
  </linearGradient>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
    <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="${C.navy}" flood-opacity="0.14"/>
  </filter>
  <filter id="softShadow" x="-20%" y="-20%" width="140%" height="160%">
    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="${C.navy}" flood-opacity="0.12"/>
  </filter>`;

function svg(w, h, body, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${baseDefs}${defs}</defs>${body}</svg>\n`;
}

const r = (n) => Math.round(n * 10) / 10;

function sun(cx, cy, rad) {
  return `<circle cx="${cx}" cy="${cy}" r="${rad * 3.2}" fill="url(#sunGlow)"/><circle cx="${cx}" cy="${cy}" r="${rad}" fill="${C.amber}"/>`;
}

function cloud(x, y, s = 1, o = 0.9) {
  return `<g fill="#fff" opacity="${o}" transform="translate(${x} ${y}) scale(${s})">
    <rect x="0" y="22" width="170" height="34" rx="17"/><circle cx="55" cy="26" r="28"/><circle cx="100" cy="18" r="34"/><circle cx="138" cy="34" r="22"/></g>`;
}

function hills(w, y, c1 = '#d3e3f5', c2 = '#bcd4ef') {
  return `<path d="M0 ${y + 40} C ${w * 0.18} ${y - 50}, ${w * 0.36} ${y + 10}, ${w * 0.55} ${y - 20} S ${w * 0.85} ${y + 30}, ${w} ${y - 30} V ${y + 260} H 0 Z" fill="${c1}"/>
  <path d="M0 ${y + 90} C ${w * 0.22} ${y + 30}, ${w * 0.42} ${y + 90}, ${w * 0.62} ${y + 50} S ${w * 0.9} ${y + 80}, ${w} ${y + 40} V ${y + 260} H 0 Z" fill="${c2}"/>`;
}

function leaf(x, y, angDeg, len, wid, color) {
  const a = (angDeg * Math.PI) / 180;
  const tip = [x + len * Math.sin(a), y - len * Math.cos(a)];
  const px = Math.cos(a), py = Math.sin(a);
  const bl = [x - px * wid, y - py * wid];
  const br = [x + px * wid, y + py * wid];
  const mid = [x + len * 0.45 * Math.sin(a), y - len * 0.45 * Math.cos(a)];
  const c1 = [mid[0] - px * wid * 1.1, mid[1] - py * wid * 1.1];
  const c2 = [mid[0] + px * wid * 1.1, mid[1] + py * wid * 1.1];
  return `<path d="M${r(bl[0])} ${r(bl[1])} Q ${r(c1[0])} ${r(c1[1])} ${r(tip[0])} ${r(tip[1])} Q ${r(c2[0])} ${r(c2[1])} ${r(br[0])} ${r(br[1])} Z" fill="${color}"/>`;
}

function agave(x, y, s = 1, c1 = C.sage, c2 = '#7fa98c') {
  const back = [-70, -45, -20, 5, 30, 55, 75].map((a, i) => leaf(x, y, a, (70 + (i % 2) * 18) * s, 11 * s, c2)).join('');
  const front = [-55, -28, 0, 26, 52].map((a, i) => leaf(x, y, a, (55 + (i % 2) * 14) * s, 10 * s, c1)).join('');
  return `<g>${back}${front}</g>`;
}

function grass(x, y, s = 1, color = '#9bb86a') {
  let d = '';
  for (let i = -5; i <= 5; i++) {
    const tx = x + i * 7 * s + (i % 2) * 4 * s;
    const ty = y - (50 + Math.abs((i * 13) % 27)) * s;
    d += `M${r(x + i * 2.4 * s)} ${y} Q ${r(x + i * 4 * s)} ${r(y - 30 * s)} ${r(tx)} ${r(ty)} `;
  }
  return `<path d="${d}" stroke="${color}" stroke-width="${3 * s}" fill="none" stroke-linecap="round"/>`;
}

function shrub(x, y, s = 1, c1 = C.leaf2, c2 = C.leaf) {
  return `<g><circle cx="${x - 22 * s}" cy="${y - 18 * s}" r="${24 * s}" fill="${c2}"/><circle cx="${x + 20 * s}" cy="${y - 20 * s}" r="${26 * s}" fill="${c2}"/><circle cx="${x}" cy="${y - 34 * s}" r="${30 * s}" fill="${c1}"/><rect x="${x - 46 * s}" y="${y - 18 * s}" width="${92 * s}" height="${18 * s}" rx="${9 * s}" fill="${c1}"/></g>`;
}

function rock(x, y, w, h, c = C.rock, c2 = C.rock2) {
  return `<path d="M${x} ${y} Q ${x + w * 0.1} ${y - h} ${x + w * 0.5} ${y - h} Q ${x + w * 0.95} ${y - h * 0.9} ${x + w} ${y} Z" fill="${c}"/><path d="M${x + w * 0.55} ${y} Q ${x + w * 0.85} ${y - h * 0.55} ${x + w} ${y} Z" fill="${c2}"/>`;
}

function tree(x, y, s = 1) {
  return `<g><path d="M${x - 6 * s} ${y} L ${x - 3 * s} ${y - 120 * s} L ${x + 4 * s} ${y - 120 * s} L ${x + 7 * s} ${y} Z" fill="#8a6b4f"/>
    <path d="M${x} ${y - 90 * s} L ${x - 30 * s} ${y - 130 * s} M ${x + 1 * s} ${y - 100 * s} L ${x + 34 * s} ${y - 140 * s}" stroke="#8a6b4f" stroke-width="${5 * s}" stroke-linecap="round"/>
    <ellipse cx="${x - 40 * s}" cy="${y - 150 * s}" rx="${52 * s}" ry="${36 * s}" fill="#7fae86"/>
    <ellipse cx="${x + 38 * s}" cy="${y - 165 * s}" rx="${58 * s}" ry="${40 * s}" fill="#6a9f77"/>
    <ellipse cx="${x}" cy="${y - 190 * s}" rx="${60 * s}" ry="${42 * s}" fill="#8cbc93"/></g>`;
}

function chip() {
  return '';
}
function unusedChip(x, y, text, color = C.teal, icon = 'dot') {
  const w = Math.round(text.length * 11.6 + 78);
  const icons = {
    dot: `<circle cx="${x + 30}" cy="${y + 29}" r="9" fill="#fff"/>`,
    bolt: `<path d="M${x + 33} ${y + 16} L ${x + 23} ${y + 32} H ${x + 31} L ${x + 28} ${y + 43} L ${x + 39} ${y + 26} H ${x + 31} Z" fill="#fff"/>`,
    drop: `<path d="M${x + 30} ${y + 16} C ${x + 37} ${y + 26} ${x + 40} ${y + 30} ${x + 40} ${y + 34} A 10 10 0 0 1 ${x + 20} ${y + 34} C ${x + 20} ${y + 30} ${x + 23} ${y + 26} ${x + 30} ${y + 16} Z" fill="#fff"/>`,
    leaf: `<path d="M${x + 20} ${y + 40} C ${x + 20} ${y + 24} ${x + 30} ${y + 17} ${x + 41} ${y + 17} C ${x + 41} ${y + 30} ${x + 34} ${y + 40} ${x + 20} ${y + 40} Z M ${x + 20} ${y + 40} L ${x + 33} ${y + 27}" fill="#fff" stroke="#fff" stroke-width="2"/>`,
    check: `<path d="M${x + 22} ${y + 30} L ${x + 28} ${y + 36} L ${x + 39} ${y + 23}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    fan: `<circle cx="${x + 30}" cy="${y + 29}" r="9" fill="none" stroke="#fff" stroke-width="3"/><circle cx="${x + 30}" cy="${y + 29}" r="3" fill="#fff"/>`,
  };
  return `<g filter="url(#softShadow)"><rect x="${x}" y="${y}" width="${w}" height="58" rx="29" fill="#fff"/></g>
    <circle cx="${x + 30}" cy="${y + 29}" r="19" fill="${color}"/>${icons[icon] || icons.dot}
    <text x="${x + 60}" y="${y + 36}" font-family="${FONT}" font-size="20" font-weight="700" fill="${C.navy}">${text}</text>`;
}

function fanUnit(x, y, w = 150, h = 120) {
  const cx = x + w * 0.4, cy = y + h * 0.5, fr = h * 0.34;
  let grille = '';
  for (let i = 0; i < 6; i++) grille += `<line x1="${r(x + w * 0.74)}" y1="${r(y + 22 + i * ((h - 40) / 5))}" x2="${r(x + w - 14)}" y2="${r(y + 22 + i * ((h - 40) / 5))}" stroke="${C.wall3}" stroke-width="5" stroke-linecap="round"/>`;
  return `<g filter="url(#softShadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="url(#metal)"/></g>
    <circle cx="${cx}" cy="${cy}" r="${fr}" fill="#dfe7ec" stroke="#c7d3db" stroke-width="4"/>
    <g stroke="${C.navy3}" stroke-width="3" opacity="0.55">${[0, 60, 120].map((a) => `<line x1="${r(cx - fr * 0.85 * Math.cos((a * Math.PI) / 180))}" y1="${r(cy - fr * 0.85 * Math.sin((a * Math.PI) / 180))}" x2="${r(cx + fr * 0.85 * Math.cos((a * Math.PI) / 180))}" y2="${r(cy + fr * 0.85 * Math.sin((a * Math.PI) / 180))}"/>`).join('')}</g>
    <circle cx="${cx}" cy="${cy}" r="${fr * 0.22}" fill="${C.navy2}"/>
    ${grille}
    <rect x="${x + 10}" y="${y + h}" width="${w - 20}" height="10" rx="3" fill="#b9c6cf"/>`;
}

function miniSplit(x, y, w = 330, h = 92) {
  return `<g filter="url(#softShadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#fff"/></g>
    <rect x="${x + 18}" y="${y + h - 26}" width="${w - 36}" height="10" rx="5" fill="${C.wall3}"/>
    <circle cx="${x + w - 34}" cy="${y + 28}" r="5" fill="${C.teal2}"/>`;
}

function airflow(x, y, w, color = C.teal2, n = 3) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const yy = y + i * 34;
    s += `<path d="M${x + i * 20} ${yy} C ${x + w * 0.3} ${yy + 40}, ${x + w * 0.6} ${yy - 10}, ${x + w} ${yy + 40}" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round" opacity="${0.75 - i * 0.18}"/>`;
  }
  return s;
}

function drops(x, y, n, spread, len, color = C.blue) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const dx = x - spread / 2 + (spread / (n - 1)) * i;
    const off = (i * 37) % 60;
    s += `<line x1="${r(dx)}" y1="${y + off}" x2="${r(dx + (dx - x) * 0.18)}" y2="${y + off + len}" stroke="${color}" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
  }
  return s;
}

function plantPot(x, y, s = 1) {
  return `<g><path d="M${x - 30 * s} ${y - 60 * s} H ${x + 30 * s} L ${x + 22 * s} ${y} H ${x - 22 * s} Z" fill="#e7c9a8"/>
    ${leaf(x, y - 58 * s, -35, 90 * s, 12 * s, C.leaf)}${leaf(x, y - 58 * s, 0, 120 * s, 13 * s, C.leaf2)}${leaf(x, y - 58 * s, 35, 95 * s, 12 * s, C.leaf)}${leaf(x, y - 58 * s, -12, 70 * s, 10 * s, C.leaf3)}${leaf(x, y - 58 * s, 15, 75 * s, 10 * s, C.leaf3)}</g>`;
}

function pendant(x, top, y, glow = true) {
  return `${glow ? `<ellipse cx="${x}" cy="${y + 120}" rx="140" ry="160" fill="url(#lampGlow)"/>` : ''}
    <line x1="${x}" y1="${top}" x2="${x}" y2="${y}" stroke="#c6d2db" stroke-width="3"/>
    <path d="M${x - 58} ${y + 54} Q ${x - 50} ${y} ${x} ${y} Q ${x + 50} ${y} ${x + 58} ${y + 54} Z" fill="${C.navy2}"/>
    <ellipse cx="${x}" cy="${y + 54}" rx="58" ry="8" fill="#ffd877"/>
    <circle cx="${x}" cy="${y + 58}" r="16" fill="#fff4cf"/>`;
}

function checkRow(x, y, w, done = true) {
  return `<rect x="${x}" y="${y}" width="${w}" height="56" rx="14" fill="${C.wall2}"/>
    <circle cx="${x + 28}" cy="${y + 28}" r="15" fill="${done ? C.teal : '#fff'}" stroke="${done ? C.teal : C.wall3}" stroke-width="3"/>
    ${done ? `<path d="M${x + 21} ${y + 28} L ${x + 26} ${y + 33} L ${x + 35} ${y + 22}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    <rect x="${x + 58}" y="${y + 17}" width="${w * 0.5}" height="10" rx="5" fill="#c8d5de"/>
    <rect x="${x + 58}" y="${y + 33}" width="${w * 0.32}" height="8" rx="4" fill="#dce5eb"/>`;
}

function miniHouse(x, y, s = 1, glass = 'url(#warmGlass)') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 70 L 90 0 L 180 70 Z" fill="${C.navy2}"/>
    <rect x="18" y="64" width="144" height="106" fill="#fff"/>
    <rect x="34" y="88" width="46" height="40" rx="4" fill="${glass}"/>
    <rect x="100" y="98" width="40" height="72" rx="4" fill="${C.navy}"/>
    <rect x="0" y="168" width="180" height="6" rx="3" fill="${C.wall3}"/></g>`;
}

const scenes = {};

/* ---------- Home hero: an efficient home ---------- */
scenes['hero-home'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  g += sun(985, 185, 62) + cloud(120, 120, 1.1) + cloud(640, 70, 0.8, 0.75);
  g += hills(W, 470);
  g += tree(165, 712, 1.25);
  // ground
  g += `<rect x="0" y="700" width="${W}" height="200" fill="${C.ground}"/>`;
  g += `<path d="M0 700 H ${W}" stroke="${C.ground2}" stroke-width="4"/>`;
  // main volume
  g += `<g filter="url(#shadow)"><path d="M330 400 L 770 350 L 770 700 L 330 700 Z" fill="#fff"/></g>`;
  g += `<path d="M308 412 L 792 356 L 792 334 L 308 390 Z" fill="${C.navy}"/>`;
  g += `<rect x="330" y="680" width="440" height="20" fill="${C.wall2}"/>`;
  g += `<rect x="372" y="462" width="176" height="160" rx="6" fill="url(#warmGlass)"/><path d="M460 462 V 622 M372 540 H 548" stroke="#fff" stroke-width="6"/>`;
  g += `<rect x="585" y="512" width="74" height="188" rx="4" fill="${C.navy2}"/><circle cx="645" cy="610" r="5" fill="${C.amber}"/>`;
  g += `<rect x="688" y="452" width="56" height="112" rx="4" fill="url(#warmGlass)"/>`;
  // wood slat accent
  g += `<g fill="#c99a6b">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${336 + i * 7}" y="430" width="4" height="250"/>`).join('')}</g>`;
  // garage volume
  g += `<g filter="url(#shadow)"><rect x="770" y="470" width="170" height="230" fill="${C.wall2}"/></g>`;
  g += `<rect x="760" y="456" width="192" height="18" rx="2" fill="${C.navy}"/>`;
  g += `<rect x="790" y="530" width="130" height="170" fill="#d4dee5"/>${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="790" y1="${556 + i * 26}" x2="920" y2="${556 + i * 26}" stroke="#bfccd5" stroke-width="3"/>`).join('')}`;
  // heat pump & line set
  g += `<path d="M940 560 H 975 V 612" stroke="#b9c6cf" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  g += fanUnit(960, 600, 150, 100);
  // path & yard
  g += `<path d="M585 700 H 660 L 760 900 H 470 Z" fill="#f8f3e7"/>`;
  g += `<g fill="${C.ground2}">${Array.from({ length: 26 }, (_, i) => `<circle cx="${60 + ((i * 97) % 1100)}" cy="${730 + ((i * 53) % 160)}" r="${3 + (i % 3)}"/>`).join('')}</g>`;
  g += rock(345, 790, 120, 46) + rock(830, 840, 150, 56) + rock(1040, 760, 90, 34);
  g += agave(230, 800, 1.1) + agave(430, 860, 0.8) + agave(920, 790, 0.9, '#a7c7ae', '#86ad91');
  g += grass(330, 735, 0.9) + grass(1110, 860, 1.1) + grass(70, 860, 1);
  g += shrub(520, 735, 0.7) + shrub(1150, 712, 0.75);
  // chips
  g += chip(60, 300, 'LED retrofits', C.amber, 'bolt');
  g += chip(880, 470 - 150, 'Heat pump HVAC', C.teal, 'fan');
  g += chip(790, 812, 'Water-wise yard', C.blue, 'drop');
  return svg(W, H, g);
};

/* ---------- Services overview: house cutaway ---------- */
scenes['services-cutaway'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="url(#sky)"/>` + sun(1060, 150, 48) + cloud(60, 90, 0.9) + hills(W, 560);
  g += `<rect x="0" y="770" width="${W}" height="130" fill="${C.ground}"/>`;
  // house shell
  g += `<g filter="url(#shadow)"><path d="M200 330 L 600 140 L 1000 330 V 770 H 200 Z" fill="${C.wall2}"/></g>`;
  g += `<path d="M170 346 L 600 128 L 1030 346 L 1030 316 L 600 98 L 170 316 Z" fill="${C.navy}"/>`;
  // rooms
  g += `<rect x="225" y="345" width="362" height="200" fill="#eaf2fb"/>`; // bath
  g += `<rect x="613" y="345" width="362" height="200" fill="#f4f6fb"/>`; // living
  g += `<rect x="225" y="565" width="362" height="190" fill="#eef1f3"/>`; // utility
  g += `<rect x="613" y="565" width="362" height="190" fill="#fbf4e6"/>`; // kitchen
  g += `<path d="M200 555 H 1000 M 600 330 V 770" stroke="#fff" stroke-width="20"/>`;
  // bath: shower + toilet + tile
  g += `<g stroke="#dce7f4" stroke-width="2">${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="225" y1="${375 + i * 30}" x2="420" y2="${375 + i * 30}"/>`).join('')}</g>`;
  g += `<path d="M260 370 H 300 V 392" stroke="${C.navy3}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M276 392 H 324 L 316 404 H 284 Z" fill="${C.navy3}"/>`;
  g += drops(300, 412, 6, 56, 34);
  g += `<rect x="250" y="530" width="120" height="12" rx="4" fill="#c7dfe3"/>`;
  g += `<rect x="470" y="440" width="64" height="44" rx="8" fill="#fff" stroke="#d6e2e8" stroke-width="3"/><path d="M450 484 H 544 Q 540 520 500 524 Q 470 524 460 508 Z" fill="#fff" stroke="#d6e2e8" stroke-width="3"/><rect x="480" y="520" width="40" height="22" fill="#fff" stroke="#d6e2e8" stroke-width="3"/>`;
  // living: mini split + sofa
  g += miniSplit(680, 372, 230, 64) + airflow(700, 456, 200, C.teal2, 2);
  g += `<rect x="660" y="470" width="240" height="56" rx="18" fill="${C.navy3}"/><rect x="650" y="500" width="260" height="38" rx="14" fill="${C.navy2}"/>`;
  g += plantPot(940, 545, 0.55);
  // utility: HPWH + tankless
  g += `<rect x="270" y="610" width="96" height="145" rx="20" fill="url(#metal)" stroke="#d1dbe2" stroke-width="3"/><rect x="270" y="590" width="96" height="40" rx="12" fill="#fff" stroke="#d1dbe2" stroke-width="3"/><rect x="288" y="602" width="36" height="14" rx="4" fill="${C.teal2}"/>`;
  g += `<path d="M300 590 V 570 M 336 590 V 570" stroke-width="8" stroke-linecap="round" fill="none" stroke="${C.coral}"/><path d="M336 590 V 570" stroke="${C.blue}" stroke-width="8" stroke-linecap="round"/>`;
  g += `<rect x="440" y="600" width="90" height="120" rx="14" fill="#fff" stroke="#d1dbe2" stroke-width="3"/><rect x="458" y="622" width="54" height="26" rx="6" fill="${C.navy}"/><text x="485" y="641" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" fill="${C.amberLight}">120°</text>`;
  g += `<path d="M465 720 V 755 M 505 720 V 755" stroke-width="8" stroke-linecap="round" fill="none" stroke="${C.coral}"/><path d="M505 720 V 755" stroke="${C.blue}" stroke-width="8" stroke-linecap="round"/>`;
  // kitchen: pendants + counter
  g += pendant(720, 565, 600) + pendant(870, 565, 600);
  g += `<rect x="640" y="690" width="310" height="65" rx="6" fill="${C.navy2}"/><rect x="630" y="680" width="330" height="16" rx="6" fill="#e9eef2"/>`;
  // outside: heat pump + yard
  g += `<path d="M1000 410 H 1040 V 655" stroke="#b9c6cf" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  g += fanUnit(1020, 650, 140, 110);
  g += agave(110, 800, 1) + rock(20, 860, 120, 40) + grass(170, 840, 0.9) + agave(1100, 870, 0.7, '#a7c7ae', '#86ad91');
  // labels
  g += chip(40, 380, 'Water conservation', C.blue, 'drop');
  g += chip(780, 210, 'Heat pumps', C.teal, 'fan');
  g += chip(40, 690, 'Water heating', C.coral, 'dot');
  g += chip(760, 800, 'LED lighting', C.amber, 'bolt');
  return svg(W, H, g);
};

/* ---------- Water heating ---------- */
scenes['water-heating'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="#eef4f7"/>`;
  g += `<g stroke="#e0e9ef" stroke-width="2">${Array.from({ length: 14 }, (_, i) => `<line x1="${i * 90}" y1="0" x2="${i * 90}" y2="770"/>`).join('')}</g>`;
  g += `<rect x="0" y="770" width="${W}" height="130" fill="#dfe6eb"/><rect x="0" y="760" width="${W}" height="14" fill="#cfd9e0"/>`;
  // window
  g += `<rect x="900" y="110" width="220" height="250" rx="10" fill="#fff"/><rect x="916" y="126" width="188" height="218" rx="6" fill="url(#coolGlass)"/><path d="M1010 126 V 344" stroke="#fff" stroke-width="8"/>`;
  // heat pump water heater
  g += `<g filter="url(#shadow)"><rect x="200" y="300" width="230" height="460" rx="40" fill="url(#metal)"/></g>`;
  g += `<g filter="url(#softShadow)"><rect x="196" y="200" width="238" height="150" rx="30" fill="#fff"/></g>`;
  g += `${[0, 1, 2, 3].map((i) => `<rect x="236" y="${232 + i * 20}" width="110" height="8" rx="4" fill="${C.wall3}"/>`).join('')}`;
  g += `<rect x="360" y="232" width="50" height="70" rx="10" fill="${C.navy}"/><circle cx="385" cy="258" r="11" fill="${C.teal2}"/><rect x="372" y="280" width="26" height="6" rx="3" fill="${C.tealLight}"/>`;
  g += `<rect x="200" y="460" width="230" height="10" fill="#d7e1e8"/><rect x="200" y="620" width="230" height="10" fill="#d7e1e8"/>`;
  g += `<path d="M260 200 V 120 H 120 V 60" stroke="${C.coral}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  g += `<path d="M370 200 V 90 H 520 V 40" stroke="${C.blue}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  g += airflow(440, 230, 140, C.teal2, 3);
  // tankless
  g += `<g filter="url(#shadow)"><rect x="640" y="260" width="200" height="290" rx="26" fill="#fff"/></g>`;
  g += `<rect x="676" y="300" width="128" height="74" rx="14" fill="${C.navy}"/><text x="740" y="350" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="800" fill="${C.amberLight}">120°</text>`;
  g += `<circle cx="700" cy="410" r="10" fill="${C.wall3}"/><circle cx="740" cy="410" r="10" fill="${C.teal2}"/><circle cx="780" cy="410" r="10" fill="${C.wall3}"/>`;
  g += `<rect x="676" y="452" width="128" height="8" rx="4" fill="${C.wall2}"/><rect x="676" y="474" width="128" height="8" rx="4" fill="${C.wall2}"/>`;
  g += `<path d="M690 550 V 770" stroke="${C.coral}" stroke-width="16" stroke-linecap="round"/><path d="M790 550 V 770" stroke="${C.blue}" stroke-width="16" stroke-linecap="round"/>`;
  g += `<path d="M740 260 V 60" stroke="#b9c6cf" stroke-width="22" stroke-linecap="round"/>`;
  g += plantPot(1010, 760, 1.15);
  g += chip(120, 800, 'Heat pump water heater', C.teal, 'fan');
  g += chip(850, 600, 'Tankless', C.coral, 'bolt');
  return svg(W, H, g);
};

/* ---------- HVAC & heat pumps ---------- */
scenes['hvac'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="url(#sky)"/>` + sun(1090, 140, 44) + cloud(870, 80, 0.7) + hills(W, 560);
  g += `<rect x="760" y="760" width="440" height="140" fill="${C.ground}"/>`;
  g += `<rect x="0" y="0" width="780" height="${H}" fill="#f6f2ea"/><rect x="0" y="760" width="780" height="140" fill="#e2d4bd"/><rect x="0" y="752" width="780" height="12" fill="#d3c2a5"/>`;
  g += `<rect x="770" y="0" width="34" height="${H}" fill="#fff"/><rect x="800" y="0" width="12" height="${H}" fill="${C.wall3}"/>`;
  // window
  g += `<rect x="70" y="200" width="230" height="300" rx="10" fill="#fff"/><rect x="86" y="216" width="198" height="268" rx="6" fill="url(#coolGlass)"/><path d="M185 216 V 484" stroke="#fff" stroke-width="8"/>`;
  // mini split + airflow + line set
  g += miniSplit(360, 170, 360, 100) + airflow(380, 300, 330, C.teal2, 3);
  g += `<path d="M720 220 H 790" stroke="#b9c6cf" stroke-width="12" stroke-linecap="round"/><path d="M812 220 H 870 V 640" stroke="#b9c6cf" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  // thermostat
  g += `<rect x="620" y="420" width="70" height="90" rx="14" fill="#fff" filter="url(#softShadow)"/><circle cx="655" cy="455" r="20" fill="none" stroke="${C.teal}" stroke-width="5"/><text x="655" y="462" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="800" fill="${C.navy}">72</text>`;
  // sofa
  g += `<rect x="150" y="560" width="440" height="110" rx="34" fill="${C.navy3}"/><rect x="120" y="620" width="500" height="90" rx="30" fill="${C.navy2}"/><rect x="130" y="700" width="16" height="56" fill="#8a6b4f"/><rect x="594" y="700" width="16" height="56" fill="#8a6b4f"/>`;
  g += `<rect x="200" y="590" width="110" height="64" rx="20" fill="${C.amberLight}"/><rect x="440" y="590" width="110" height="64" rx="20" fill="${C.tealLight}"/>`;
  g += plantPot(690, 760, 1);
  // outdoor unit
  g += `<rect x="850" y="740" width="240" height="22" rx="4" fill="#cfd6db"/>`;
  g += fanUnit(860, 610, 220, 130);
  g += agave(1150, 830, 0.7) + rock(1000, 850, 120, 36);
  g += chip(370, 60, 'Ductless mini-split', C.teal, 'fan');
  g += chip(830, 500, 'Heat pump', C.navy2, 'bolt');
  return svg(W, H, g);
};

/* ---------- Water conservation ---------- */
scenes['water-conservation'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="#eef4fb"/>`;
  g += `<g stroke="#dce7f4" stroke-width="3">${Array.from({ length: 16 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="470" y2="${i * 60}"/>`).join('')}${Array.from({ length: 8 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="780"/>`).join('')}</g>`;
  g += `<rect x="0" y="780" width="${W}" height="120" fill="#d7e4e8"/><rect x="0" y="770" width="${W}" height="12" fill="#c6d6dc"/>`;
  g += `<rect x="470" y="0" width="10" height="780" fill="#fff"/>`;
  // shower
  g += `<path d="M90 120 H 230 V 190" stroke="${C.navy3}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  g += `<path d="M168 190 H 292 L 274 222 H 186 Z" fill="${C.navy3}"/>`;
  g += drops(230, 250, 9, 120, 60, C.blue) + drops(230, 380, 9, 150, 60, C.blue) + drops(230, 520, 9, 180, 60, C.blue);
  g += `<rect x="40" y="740" width="390" height="30" rx="8" fill="#fff"/>`;
  g += `<rect x="70" y="330" width="16" height="70" rx="8" fill="${C.navy3}"/><circle cx="78" cy="300" r="22" fill="#fff" stroke="${C.wall3}" stroke-width="4"/>`;
  // mirror + vanity
  g += `<rect x="560" y="120" width="300" height="320" rx="150" fill="#fff"/><rect x="576" y="136" width="268" height="288" rx="134" fill="url(#coolGlass)"/>`;
  g += `<path d="M640 260 L 700 200 M 660 300 L 760 200" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.7"/>`;
  g += `<g filter="url(#shadow)"><rect x="520" y="560" width="380" height="210" rx="12" fill="${C.navy2}"/></g>`;
  g += `<rect x="500" y="530" width="420" height="36" rx="10" fill="#fff"/><path d="M620 530 Q 710 590 800 530 Z" fill="#d6e6ec"/>`;
  g += `<rect x="560" y="610" width="140" height="130" rx="8" fill="${C.navy3}"/><rect x="720" y="610" width="140" height="130" rx="8" fill="${C.navy3}"/><rect x="680" y="660" width="40" height="8" rx="4" fill="#cfe0ea"/>`;
  g += `<path d="M710 530 V 470 H 760 V 488" stroke="#9fb3c0" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="750" y="484" width="20" height="16" rx="4" fill="${C.teal}"/>`;
  g += drops(760, 512, 3, 10, 18, C.blue);
  // toilet
  g += `<rect x="975" y="400" width="140" height="170" rx="16" fill="#fff" filter="url(#softShadow)"/><rect x="1000" y="420" width="60" height="18" rx="8" fill="${C.teal}"/>`;
  g += `<path d="M955 570 H 1135 Q 1130 660 1060 680 L 1060 770 H 1000 L 1000 680 Q 960 660 955 570 Z" fill="#fff" stroke="#dbe6ec" stroke-width="3"/>`;
  g += plantPot(1150, 400, 0.6);
  g += chip(470 + 60, 30, 'Faucet aerators', C.teal, 'drop');
  g += chip(60, 640, 'Efficient showerheads', C.blue, 'drop');
  g += chip(870, 820 - 20, 'Low-flow toilets', C.navy2, 'check');
  return svg(W, H, g);
};

/* ---------- Turf replacement ---------- */
scenes['turf-replacement'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="url(#sky)"/>` + sun(170, 150, 50) + cloud(520, 70, 0.9) + hills(W, 400, '#d6e5f5', '#c2d8f0');
  // house edge right
  g += `<g filter="url(#shadow)"><rect x="880" y="250" width="320" height="380" fill="#fff"/></g><path d="M860 262 L 1200 220 V 196 L 860 238 Z" fill="${C.navy}"/>`;
  g += `<rect x="930" y="330" width="170" height="170" rx="6" fill="url(#coolGlass)"/><path d="M1015 330 V 500 M 930 415 H 1100" stroke="#fff" stroke-width="6"/>`;
  g += `<rect x="880" y="600" width="320" height="30" fill="${C.wall2}"/>`;
  // ground
  g += `<path d="M0 560 H 1200 V 900 H 0 Z" fill="${C.ground}"/>`;
  g += `<path d="M0 640 C 200 610, 380 660, 520 640 S 800 600, 1200 640 V 900 H 0 Z" fill="#e6dac2"/>`;
  // mulch beds
  g += `<path d="M40 700 C 160 640, 360 650, 430 720 C 470 770, 380 830, 240 830 C 110 830, 0 790, 40 700 Z" fill="#a98463"/>`;
  g += `<path d="M720 690 C 820 650, 1020 660, 1120 700 C 1200 740, 1150 840, 1000 850 C 830 860, 650 790, 720 690 Z" fill="#a98463"/>`;
  // flagstone path
  const stones = [[520, 870, 90, 34], [560, 800, 76, 28], [580, 740, 64, 24], [610, 690, 54, 20], [630, 650, 44, 16]];
  g += stones.map(([x, y, w, h]) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="#f5efe2" stroke="#d9ccb1" stroke-width="3"/>`).join('');
  // drip line
  g += `<path d="M60 760 C 180 700, 330 720, 400 760" stroke="${C.navy}" stroke-width="4" fill="none" stroke-dasharray="2 14" stroke-linecap="round"/>`;
  g += `<path d="M740 740 C 860 700, 1000 710, 1110 760" stroke="${C.navy}" stroke-width="4" fill="none" stroke-dasharray="2 14" stroke-linecap="round"/>`;
  g += agave(150, 760, 1.2) + agave(330, 780, 0.9, '#a7c7ae', '#86ad91') + agave(880, 760, 1.15) + agave(1060, 800, 0.85, '#a7c7ae', '#86ad91');
  g += grass(250, 820, 1, '#b8a35a') + grass(780, 800, 1, '#b8a35a') + grass(980, 740, 0.9, '#9bb86a') + grass(80, 820, 0.9, '#9bb86a');
  g += rock(400, 860, 140, 60) + rock(640, 600, 120, 46) + rock(1100, 880, 100, 40);
  g += tree(760, 600, 1.1);
  g += shrub(470, 640, 0.8, '#b48ac9', '#9a6fb3') + shrub(300, 620, 0.7, C.leaf3, C.leaf2);
  g += chip(60, 250, 'Water-wise landscape', C.blue, 'drop');
  g += chip(410, 470, 'Drip irrigation', C.teal, 'leaf');
  return svg(W, H, g);
};

/* ---------- LED lighting ---------- */
scenes['led-lighting'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="url(#dusk)"/>`;
  g += `<rect x="0" y="0" width="${W}" height="70" fill="#0b2031"/>`;
  [150, 1050].forEach((x) => {
    g += `<path d="M${x - 24} 70 L ${x - 150} 760 H ${x + 150} L ${x + 24} 70 Z" fill="url(#cone)" opacity="0.6"/><rect x="${x - 28}" y="62" width="56" height="12" rx="6" fill="#fff4cf"/>`;
  });
  g += `<rect x="0" y="760" width="${W}" height="140" fill="#0c2233"/>`;
  // back cabinets
  g += `<rect x="240" y="170" width="720" height="200" rx="8" fill="#21506f"/><path d="M420 170 V 370 M 600 170 V 370 M 780 170 V 370" stroke="#1a4361" stroke-width="6"/>`;
  g += `<rect x="240" y="370" width="720" height="10" fill="#ffd877" opacity="0.85"/><rect x="240" y="380" width="720" height="120" fill="url(#cone)" opacity="0.55"/>`;
  g += [360, 600, 840].map((x) => pendant(x, 70, 300)).join('');
  // island
  g += `<g filter="url(#shadow)"><rect x="200" y="590" width="800" height="170" rx="8" fill="#e9eef2"/></g><rect x="180" y="570" width="840" height="28" rx="8" fill="#fff"/>`;
  g += `<path d="M330 598 V 760 M 600 598 V 760 M 870 598 V 760" stroke="#d3dde4" stroke-width="5"/>`;
  // stools
  [320, 600, 880].forEach((x) => {
    g += `<rect x="${x - 50}" y="660" width="100" height="22" rx="11" fill="${C.amber}"/><path d="M${x - 34} 682 L ${x - 44} 790 M ${x + 34} 682 L ${x + 44} 790" stroke="#c9d3db" stroke-width="7" stroke-linecap="round"/>`;
  });
  g += `<rect x="470" y="530" width="60" height="40" rx="10" fill="#fff"/>${leaf(500, 532, -20, 40, 7, C.leaf2)}${leaf(500, 532, 15, 46, 7, C.leaf)}`;
  g += chip(60, 110 + 300, 'LED retrofits', C.amber, 'bolt');
  g += chip(880, 430, 'Lower upkeep', C.teal, 'check');
  return svg(W, H, g);
};

/* ---------- Programs ---------- */
scenes['programs'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="#eef4fb"/>`;
  g += `<circle cx="1050" cy="150" r="260" fill="#dde9f8"/><circle cx="120" cy="820" r="240" fill="#dcecf5"/>`;
  // card 1: home
  g += `<g filter="url(#shadow)"><rect x="110" y="300" width="300" height="340" rx="28" fill="#fff"/></g>${miniHouse(170, 350, 1)}`;
  g += `<rect x="150" y="560" width="160" height="14" rx="7" fill="${C.navy}"/><rect x="150" y="590" width="220" height="10" rx="5" fill="${C.wall3}"/>`;
  // card 2: document
  g += `<g filter="url(#shadow)"><rect x="460" y="220" width="300" height="420" rx="28" fill="#fff"/></g>`;
  g += `<rect x="500" y="262" width="150" height="16" rx="8" fill="${C.navy}"/>` + checkRow(500, 304, 220) + checkRow(500, 374, 220) + checkRow(500, 444, 220, false);
  g += `<circle cx="690" cy="572" r="38" fill="${C.amber}"/><path d="M672 572 L 686 586 L 710 558" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  // card 3: upgrade
  g += `<g filter="url(#shadow)"><rect x="810" y="300" width="300" height="340" rx="28" fill="#fff"/></g>`;
  g += `<circle cx="960" cy="420" r="72" fill="${C.mint}"/><path d="M972 360 L 930 430 H 962 L 950 482 L 994 408 H 962 Z" fill="${C.teal}"/>`;
  g += `<rect x="850" y="560" width="160" height="14" rx="7" fill="${C.navy}"/><rect x="850" y="590" width="220" height="10" rx="5" fill="${C.wall3}"/>`;
  [435, 785].forEach((x) => {
    g += `<circle cx="${x}" cy="470" r="26" fill="${C.teal}"/><path d="M${x - 9} 470 H ${x + 9} M ${x + 1} 461 L ${x + 10} 470 L ${x + 1} 479" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  g += chip(140, 700, 'Assess', C.navy2, 'check') + chip(530, 700, 'Review', C.teal, 'check') + chip(860, 700, 'Upgrade', C.amber, 'bolt');
  return svg(W, H, g);
};

/* ---------- About: home assessment ---------- */
scenes['about'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="url(#sky)"/>` + sun(1040, 170, 50) + cloud(90, 110, 0.9) + hills(W, 560);
  g += `<rect x="0" y="760" width="${W}" height="140" fill="${C.ground}"/>`;
  // big house in background
  g += `<g opacity="0.95"><g filter="url(#shadow)"><path d="M120 470 L 330 320 L 540 470 V 760 H 120 Z" fill="#fff"/></g><path d="M100 482 L 330 300 L 560 482 L 560 456 L 330 274 L 100 456 Z" fill="${C.navy}"/>`;
  g += `<rect x="170" y="520" width="110" height="100" rx="6" fill="url(#warmGlass)"/><rect x="330" y="560" width="80" height="200" rx="4" fill="${C.navy2}"/><rect x="440" y="520" width="70" height="100" rx="6" fill="url(#warmGlass)"/></g>`;
  // tablet
  g += `<g filter="url(#shadow)"><rect x="600" y="200" width="460" height="600" rx="40" fill="${C.navy}"/></g><rect x="626" y="230" width="408" height="540" rx="22" fill="#fff"/>`;
  g += `<rect x="660" y="266" width="200" height="18" rx="9" fill="${C.navy}"/><rect x="660" y="296" width="140" height="12" rx="6" fill="${C.wall3}"/>`;
  g += `<rect x="660" y="330" width="340" height="140" rx="18" fill="${C.mint}"/>${miniHouse(760, 350, 0.62)}`;
  g += checkRow(660, 490, 340) + checkRow(660, 560, 340) + checkRow(660, 630, 340, false);
  g += `<rect x="660" y="706" width="160" height="40" rx="20" fill="${C.teal}"/>`;
  // hard hat
  g += `<path d="M560 780 Q 560 690 640 690 Q 720 690 720 780 Z" fill="${C.amber}"/><rect x="540" y="772" width="200" height="22" rx="11" fill="#e6a22c"/><rect x="630" y="696" width="20" height="78" rx="8" fill="#ffd36e"/>`;
  g += agave(1130, 830, 0.8) + grass(80, 840, 1) + rock(160, 880, 120, 40);
  g += chip(720, 110, 'Home assessment', C.teal, 'check');
  return svg(W, H, g);
};

/* ---------- Contact ---------- */
scenes['contact'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="#eef3f9"/>`;
  // stylized map
  g += `<path d="M0 640 C 220 560, 420 700, 640 610 S 1000 520, 1200 600 V 900 H 0 Z" fill="#cfe6f2"/>`;
  g += `<g fill="#e2eaf4">${[[60, 60, 260, 180], [360, 40, 220, 220], [640, 80, 260, 160], [940, 50, 220, 200], [80, 300, 200, 200], [330, 320, 280, 180], [680, 300, 200, 180], [940, 300, 220, 200]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18"/>`).join('')}</g>`;
  g += `<path d="M0 270 H 1200 M 320 0 V 600 M 620 0 V 560 M 910 0 V 560 M 0 520 C 300 500, 700 560, 1200 470" stroke="#fff" stroke-width="22" fill="none"/>`;
  g += `<path d="M0 270 H 1200 M 320 0 V 600" stroke="${C.amberLight}" stroke-width="6" fill="none" stroke-dasharray="20 18"/>`;
  // pin
  g += `<ellipse cx="620" cy="560" rx="70" ry="18" fill="${C.navy}" opacity="0.15"/>`;
  g += `<g filter="url(#shadow)"><path d="M620 560 C 560 470, 520 430, 520 370 A 100 100 0 0 1 720 370 C 720 430, 680 470, 620 560 Z" fill="${C.teal}"/></g><circle cx="620" cy="370" r="42" fill="#fff"/>`;
  g += `<path d="M626 340 L 604 376 H 620 L 614 402 L 638 364 H 621 Z" fill="${C.amber}"/>`;
  // phone card
  g += `<g filter="url(#shadow)"><rect x="80" y="620" width="400" height="200" rx="28" fill="#fff"/></g>`;
  g += `<circle cx="160" cy="720" r="44" fill="${C.mint}"/><path d="M142 700 C 142 696 146 692 150 692 L 158 692 L 164 708 L 156 714 C 160 724 166 730 176 734 L 182 726 L 198 732 L 198 740 C 198 744 194 748 190 748 C 162 746 144 728 142 700 Z" fill="${C.teal}"/>`;
  g += `<rect x="226" y="690" width="200" height="18" rx="9" fill="${C.navy}"/><rect x="226" y="724" width="150" height="12" rx="6" fill="${C.wall3}"/>`;
  // calendar card
  g += `<g filter="url(#shadow)"><rect x="760" y="600" width="360" height="240" rx="28" fill="#fff"/></g><rect x="760" y="600" width="360" height="64" rx="28" fill="${C.navy}"/><rect x="760" y="636" width="360" height="28" fill="${C.navy}"/>`;
  g += Array.from({ length: 10 }, (_, i) => `<rect x="${796 + (i % 5) * 62}" y="${690 + Math.floor(i / 5) * 62}" width="44" height="44" rx="10" fill="${i === 6 ? C.amber : C.wall2}"/>`).join('');
  g += chip(780, 120, 'Book a consultation', C.teal, 'check');
  return svg(W, H, g);
};

/* ---------- Privacy ---------- */
scenes['privacy'] = () => {
  const W = 1200, H = 900;
  let g = `<rect width="${W}" height="${H}" fill="#eef4f7"/><circle cx="600" cy="450" r="330" fill="#e1eef3"/>`;
  g += `<g filter="url(#shadow)"><rect x="300" y="250" width="300" height="400" rx="24" fill="#fff" transform="rotate(-8 450 450)"/></g>`;
  g += `<g filter="url(#shadow)"><path d="M600 180 L 820 260 V 450 C 820 590, 720 680, 600 730 C 480 680, 380 590, 380 450 V 260 Z" fill="${C.navy}"/></g>`;
  g += `<path d="M600 230 L 776 294 V 452 C 776 566, 696 640, 600 682 C 504 640, 424 566, 424 452 V 294 Z" fill="${C.navy2}"/>`;
  g += `<rect x="530" y="430" width="140" height="120" rx="18" fill="${C.amber}"/><path d="M558 430 V 396 A 42 42 0 0 1 642 396 V 430" stroke="${C.amber}" stroke-width="18" fill="none"/><circle cx="600" cy="482" r="14" fill="${C.navy}"/><rect x="594" y="486" width="12" height="34" rx="6" fill="${C.navy}"/>`;
  return svg(W, H, g);
};

/* ---------- Brand mark (placeholder logo) ---------- */
function logoMark() {
  return `<rect width="64" height="64" rx="16" fill="#406093"/><path d="M36 10 L 16 37 H 30 L 26 54 L 48 26 H 34 Z" fill="#93d16b"/><path d="M16 50 C 22 44 30 44 36 50" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
}
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${logoMark()}</svg>\n`;

let count = 0;
for (const [name, fn] of Object.entries(scenes)) {
  fs.writeFileSync(path.join(OUT, `${name}.svg`), fn());
  count++;
}
fs.writeFileSync(path.join(OUT, 'favicon.svg'), favicon);
module.exports = { logoMark };
console.log(`Wrote ${count} illustrations + favicon to ${path.relative(process.cwd(), OUT)}`);
