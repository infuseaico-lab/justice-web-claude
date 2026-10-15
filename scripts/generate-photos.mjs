#!/usr/bin/env node
/*
 * Generates photo-realistic AI images for the site's photo slots and installs them
 * as the slot defaults (src/assets/slots/<slot>.webp + -800.webp, with JPG copies).
 * Prompts live in src/content/photo-prompts.js.
 *
 *   node scripts/generate-photos.mjs                      every slot that has no photo yet
 *   node scripts/generate-photos.mjs --slots hero-home,hvac
 *   node scripts/generate-photos.mjs --slots hvac --force  replace an existing photo
 *   node scripts/generate-photos.mjs --dry-run            print the prompts only
 *   node scripts/generate-photos.mjs --use hero-home=/path/photo.jpg   install your own photo instead
 *
 * Providers (the first key found is used, or pick one with --provider):
 *   OPENAI_API_KEY  OpenAI gpt-image-1            (api.openai.com)
 *   FAL_KEY         fal.ai nano-banana-pro         (fal.run, fal.media)
 *   GEMINI_API_KEY  Google gemini-2.5-flash-image  (generativelanguage.googleapis.com)
 *   MAX_API_KEY     Maxgent, via .claude/skills/image-gen (api.maxgent.ai)
 *
 * In a Claude Code cloud environment, store the key as a network secret instead and run
 *   NODE_USE_ENV_PROXY=1 node scripts/generate-photos.mjs --provider openai
 * (the proxy adds the key; Node's fetch needs NODE_USE_ENV_PROXY=1 to use the proxy).
 *
 * Then run `node scripts/raster.js` (social share cards) and `node build.js`.
 * Needs Node 18+ and ImageMagick (`magick` or `convert`).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLOTS_DIR = path.join(ROOT, 'src', 'assets', 'slots');
const { STYLE, slots } = require(path.join(ROOT, 'src', 'content', 'photo-prompts.js'));

/* ---------- options ---------- */
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : undefined;
};
const uses = args.flatMap((a, i) => (a === '--use' ? [args[i + 1]] : []));

const imagemagick = (() => {
  for (const bin of ['magick', 'convert']) {
    try {
      execFileSync(bin, ['-version'], { stdio: 'ignore' });
      return bin;
    } catch {}
  }
  return null;
})();

/* ---------- install an image into a slot ---------- */
function install(slot, source) {
  if (!imagemagick) throw new Error('ImageMagick is required (install it so `magick` or `convert` is available).');
  fs.mkdirSync(SLOTS_DIR, { recursive: true });
  const out = (name) => path.join(SLOTS_DIR, name);
  const crop = (w, h, dest, quality) =>
    execFileSync(imagemagick, [source, '-auto-orient', '-filter', 'Lanczos', '-resize', `${w}x${h}^`, '-gravity', 'center', '-extent', `${w}x${h}`, '-strip', '-quality', String(quality), ...(dest.endsWith('.jpg') ? ['-interlace', 'Plane'] : ['-define', 'webp:method=6']), dest]);
  crop(1600, 1200, out(`${slot}.webp`), 82);
  crop(800, 600, out(`${slot}-800.webp`), 80);
  crop(1600, 1200, out(`${slot}.jpg`), 82);
  crop(800, 600, out(`${slot}-800.jpg`), 80);
  console.log(`  installed ${slot}: src/assets/slots/${slot}.webp (1600x1200) + ${slot}-800.webp (800x600) + JPG copies`);
}

