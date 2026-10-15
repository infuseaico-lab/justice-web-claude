#!/usr/bin/env node
/*
 * Downloads the site's photographs from Pexels (free to use, no attribution
 * required: https://www.pexels.com/license/) and crops each to 4:3 in two sizes.
 *
 *   node scripts/fetch-photos.js            download every slot's chosen photo
 *   node scripts/fetch-photos.js --candidates <dir>   download all candidates for review
 *
 * Needs network access to images.pexels.com and ImageMagick (`convert`).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');

const photos = require('../src/content/photos');
const OUT = path.join(__dirname, '..', 'src', 'assets', 'photos');

const url = (id, w) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

function download(src, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(src, { headers: { 'User-Agent': 'justice-energy-site-build' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return download(new URL(res.headers.location, src).href, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${src}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', reject);
  });
}

// Crop to 4:3 around the chosen focal point, then write a large and a small JPEG.
function crop(src, slot, gravity = 'center') {
  for (const [w, suffix] of [[1600, ''], [800, '-800']]) {
    const h = Math.round((w * 3) / 4);
    execFileSync('convert', [src, '-auto-orient', '-resize', `${w}x${h}^`, '-gravity', gravity, '-extent', `${w}x${h}`, '-strip', '-interlace', 'Plane', '-quality', '80', path.join(OUT, `${slot}${suffix}.jpg`)]);
  }
}

(async () => {
  const review = process.argv.indexOf('--candidates');
  if (review !== -1) {
    const dir = path.resolve(process.argv[review + 1] || 'photo-candidates');
    fs.mkdirSync(dir, { recursive: true });
    for (const p of photos) {
      for (const id of p.candidates) {
        const dest = path.join(dir, `${p.slot}--${id}.jpg`);
        try {
          await download(url(id, 800), dest);
          console.log('ok  ', p.slot, id);
        } catch (e) {
          console.log('fail', p.slot, id, e.message);
        }
      }
    }
    return;
  }
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'photos-'));
  for (const p of photos) {
    if (!p.id) {
      console.log('skip', p.slot, '(no photo chosen yet)');
      continue;
    }
    const raw = path.join(tmp, `${p.slot}.jpg`);
    await download(url(p.id, 2000), raw);
    crop(raw, p.slot, p.gravity);
    console.log('saved', p.slot, `pexels ${p.id}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