/* ---------- providers ---------- */
async function readJson(res) {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 300) };
  }
  if (!res.ok) {
    const msg = data?.error?.message || data?.detail || data?.message || data?.raw || res.statusText;
    throw new Error(`HTTP ${res.status}: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
  }
  return data;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

// With no key in the environment, the header is left out so a proxy that holds the key
// (for example a Claude Code cloud environment's network secret) can add it.
const auth = (header, prefix, key) => (process.env[key] ? { [header]: `${prefix}${process.env[key]}` } : {});

const providers = {
  openai: {
    key: 'OPENAI_API_KEY',
    async generate(prompt, dest) {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { ...auth('Authorization', 'Bearer ', 'OPENAI_API_KEY'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: value('model') || 'gpt-image-1', prompt, size: '1536x1024', quality: 'high', n: 1 }),
      });
      const data = await readJson(res);
      const item = data.data?.[0];
      if (item?.b64_json) fs.writeFileSync(dest, Buffer.from(item.b64_json, 'base64'));
      else if (item?.url) await download(item.url, dest);
      else throw new Error('No image in the response.');
    },
  },
  fal: {
    key: 'FAL_KEY',
    async generate(prompt, dest) {
      const model = value('model') || 'fal-ai/nano-banana-pro';
      const res = await fetch(`https://fal.run/${model}`, {
        method: 'POST',
        headers: { ...auth('Authorization', 'Key ', 'FAL_KEY'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspect_ratio: '4:3', image_size: 'landscape_4_3', num_images: 1, output_format: 'png' }),
      });
      const data = await readJson(res);
      const url = data.images?.[0]?.url;
      if (!url) throw new Error('No image in the response.');
      await download(url, dest);
    },
  },
  gemini: {
    key: 'GEMINI_API_KEY',
    async generate(prompt, dest) {
      const model = value('model') || 'gemini-2.5-flash-image';
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { ...auth('x-goog-api-key', '', 'GEMINI_API_KEY'), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:3' } },
        }),
      });
      const data = await readJson(res);
      const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      if (!part) throw new Error('No image in the response.');
      fs.writeFileSync(dest, Buffer.from(part.inlineData.data, 'base64'));
    },
  },
  maxgent: {
    key: 'MAX_API_KEY',
    async generate(prompt, dest) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'maxgent-'));
      execFileSync('bun', [path.join(ROOT, '.claude/skills/image-gen/image-gen.js'), '--model', value('model') || 'auto', '--prompt', prompt, '--aspect-ratio', '4:3', '--num-images', '1', '--output-format', 'png', '--output-dir', dir], { stdio: 'inherit' });
      const file = fs.readdirSync(dir).find((f) => /\.(png|jpe?g|webp)$/i.test(f));
      if (!file) throw new Error('No image was produced.');
      fs.copyFileSync(path.join(dir, file), dest);
    },
  },
};

/* ---------- run ---------- */
(async () => {
  // Your own photos: --use slot=/path/to/photo.jpg
  if (uses.length) {
    for (const pair of uses) {
      const [slot, file] = pair.split('=');
      if (!slots[slot]) throw new Error(`Unknown slot "${slot}". Slots: ${Object.keys(slots).join(', ')}`);
      if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
      install(slot, file);
    }
    console.log('\nNext: node scripts/raster.js && node build.js');
    return;
  }

  const wanted = value('slots') ? value('slots').split(',').map((s) => s.trim()) : Object.keys(slots);
  for (const s of wanted) if (!slots[s]) throw new Error(`Unknown slot "${s}". Slots: ${Object.keys(slots).join(', ')}`);
  const todo = wanted.filter((s) => flag('force') || !fs.existsSync(path.join(SLOTS_DIR, `${s}.webp`)));
  const skipped = wanted.filter((s) => !todo.includes(s));
  if (skipped.length) console.log(`Skipping slots that already have a photo (use --force to replace): ${skipped.join(', ')}`);
  if (!todo.length) return console.log('Nothing to generate.');

  if (flag('dry-run')) {
    for (const s of todo) console.log(`\n[${s}]\n${slots[s].prompt} ${STYLE}`);
    return;
  }

  const name = value('provider') || Object.keys(providers).find((p) => process.env[providers[p].key]);
  const provider = providers[name];
  if (!provider) {
    throw new Error('No image API key found. Set one of OPENAI_API_KEY, FAL_KEY, GEMINI_API_KEY or MAX_API_KEY (or pass --provider).');
  }
  if (!process.env[provider.key]) {
    if (name === 'maxgent') throw new Error(`${provider.key} is not set.`);
    console.log(`${provider.key} is not set: sending requests without it, for a proxy that adds the key.`);
  }
  console.log(`Generating ${todo.length} photo(s) with ${name}…`);

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'je-photos-'));
  const failures = [];
  for (const slot of todo) {
    const raw = path.join(work, `${slot}.png`);
    process.stdout.write(`- ${slot}: generating… `);
    try {
      await provider.generate(`${slots[slot].prompt} ${STYLE}`, raw);
      console.log('done');
      install(slot, raw);
    } catch (e) {
      console.log('failed');
      console.error(`  ${e.message}`);
      failures.push(slot);
      // Out of credits or not allowed: stop instead of failing every slot.
      if (/HTTP (401|402|403|429)/.test(e.message)) break;
    }
  }
  fs.rmSync(work, { recursive: true, force: true });
  if (failures.length) console.log(`\nFailed: ${failures.join(', ')}`);
  console.log('\nNext: node scripts/raster.js && node build.js');
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
