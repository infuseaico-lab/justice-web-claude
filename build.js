#!/usr/bin/env node
/*
 * Static site builder for Justice Energy Co. No dependencies.
 * Reads src/ (config, content, assets) and writes the finished site to dist/.
 *   node build.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const site = require('./src/site.config');
const services = require('./src/content/services');
const programs = require('./src/content/programs');
const testimonials = require('./src/content/testimonials');

const BUILD_DATE = new Date().toISOString().slice(0, 10);
const YEAR = new Date().getFullYear();

/* ---------- helpers ---------- */
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.url + p;
// Lower-case a service name for use mid-sentence, keeping acronyms such as HVAC and LED.
const lc = (name) => name.replace(/\b([A-Za-z][a-z]*)\b/g, (w) => w.toLowerCase());
const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
const programById = Object.fromEntries(programs.map((p) => [p.id, p]));

function hashFile(p) {
  return crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex').slice(0, 8);
}
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/* ---------- icons (24px stroke icons) ---------- */
const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  flame: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 3-5 5-5 8a7 7 0 0 0 7 7z"/>',
  fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7s3 4-2 7M14 12c4 0 7 1 7 4s-4 3-7-2M12 14c0 4-1 7-4 7s-3-4 2-7M10 12c-4 0-7-1-7-4s4-3 7 2"/>',
  drop: '<path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z"/>',
  leaf: '<path d="M5 21c0-9 6-15 15-16-1 9-7 15-15 16z"/><path d="M5 21 14 12"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 12c0-4-3-7-8-7 0 4 3 7 8 7zM12 10c0-4 3-7 8-7 0 4-3 7-8 7z"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 18 4-6"/>',
  faucet: '<path d="M4 9h9a4 4 0 0 1 4 4v1"/><path d="M8 9V6h4v3M17 17v.5M17 20.5v.5"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12l2 2 4-4"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  chat: '<path d="M4 5h16v11H8l-4 4z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/>',
  linkedin: '<path d="M4 9h4v11H4zM6 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 9h4v1.5c.6-1 2-1.8 3.5-1.8 3 0 3.5 2 3.5 4.6V20h-4v-5.8c0-1.3-.2-2.4-1.6-2.4S14 13 14 14.3V20h-4z"/>',
  google: '<path d="M20 12.2c0-.6 0-1.1-.1-1.7H12v3.3h4.5a3.9 3.9 0 0 1-1.7 2.5v2h2.7c1.6-1.5 2.5-3.6 2.5-6.1z"/><path d="M12 20c2.3 0 4.1-.8 5.5-2l-2.7-2a5 5 0 0 1-7.5-2.6H4.5v2.1A8 8 0 0 0 12 20z"/><path d="M7.3 13.4a4.8 4.8 0 0 1 0-3V8.3H4.5a8 8 0 0 0 0 7.2z"/><path d="M12 7.2c1.3 0 2.5.5 3.4 1.3l2.5-2.5A8 8 0 0 0 4.5 8.3l2.8 2.1A4.8 4.8 0 0 1 12 7.2z"/>',
};
const icon = (name, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${ICONS[name] || ICONS.check}</svg>`;
const ico = (name, cls = '') => `<span class="ico ${cls}">${icon(name)}</span>`;

const BRANDS = require('./src/content/social-icons');
// Social profile icons; each becomes a link once its URL is set in site.config.js.
function socialIcons(cls) {
  return Object.keys(BRANDS)
    .map((k) => {
      const b = BRANDS[k];
      const svg = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${b.path}"/></svg>`;
      const url = site.social[k];
      return url
        ? `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(site.name)} on ${b.title}">${svg}</a>`
        : `<span class="${cls}" role="img" aria-label="${b.title} (link coming soon)" title="${b.title}">${svg}</span>`;
    })
    .join('');
}
function topbar() {
  return `<div class="topbar">
  <div class="container topbar-inner">
    <p class="topbar-text">${icon('pin')}<span class="long">${esc(site.topbarText)}</span><span class="short">${esc(site.topbarTextShort || site.topbarText)}</span></p>
    <div class="topbar-social">${socialIcons('topbar-icon')}</div>
  </div>
</div>`;
}

const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect width="64" height="64" rx="16" fill="#406093"/><path d="M36 10 L 16 37 H 30 L 26 54 L 48 26 H 34 Z" fill="#93d16b"/><path d="M16 50 C 22 44 30 44 36 50" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
const brand = () =>
  `<a class="brand" href="/" aria-label="${esc(site.name)} — home">${LOGO}<span class="brand-text"><strong>Justice Energy</strong><span>Co.</span></span></a>`;

/* ---------- images ---------- */
// Every photo on the site sits in a named slot served from /img/slot/<slot>.jpg. The server
// (.htaccess) returns the photo uploaded in the admin when there is one, and the default in
// /assets/slots/ otherwise, so the admin can replace a photo without rebuilding the site.
const SLOTS = [
  { id: 'hero-home', label: 'Home page, main photo', usedOn: 'Home page (top), About page (service area)' },
  { id: 'services-cutaway', label: 'Services overview', usedOn: 'Services page (top)' },
  { id: 'water-heating', label: 'Water heating', usedOn: 'Water heating page, service cards' },
  { id: 'hvac', label: 'HVAC & heat pumps', usedOn: 'HVAC & heat pumps page, service cards' },
  { id: 'water-conservation', label: 'Water conservation', usedOn: 'Water conservation page, service cards' },
  { id: 'turf-replacement', label: 'Turf replacement', usedOn: 'Turf replacement page, service cards' },
  { id: 'led-lighting', label: 'LED lighting', usedOn: 'LED lighting page, service cards' },
  { id: 'programs', label: 'Programs', usedOn: 'Programs page (top), programs sections on the home and service pages' },
  { id: 'about', label: 'About', usedOn: 'About page (top), home page (about section)' },
  { id: 'contact', label: 'Contact & call to action', usedOn: 'Call-to-action banners on every page, thank-you page' },
  { id: 'privacy', label: 'Privacy policy', usedOn: 'Privacy policy page' },
];
// A slot whose default ships as WebP (src/assets/slots/<slot>.webp) is served as WebP; others as JPG.
const slotExt = (name) => (fs.existsSync(path.join(SRC, 'assets', 'slots', `${name}.webp`)) ? 'webp' : 'jpg');
function img(name, alt, { eager = false, sizes = '(min-width: 1024px) 50vw, 100vw' } = {}) {
  const loading = eager ? ' fetchpriority="high"' : ' loading="lazy"';
  const ext = slotExt(name);
  return `<img src="/img/slot/${name}.${ext}" srcset="/img/slot/${name}-800.${ext} 800w, /img/slot/${name}.${ext} 1600w" sizes="${sizes}" alt="${esc(alt)}" width="1600" height="1200"${loading} decoding="async">`;
}
const imgUrl = (name) => `/img/slot/${name}.${slotExt(name)}`;

/* ---------- schema ---------- */
function businessSchema() {
  const b = {
    '@type': 'HomeAndConstructionBusiness',
    '@id': abs('/#business'),
    name: site.name,
    url: abs('/'),
    description: site.description,
    logo: abs('/assets/img/logo.png'),
    image: abs('/assets/og/home.jpg'),
    areaServed: site.areaServed.map((a) => ({ '@type': 'AdministrativeArea', name: a })),
    knowsAbout: services.map((s) => s.name),
  };
  // Contact details go into the markup only once the client has verified them.
  if (site.detailsVerified) {
    if (site.phone) b.telephone = site.phoneHref;
    if (site.email) b.email = site.email;
    if (site.address.street) {
      b.address = {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.region,
        postalCode: site.address.postalCode,
        addressCountry: site.address.country,
      };
    }
    if (site.openingHours.length) b.openingHours = site.openingHours;
  }
  const sameAs = Object.values(site.social).filter(Boolean);
  if (sameAs.length) b.sameAs = sameAs;
  return b;
}
function breadcrumbSchema(crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.href) })),
  };
}
function faqSchema(faqs) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

/* ---------- layout ---------- */
const CSS_V = hashFile(path.join(SRC, 'assets/css/styles.css'));
const JS_V = hashFile(path.join(SRC, 'assets/js/main.js'));

function head(page) {
  const title = page.fullTitle || `${page.title} | ${site.name}`;
  const canonical = abs(page.path);
  const og = abs(`/assets/og/${page.og || 'home'}.jpg`);
  const graph = [...(page.schema || [])];
  const ld = graph.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>` : '';
  const ga = site.ga4
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.ga4)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(site.ga4)}');</script>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#f6b941">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(page.ogTitle || title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.ogTitle || page.title)} — ${esc(site.name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.ogTitle || title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${og}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
${page.preload ? `<link rel="preload" as="image" href="${imgUrl(page.preload)}" fetchpriority="high">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="/assets/css/styles.css?v=${CSS_V}">
${ld}
${ga}
</head>`;
}

function header(page) {
  const cur = (p) => (page.path === p || (p !== '/' && page.path.startsWith(p)) ? ' aria-current="page"' : '');
  const subItems = services
    .map(
      (s) =>
        `<li><a href="/services/${s.slug}/"${page.path === `/services/${s.slug}/` ? ' aria-current="page"' : ''}>${ico(s.icon)}<strong>${esc(s.name)}</strong><small>${esc(s.summary)}</small></a></li>`
    )
    .join('');
  return `<a class="skip-link" href="#main">Skip to content</a>
${topbar()}
<header class="site-header" data-header>
  <div class="container header-inner">
    ${brand()}
    <nav class="nav" id="site-nav" aria-label="Main">
      <ul class="nav-list">
        <li class="has-sub">
          <a href="/services/"${cur('/services/')}>Services</a>
          <button class="sub-toggle" type="button" aria-expanded="false" aria-controls="sub-services">${icon('chevron')}<span class="sr-only">Show services</span></button>
          <ul class="sub" id="sub-services">${subItems}<li><a class="sub-all" href="/services/">View all services →</a></li></ul>
        </li>
        <li><a href="/programs/"${cur('/programs/')}>Programs</a></li>
        <li><a href="/gallery/"${cur('/gallery/')}>Gallery</a></li>
        <li><a href="/about/"${cur('/about/')}>About</a></li>
        <li><a href="/contact/"${cur('/contact/')}>Contact</a></li>
      </ul>
      <div class="nav-mobile-cta">
        <a class="btn btn-accent btn-lg" href="/contact/">Request a consultation</a>
        <a class="btn btn-call btn-lg" href="tel:${site.phoneHref}">${icon('phone')} Call ${esc(site.phone)}</a>
      </div>
    </nav>
    <div class="header-actions">
      <a class="header-phone" href="tel:${site.phoneHref}" aria-label="Call ${esc(site.phone)}">${icon('phone')}<span>${esc(site.phone)}</span></a>
      <a class="btn btn-accent btn-sm" href="/contact/">Request a consultation</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="bars"></span><span class="sr-only">Open menu</span></button>
    </div>
  </div>
</header>`;
}

function footer() {
  const social = socialIcons('footer-icon');
  const addr = [site.address.street, site.address.city && `${site.address.city}, ${site.address.region} ${site.address.postalCode}`.trim()]
    .filter(Boolean)
    .join('<br>');
  return `<footer class="site-footer">
  <div class="container footer-top">
    <div>
      ${brand()}
      <p>${esc(site.tagline)}. Helping homeowners plan upgrades, understand program options and request a consultation.</p>
      ${social ? `<div class="footer-social">${social}</div>` : ''}
    </div>
    <div>
      <h2>Services</h2>
      <ul>${services.map((s) => `<li><a href="/services/${s.slug}/">${esc(s.name)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2>Company</h2>
      <ul>
        <li><a href="/about/">About us</a></li>
        <li><a href="/services/">All services</a></li>
        <li><a href="/programs/">Programs</a></li>
        <li><a href="/gallery/">Gallery</a></li>
        <li><a href="/contact/">Request a consultation</a></li>
        <li><a href="/privacy-policy/">Privacy policy</a></li>
      </ul>
    </div>
    <div>
      <h2>Contact</h2>
      <ul class="footer-contact">
        <li>${icon('phone')}<a href="tel:${site.phoneHref}">${esc(site.phone)}</a></li>
        <li>${icon('mail')}<a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
        <li>${icon('pin')}<span>${addr || `Serving ${esc(site.serviceArea)}`}</span></li>
        ${site.hours ? `<li>${icon('clock')}<span>${esc(site.hours)}${site.hoursClosed ? `<br>${esc(site.hoursClosed)}` : ''}</span></li>` : ''}
      </ul>
    </div>
  </div>
  <div class="container">
    <p class="footer-disclaimer">Program participation, incentive amounts, eligibility and funding availability are set by each program and are not guaranteed. Illustrations on this site are for explanation only and do not depict completed client projects.</p>
    <div class="footer-bottom">
      <p>© ${YEAR} ${esc(site.name)} All rights reserved.${site.license ? ` ${esc(site.license)}` : ''}</p>
      <p><a href="/privacy-policy/">Privacy policy</a> · <a href="/sitemap.xml" target="_blank" rel="noopener">Sitemap</a></p>
    </div>
  </div>
</footer>
<div class="action-bar" aria-label="Quick actions">
  <a class="btn btn-call" href="tel:${site.phoneHref}">${icon('phone')} Call</a>
  <a class="btn btn-accent" href="/contact/">Get a consultation</a>
</div>
<script src="/assets/js/main.js?v=${JS_V}" defer></script>`;
}

function layout(page, body) {
  return `${head(page)}
<body>
${header(page)}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`;
}

/* ---------- components ---------- */
function breadcrumbs(crumbs) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<li><span aria-current="page">${esc(c.name)}</span></li>` : `<li><a href="${c.href}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

function ctas({ primary = { href: '/contact/', label: 'Request a consultation' }, phone = true } = {}) {
  return `<div class="btn-row">
    <a class="btn ${/consultation/i.test(primary.label) ? 'btn-accent' : 'btn-primary'} btn-lg" href="${primary.href}">${esc(primary.label)} ${icon('arrow')}</a>
    ${phone ? `<a class="btn btn-call btn-lg" href="tel:${site.phoneHref}">${icon('phone')} ${esc(site.phone)}</a>` : ''}
  </div>`;
}

function pageHero({ crumbs, eyebrow, h1, lead, image, alt, cta, badge, points, oneLine }) {
  return `<section class="hero page-hero${image ? '' : ' page-hero--text'}${oneLine ? ' page-hero--one-line' : ''}">
  <div class="container">
    ${crumbs ? breadcrumbs(crumbs) : ''}
    <div class="hero-grid">
      <div>
        ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
        <h1>${h1}</h1>
        <p class="lead">${lead}</p>
        ${cta === false ? '' : ctas(cta)}
        ${points ? `<ul class="hero-points">${points.map((p) => `<li>${icon('check')}${esc(p)}</li>`).join('')}</ul>` : ''}
      </div>
      ${
        image
          ? `<div class="hero-media"><div class="frame">${img(image, alt, { eager: true })}</div>${
              badge ? `<div class="hero-badge">${ico(badge.icon || 'bolt', 'ico--navy')}<div><strong>${esc(badge.title)}</strong><span>${esc(badge.text)}</span></div></div>` : ''
            }</div>`
          : ''
      }
    </div>
  </div>
</section>`;
}

function sectionHead({ eyebrow, title, text, center = false, tag = 'h2' }) {
  return `<div class="section-head${center ? ' section-head--center' : ''}" data-reveal>
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <${tag}>${title}</${tag}>
    ${text ? `<p class="lead">${text}</p>` : ''}
  </div>`;
}

function serviceCard(s, headingTag = 'h3') {
  return `<article class="card" data-reveal>
    <div class="card-media">${img(s.image, s.imageAlt)}</div>
    <div class="card-body">
      ${ico(s.icon)}
      <${headingTag}><a href="/services/${s.slug}/">${esc(s.name)}</a></${headingTag}>
      <p>${esc(s.summary)}</p>
      <span class="text-link">Learn more ${icon('arrow')}</span>
    </div>
  </article>`;
}

function featureCard() {
  return `<article class="card card--feature" data-reveal>
    <div class="card-body">
      <h3>Not sure where to start?</h3>
      <p>Tell us about your home and goals. We will help you prioritize upgrades and point out programs that may apply.</p>
      <a class="btn btn-accent" href="/contact/">Request a consultation ${icon('arrow')}</a>
    </div>
  </article>`;
}

const DEFAULT_STEPS = [
  { title: 'Request a consultation', text: 'Send the form or call us. Tell us about your property and the upgrades you are considering.' },
  { title: 'Review your options', text: 'We look at your home, explain suitable equipment and fixtures, and answer your questions.' },
  { title: 'Check program fit', text: 'We point out programs that may apply and what they typically require, before any work begins.' },
  { title: 'Upgrade & follow up', text: 'We schedule the installation, complete the work and walk you through your new equipment.' },
];
// Each step shows an icon for what happens at that stage (the list stays an ordered list for screen readers).
const STEP_ICONS = ['chat', 'clipboard', 'shield', 'wrench'];
function steps(list = DEFAULT_STEPS) {
  return `<ol class="steps">${list
    .map((s, i) => `<li class="step" data-reveal><span class="step-icon" aria-hidden="true">${icon(s.icon || STEP_ICONS[i] || 'check')}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`)
    .join('')}</ol>`;
}

function faqBlock(faqs, center = false) {
  return `<div class="faq${center ? ' faq--center' : ''}">${faqs
    .map((f) => `<details data-reveal><summary>${esc(f.q)}</summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`)
    .join('')}</div>`;
}

function testimonialsSection() {
  const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return `<section class="section section--tint" aria-labelledby="reviews-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Testimonials', title: '<span id="reviews-title">What our customers say</span>', center: true })}
    <div class="testimonials">${testimonials
      .map(
        (t) => `<figure class="testimonial" data-reveal>
        <span class="testimonial-mark" aria-hidden="true">&rdquo;</span>
        <blockquote><p>${esc(t.quote)}</p></blockquote>
        <figcaption><span class="testimonial-avatar" aria-hidden="true">${esc(initials(t.name))}</span><span class="testimonial-who"><strong>${esc(t.name)}</strong><span>${esc(t.location)}</span></span></figcaption>
      </figure>`
      )
      .join('')}</div>
  </div>
</section>`;
}

function ctaBand({ title = 'Ready to plan your upgrade?', text, image = 'contact', alt = 'Illustration of a map pin, a phone card and a calendar for scheduling a consultation', primary } = {}) {
  return `<section class="cta-band" aria-labelledby="cta-title">
  <div class="container">
    <div class="cta-card" data-reveal>
      <div>
        <p class="eyebrow">Request a consultation</p>
        <h2 id="cta-title">${title}</h2>
        <p>${text || 'Tell us about your property and the upgrades you have in mind. We will follow up to talk through options, next steps and programs that may apply.'}</p>
        <div class="btn-row">
          <a class="btn btn-accent btn-lg" href="${(primary && primary.href) || '/contact/'}">${esc((primary && primary.label) || 'Request a consultation')} ${icon('arrow')}</a>
          <a class="btn btn-call btn-lg" href="tel:${site.phoneHref}">${icon('phone')} ${esc(site.phone)}</a>
        </div>
      </div>
      <div class="cta-media">${img(image, alt)}</div>
    </div>
  </div>
</section>`;
}

function programNotice() {
  return `<div class="notice">${icon('info')}<p>Incentive amounts, eligibility and funding availability are determined by each program and can change. They are not guaranteed. We will review current program information with you before you commit to any work.</p></div>`;
}

/* ---------- pages ---------- */
const pages = [];
function addPage(page, body) {
  pages.push({ ...page, html: layout(page, body) });
}

const VALUES = [
  { icon: 'layers', title: 'Five upgrade types, one team', text: 'Water heating, heat pumps, water conservation, turf and LED lighting.' },
  { icon: 'clipboard', title: 'Program-aware guidance', text: 'We point out programs that may apply before work begins.' },
  { icon: 'chat', title: 'Clear explanations', text: 'Straightforward options, so you can compare and decide.' },
  { icon: 'calendar', title: 'Simple next steps', text: 'Request a consultation online or by phone in minutes.' },
];

/* Home */
(function home() {
  const homeFaqs = [
    {
      q: 'What upgrades does Justice Energy Co. offer?',
      a: 'We offer water heating upgrades (tankless, heat pump and condensing tank-type water heaters), mini-split and split-system heat pumps, water conservation fixtures, turf replacement and LED lighting retrofits.',
    },
    {
      q: 'Can you help me find rebates or incentive programs?',
      a: 'Yes. We work with several programs and can explain which ones may apply to your upgrade. Incentive amounts, eligibility and funding availability are set by each program and are not guaranteed.',
    },
    {
      q: 'What happens after I request a consultation?',
      a: 'We review your request and contact you to learn more about your property and goals. From there we discuss options, next steps and any programs that may apply.',
    },
    {
      q: 'Which areas do you serve?',
      a: `We serve homeowners in ${site.serviceArea}. Share your property location in the consultation form and we will confirm availability.`,
    },
  ];
  const body = `
<section class="hero">
  <div class="container hero-grid">
    <div>
      <p class="eyebrow">Energy-efficiency upgrades · ${esc(site.serviceArea)}</p>
      <h1>Energy-efficiency upgrades &amp; retrofits for <span class="hl">Southern California</span> homes</h1>
      <p class="lead">Justice Energy Co. helps homeowners lower energy and water use with efficient water heaters, heat pumps, water-saving fixtures, turf replacement and LED lighting, and helps you understand the programs that may support your upgrade.</p>
      ${ctas()}
      <ul class="hero-points">
        <li>${icon('check')}Heat pump &amp; tankless options</li>
        <li>${icon('check')}Program-aware guidance</li>
        <li>${icon('check')}Clear, step-by-step process</li>
      </ul>
    </div>
    <div class="hero-media">
      <div class="frame">${img('hero-home', 'Illustration of an energy-efficient home with an outdoor heat pump, warm LED-lit windows and a water-wise front yard', { eager: true })}</div>
    </div>
  </div>
</section>

<section class="section--tight" aria-label="Why homeowners choose us">
  <div class="container"><div class="values values--overlap">${VALUES.map((v) => `<div class="value" data-reveal>${ico(v.icon)}<div><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div></div>`).join('')}</div></div>
</section>

<section class="section" aria-labelledby="services-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Our services', title: '<span id="services-title">Upgrades that make your home more efficient</span>', text: 'Five focused services, each explained clearly so you can see what fits your home before you commit.' })}
    <div class="cards cards--3">${services.map((s) => serviceCard(s)).join('')}${featureCard()}</div>
  </div>
</section>

<section class="section section--tint" aria-labelledby="process-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'How it works', title: '<span id="process-title">From first call to finished upgrade</span>', text: 'A straightforward process that keeps you informed at every step.', center: true })}
    ${steps()}
  </div>
</section>

<section class="section" aria-labelledby="programs-title">
  <div class="container split">
    <div class="media-frame" data-reveal>${img('programs', 'Illustration of three steps: a home assessment, a program review checklist and an energy upgrade')}</div>
    <div data-reveal>
      <p class="eyebrow">Programs</p>
      <h2 id="programs-title">Understand the programs behind your upgrade</h2>
      <p class="lead">Energy and water programs can make upgrades more accessible, but the details matter. We work with several programs and explain how they may apply to your project.</p>
      <ul class="pills">${programs.map((p) => `<li><a class="pill" href="/programs/#${p.id}">${esc(p.name)}</a></li>`).join('')}</ul>
      <a class="btn btn-outline" href="/programs/">Explore programs ${icon('arrow')}</a>
    </div>
  </div>
</section>

<section class="section section--mint" aria-labelledby="about-title">
  <div class="container split split--reverse">
    <div class="media-frame" data-reveal>${img('about', 'Illustration of a home next to a tablet showing a home assessment checklist and a hard hat')}</div>
    <div data-reveal>
      <p class="eyebrow">About Justice Energy Co.</p>
      <h2 id="about-title">Practical upgrades, explained in plain language</h2>
      <p class="lead">We focus on the upgrades that make a real difference to how a home uses energy and water, and on making the process easy to follow.</p>
      <ul class="checklist">
        <li>${icon('check')}Options matched to your home, not a one-size-fits-all package</li>
        <li>${icon('check')}Clear explanations of equipment, timing and requirements</li>
        <li>${icon('check')}Guidance on program participation before work starts</li>
      </ul>
      <a class="text-link" href="/about/">More about us ${icon('arrow')}</a>
    </div>
  </div>
</section>

${testimonialsSection()}

<section class="section" aria-labelledby="faq-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'FAQ', title: '<span id="faq-title">Common questions</span>', center: true })}
    ${faqBlock(homeFaqs, true)}
  </div>
</section>

${ctaBand()}`;
  addPage(
    {
      path: '/',
      title: 'Home',
      fullTitle: `Energy Efficiency Upgrades in SoCal | ${site.name}`,
      ogTitle: 'Energy-efficiency upgrades & retrofits for Southern California homes',
      description: site.description,
      og: 'home',
      preload: 'hero-home',
      priority: '1.0',
      schema: [
        {
          '@type': 'WebSite',
          '@id': abs('/#website'),
          url: abs('/'),
          name: site.name,
          publisher: { '@id': abs('/#business') },
        },
        businessSchema(),
        faqSchema(homeFaqs),
      ],
    },
    body
  );
})();

/* Services overview */
(function servicesOverview() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Services', href: '/services/' }];
  const body = `
${pageHero({
  crumbs,
  eyebrow: 'Services',
  h1: 'Energy-efficiency services for your whole home',
  lead: 'From the water heater in your garage to the lawn out front, we help you upgrade the systems that use the most energy and water, with clear options for each one.',
  image: 'services-cutaway',
  alt: 'Cutaway illustration of a home showing a water heater, mini-split heat pump, efficient bathroom fixtures, LED kitchen lighting and a water-wise yard',
})}
<section class="section" aria-labelledby="all-services">
  <div class="container">
    ${sectionHead({ eyebrow: 'What we do', title: '<span id="all-services">Choose a service to learn more</span>' })}
    <div class="cards cards--3">${services.map((s) => serviceCard(s, 'h2')).join('')}${featureCard()}</div>
  </div>
</section>
<section class="section section--tint" aria-labelledby="compare-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'At a glance', title: '<span id="compare-title">What each upgrade covers</span>' })}
    <div class="two-panels">
      ${services
        .map(
          (s) => `<div class="panel" data-reveal>
        <div class="program-head">${ico(s.icon, 'ico--lg')}<h3 class="mt-0" style="margin:0">${esc(s.name)}</h3></div>
        <ul class="checklist">${s.options.map((o) => `<li>${icon('check')}${esc(o.name)}</li>`).join('')}</ul>
        <a class="text-link" href="/services/${s.slug}/">${esc(s.name)} details ${icon('arrow')}</a>
      </div>`
        )
        .join('')}
      <div class="panel" data-reveal>
        <div class="program-head">${ico('clipboard', 'ico--lg ico--amber')}<h3 style="margin:0">Programs</h3></div>
        <p>Several programs may support these upgrades. We explain how they work and what they typically require.</p>
        <a class="text-link" href="/programs/">See programs ${icon('arrow')}</a>
      </div>
    </div>
  </div>
</section>
<section class="section" aria-labelledby="process-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Our process', title: '<span id="process-title">How a project comes together</span>', center: true })}
    ${steps()}
  </div>
</section>
${ctaBand({ title: 'Not sure which upgrade comes first?' , text: 'Tell us about your home. We will help you prioritize upgrades based on your goals and point out programs that may apply.' })}`;
  addPage(
    {
      path: '/services/',
      title: 'Energy-Efficiency Services',
      description:
        'Explore our services: water heating, HVAC and heat pumps, water conservation, turf replacement and LED lighting retrofits for Southern California homes.',
      og: 'services',
      preload: 'services-cutaway',
      priority: '0.9',
      schema: [
        breadcrumbSchema(crumbs),
        {
          '@type': 'ItemList',
          itemListElement: services.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: abs(`/services/${s.slug}/`) })),
        },
      ],
    },
    body
  );
})();

/* Service pages */
services.forEach((s) => {
  const p = `/services/${s.slug}/`;
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Services', href: '/services/' }, { name: s.name, href: p }];
  const related = s.programs.map((id) => programById[id]).filter(Boolean);
  const others = services.filter((o) => o.slug !== s.slug);
  const body = `
${pageHero({
  crumbs,
  eyebrow: s.name,
  h1: esc(s.h1),
  lead: esc(s.lead),
  image: s.image,
  alt: s.imageAlt,
  cta: { primary: { href: `/contact/?service=${s.slug}`, label: 'Request a consultation' } },
  points: s.benefits.slice(0, 2),
})}
<section class="section" aria-labelledby="options-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Options', title: `<span id="options-title">${esc(s.name.charAt(0) + lc(s.name).slice(1))} options we offer</span>` })}
    <div class="cards cards--3">${s.options.map((o) => `<div class="option" data-reveal>${ico(o.icon, 'ico--lg')}<h3>${esc(o.name)}</h3><p>${esc(o.text)}</p></div>`).join('')}</div>
  </div>
</section>
<section class="section section--tint" aria-labelledby="benefits-title">
  <div class="container two-panels">
    <div class="panel" data-reveal>
      <p class="eyebrow">Benefits</p>
      <h2 id="benefits-title" style="font-size:1.6rem">Why upgrade</h2>
      <ul class="checklist">${s.benefits.map((b) => `<li>${icon('check')}${esc(b)}</li>`).join('')}</ul>
    </div>
    <div class="panel" data-reveal>
      <p class="eyebrow">Is it time?</p>
      <h2 style="font-size:1.6rem">Signs this upgrade could help</h2>
      <ul class="checklist checklist--amber">${s.signs.map((b) => `<li>${icon('check')}${esc(b)}</li>`).join('')}</ul>
    </div>
  </div>
</section>
<section class="section" aria-labelledby="process-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Process', title: `<span id="process-title">How your ${esc(lc(s.name))} project works</span>`, center: true })}
    ${steps(s.process)}
  </div>
</section>
${
  related.length
    ? `<section class="section section--mint" aria-labelledby="programs-title">
  <div class="container split">
    <div data-reveal>
      <p class="eyebrow">Programs</p>
      <h2 id="programs-title">Programs that may apply</h2>
      <p class="lead">Depending on your property and eligibility, these programs may support this upgrade. We review the current details with you.</p>
      <ul class="pills">${related.map((r) => `<li><a class="pill" href="/programs/#${r.id}">${esc(r.name)}</a></li>`).join('')}</ul>
      ${programNotice()}
    </div>
    <div class="media-frame" data-reveal>${img('programs', 'Illustration of three steps: a home assessment, a program review checklist and an energy upgrade')}</div>
  </div>
</section>`
    : ''
}
<section class="section" aria-labelledby="faq-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'FAQ', title: `<span id="faq-title">${esc(s.name.charAt(0) + lc(s.name).slice(1))} questions</span>`, center: true })}
    ${faqBlock(s.faqs, true)}
  </div>
</section>
<section class="section section--tint" aria-labelledby="more-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'More services', title: '<span id="more-title">Explore other upgrades</span>' })}
    <div class="cards">${others.map((o) => serviceCard(o)).join('')}</div>
  </div>
</section>
${ctaBand({ title: `Talk to us about ${esc(lc(s.name))}`, primary: { href: `/contact/?service=${s.slug}`, label: 'Request a consultation' } })}`;
  addPage(
    {
      path: p,
      title: s.title,
      description: s.metaDescription,
      og: s.slug,
      preload: s.image,
      priority: '0.8',
      schema: [
        breadcrumbSchema(crumbs),
        {
          '@type': 'Service',
          name: s.name,
          serviceType: s.name,
          description: s.metaDescription,
          url: abs(p),
          provider: { '@type': 'HomeAndConstructionBusiness', '@id': abs('/#business'), name: site.name, url: abs('/') },
          areaServed: site.areaServed.map((a) => ({ '@type': 'AdministrativeArea', name: a })),
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `${s.name} options`,
            itemListElement: s.options.map((o) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: o.name, description: o.text } })),
          },
        },
        faqSchema(s.faqs),
      ],
    },
    body
  );
});

/* Programs */
(function programsPage() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Programs', href: '/programs/' }];
  const body = `
${pageHero({
  crumbs,
  eyebrow: 'Programs',
  h1: 'Energy &amp; water programs we work with',
  lead: 'Programs can help make efficiency upgrades more accessible. Here is an overview of the programs Justice Energy Co. works with, the services they relate to and how to ask about them.',
  image: 'programs',
  alt: 'Illustration of three steps: a home assessment, a program review checklist and an energy upgrade',
  cta: { primary: { href: '/contact/', label: 'Ask about a program' } },
})}
<section class="section section--tight" aria-label="Jump to a program">
  <div class="container">
    ${programNotice()}
    <ul class="pills" style="margin-top:24px">${programs.map((p) => `<li><a class="pill pill--soft" href="#${p.id}">${esc(p.name)}</a></li>`).join('')}</ul>
  </div>
</section>
<section class="section" style="padding-top:0" aria-label="Program details">
  <div class="container program-grid">
    ${programs
      .map(
        (p) => `<article class="program" id="${p.id}" data-reveal>
      <div class="program-head">${ico(p.services.every((sl) => ['water-conservation', 'turf-replacement'].includes(sl)) ? 'drop' : 'bolt', 'ico--lg')}<h2>${esc(p.name)}${p.longName ? `<span class="long-name">${esc(p.longName)}</span>` : ''}</h2></div>
      <p>${esc(p.description)}</p>
      <span class="program-label">Related services</span>
      <ul class="pills">${p.services.map((sl) => serviceBySlug[sl]).filter(Boolean).map((sv) => `<li><a class="pill" href="/services/${sv.slug}/">${esc(sv.name)}</a></li>`).join('')}</ul>
      <a class="btn btn-outline btn-sm" href="/contact/?program=${p.id}">Ask about ${esc(p.name)} ${icon('arrow')}</a>
    </article>`
      )
      .join('')}
  </div>
</section>
<section class="section section--tint" aria-labelledby="how-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'How it works', title: '<span id="how-title">How we help with programs</span>', center: true })}
    ${steps([
      { title: 'Tell us your goals', text: 'Share the upgrade you are considering and where your property is located.' },
      { title: 'Review program fit', text: 'We point out programs that may apply and what they typically require.' },
      { title: 'Confirm before work', text: 'Some programs require approval before work starts. We confirm the steps first.' },
      { title: 'Complete the upgrade', text: 'We complete the installation and help with the documentation we are responsible for.' },
    ])}
  </div>
</section>
${ctaBand({ title: 'Have a question about a program?', primary: { href: '/contact/', label: 'Ask about a program' } })}`;
  addPage(
    {
      path: '/programs/',
      title: 'Energy & Water Efficiency Programs',
      description:
        'Energy and water programs Justice Energy Co. works with, including SoCalREN, TECH Clean California and SoCal WaterSmart, and how they relate to your upgrade.',
      og: 'programs',
      preload: 'programs',
      priority: '0.8',
      schema: [breadcrumbSchema(crumbs)],
    },
    body
  );
})();

/* About */
(function about() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'About', href: '/about/' }];
  const body = `
${pageHero({
  crumbs,
  eyebrow: 'About us',
  h1: 'Helping homes use energy and water more wisely',
  lead: `${esc(site.name)} is an energy-efficiency company serving ${esc(site.serviceArea)}. We help homeowners understand their upgrade options, connect with programs that may apply and complete the work with care.`,
  image: 'about',
  alt: 'Illustration of a home next to a tablet showing a home assessment checklist and a hard hat',
})}
<section class="section" aria-labelledby="mission-title">
  <div class="container split">
    <div data-reveal>
      <p class="eyebrow">Our approach</p>
      <h2 id="mission-title">Clear options. Careful work. Honest guidance.</h2>
      <p class="lead">Energy upgrades can feel complicated: different equipment, different requirements and different programs. Our job is to make it clear.</p>
      <p>We start by understanding your home and your goals. Then we explain the options that make sense, what each one involves and which programs may help. When you are ready, we complete the upgrade and make sure you know how to get the most from it.</p>
    </div>
    <div class="media-frame" data-reveal>${img('services-cutaway', 'Cutaway illustration of a home showing a water heater, mini-split heat pump, efficient bathroom fixtures, LED kitchen lighting and a water-wise yard')}</div>
  </div>
</section>
<section class="section section--tint" aria-labelledby="values-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'What we value', title: '<span id="values-title">How we work with every homeowner</span>', center: true })}
    <div class="cards cards--3">
      ${[
        { icon: 'chat', t: 'Plain-language advice', d: 'We explain options without jargon so you can make a confident decision.' },
        { icon: 'home', t: 'Right-sized solutions', d: 'Recommendations based on your home, household and goals.' },
        { icon: 'clipboard', t: 'Program awareness', d: 'We help you understand programs that may apply before work begins.' },
        { icon: 'wrench', t: 'Careful installation', d: 'Work completed with respect for your home and your time.' },
        { icon: 'shield', t: 'Transparency', d: 'Clear expectations about scope, timing and what programs can and cannot guarantee.' },
        { icon: 'leaf', t: 'Long-term thinking', d: 'Upgrades that keep saving energy and water for years to come.' },
      ]
        .map((v) => `<div class="option" data-reveal>${ico(v.icon, 'ico--lg')}<h3>${v.t}</h3><p>${v.d}</p></div>`)
        .join('')}
    </div>
  </div>
</section>
<section class="section" aria-labelledby="services-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'What we do', title: '<span id="services-title">Our services</span>' })}
    <div class="cards cards--3">${services.map((s) => serviceCard(s)).join('')}${featureCard()}</div>
  </div>
</section>
<section class="section section--mint" aria-labelledby="area-title">
  <div class="container split split--reverse">
    <div class="media-frame" data-reveal>${img('hero-home', 'Illustration of an energy-efficient home with an outdoor heat pump, warm LED-lit windows and a water-wise front yard')}</div>
    <div data-reveal>
      <p class="eyebrow">Service area</p>
      <h2 id="area-title">Serving ${esc(site.serviceArea)}</h2>
      <p class="lead">We work with homeowners across ${esc(site.areaServed.join(' and '))}. Share your property location when you request a consultation and we will confirm availability.</p>
      <ul class="pills">${site.areaServed.map((a) => `<li><span class="pill">${icon('pin', ' width="16" height="16"')}${esc(a)}</span></li>`).join('')}</ul>
      <a class="btn btn-primary" href="/contact/">Check availability ${icon('arrow')}</a>
    </div>
  </div>
</section>
${ctaBand()}`;
  addPage(
    {
      path: '/about/',
      title: 'About Us',
      description: `${site.name} is a Southern California energy-efficiency company helping homeowners with water heating, heat pumps, water conservation, turf and LED lighting.`,
      og: 'about',
      preload: 'about',
      priority: '0.7',
      schema: [breadcrumbSchema(crumbs), { '@type': 'AboutPage', name: `About ${site.name}`, url: abs('/about/'), about: { '@id': abs('/#business') } }, businessSchema()],
    },
    body
  );
})();

/* Contact */
(function contact() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact/' }];
  const endpoint = site.form.endpoint;
  const err = (id) => `<span class="field-error" id="${id}-error" aria-live="polite"></span>`;
  const formAttrs = endpoint
    ? `action="${esc(endpoint)}" data-endpoint="${esc(endpoint)}"`
    : `action="/thank-you/" data-netlify="true" netlify-honeypot="bot-field"`;
  const body = `
${pageHero({
  crumbs,
  eyebrow: 'Contact',
  h1: 'Request a consultation',
  oneLine: true,
  lead: `Tell us about your property and the upgrades you are considering. We will follow up to talk through options and next steps. Prefer to talk? Call <a href="tel:${site.phoneHref}">${esc(site.phone)}</a>.`,
  cta: false,
})}
<section class="section" style="padding-top:0" aria-label="Consultation form and contact details">
  <div class="container contact-grid">
    <div class="form-card">
      <h2>Tell us about your project</h2>
      <p class="muted small">Fields marked with * are required.</p>
      <form name="${esc(site.form.name)}" method="POST" ${formAttrs} data-form data-success="/thank-you/" data-phone="${esc(site.phone)}" data-phone-href="${site.phoneHref}" novalidate>
        <input type="hidden" name="form-name" value="${esc(site.form.name)}">
        <input type="hidden" name="_subject" value="New consultation request — ${esc(site.name)} website">
        <input type="hidden" name="services_selected" value="">
        <input type="hidden" name="page" value="">
        <div class="hp-field" aria-hidden="true"><label>Leave this field empty <input type="text" name="bot-field" tabindex="-1" autocomplete="off"></label></div>
        <div class="form-grid">
          <div class="field">
            <label for="f-name">Full name *</label>
            <input id="f-name" name="name" type="text" autocomplete="name" autocapitalize="words" enterkeyhint="next" required aria-describedby="f-name-error">
            ${err('f-name')}
          </div>
          <div class="field">
            <label for="f-email">Email *</label>
            <input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" autocorrect="off" enterkeyhint="next" required aria-describedby="f-email-error">
            ${err('f-email')}
          </div>
          <div class="field">
            <label for="f-phone">Phone *</label>
            <input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" enterkeyhint="next" required aria-describedby="f-phone-error">
            ${err('f-phone')}
          </div>
          <div class="field">
            <label for="f-location">Property city or ZIP code *</label>
            <input id="f-location" name="location" type="text" autocomplete="postal-code" enterkeyhint="next" required aria-describedby="f-location-error">
            ${err('f-location')}
          </div>
          <div class="field">
            <label for="f-property">Property type <span class="opt">(optional)</span></label>
            <select id="f-property" name="property_type">
              <option value="">Select one</option>
              <option>Single-family home</option>
              <option>Condo or townhome</option>
              <option>Multifamily property</option>
              <option>Mobile or manufactured home</option>
              <option>Commercial property</option>
              <option>Other</option>
            </select>
          </div>
          <div class="field">
            <label for="f-program">Program interest <span class="opt">(optional)</span></label>
            <select id="f-program" name="program">
              <option value="">Not sure / none</option>
              ${programs.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}
            </select>
          </div>
          <fieldset class="field field--full">
            <legend>Services you are interested in <span class="opt">(choose any)</span></legend>
            <div class="choice-grid">
              ${services.map((s) => `<label class="choice"><input type="checkbox" name="service" value="${s.slug}" data-label="${esc(s.name)}"><span>${esc(s.name)}</span></label>`).join('')}
              <label class="choice"><input type="checkbox" name="service" value="not-sure" data-label="Not sure yet"><span>Not sure yet</span></label>
            </div>
          </fieldset>
          <div class="field field--full">
            <label for="f-message">Message <span class="opt">(optional)</span></label>
            <textarea id="f-message" name="message" rows="5" placeholder="Tell us about your home, current equipment or what you would like to change."></textarea>
          </div>
          <div class="field field--full">
            <label class="consent"><input type="checkbox" name="consent" value="yes" required aria-describedby="f-consent-error"> <span>I agree that ${esc(site.name)} may contact me by phone, text or email about my request. See our <a href="/privacy-policy/">privacy policy</a>. *</span></label>
            ${err('f-consent')}
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-accent btn-lg" type="submit">Request my consultation ${icon('arrow')}</button>
          <p class="muted small" style="margin:0">Your details are used only to respond to your request.</p>
        </div>
        <div class="form-status" aria-live="polite"></div>
      </form>
    </div>
    <aside class="info-stack" aria-label="Contact details">
      <div class="info-item">${ico('phone')}<div><h3>Call us</h3><a href="tel:${site.phoneHref}">${esc(site.phone)}</a></div></div>
      <div class="info-item">${ico('mail')}<div><h3>Email</h3><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></div></div>
      ${site.hours ? `<div class="info-item">${ico('clock')}<div><h3>Hours</h3><p>${esc(site.hours)}${site.hoursClosed ? `<br>${esc(site.hoursClosed)}` : ''}</p></div></div>` : ''}
      ${site.address.street ? `<div class="info-item">${ico('pin')}<div><h3>Office</h3><p>${esc(site.address.street)}<br>${esc(site.address.city)}, ${esc(site.address.region)} ${esc(site.address.postalCode)}</p></div></div>` : ''}
      <div class="info-item">${ico('home')}<div><h3>Service area</h3><p>${esc(site.areaServed.join(', '))}</p></div></div>
      <div class="panel">
        <h3>What happens next</h3>
        <ol class="mini-steps">
          <li><div><strong>We review your request</strong>You will receive a confirmation on screen right away.</div></li>
          <li><div><strong>We reach out</strong>We contact you to learn more about your property and goals.</div></li>
          <li><div><strong>We talk options</strong>We discuss upgrades, next steps and programs that may apply.</div></li>
        </ol>
      </div>
      <div class="media-frame">${img('contact', 'Illustration of a map pin, a phone card and a calendar for scheduling a consultation')}</div>
    </aside>
  </div>
</section>`;
  addPage(
    {
      path: '/contact/',
      title: 'Contact Us & Request a Consultation',
      description: `Request a consultation for water heating, heat pump, water conservation, turf replacement or LED lighting upgrades. Call ${site.phone} or send the form.`,
      og: 'contact',
      priority: '0.9',
      schema: [breadcrumbSchema(crumbs), { '@type': 'ContactPage', name: `Contact ${site.name}`, url: abs('/contact/'), about: { '@id': abs('/#business') } }, businessSchema()],
    },
    body
  );
})();

/* Privacy policy — draft text; the client must approve the final wording. */
(function privacy() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Privacy Policy', href: '/privacy-policy/' }];
  const body = `
${pageHero({
  crumbs,
  eyebrow: 'Legal',
  h1: 'Privacy policy',
  lead: `How ${esc(site.name)} collects, uses and protects information shared through this website. Last updated ${new Date(BUILD_DATE).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}.`,
  cta: false,
  image: 'privacy',
  alt: 'Illustration of a shield with a padlock representing data privacy',
})}
<section class="section" style="padding-top:0">
  <div class="container prose">
    <h2>Information we collect</h2>
    <p>When you submit our consultation form, we collect the details you provide, such as your name, email address, phone number, property location, property type, services or programs of interest and any message you include.</p>
    <p>Like most websites, our hosting provider may automatically record technical information such as your IP address, browser type, device type and pages visited. If analytics are enabled, we use them to understand how visitors use the site in aggregate.</p>
    <h2>How we use information</h2>
    <ul>
      <li>To respond to your consultation request and communicate with you about your project</li>
      <li>To provide information about services and programs you asked about</li>
      <li>To operate, maintain and improve this website</li>
      <li>To comply with legal obligations and protect against fraud or misuse</li>
    </ul>
    <h2>How information is shared</h2>
    <p>We do not sell your personal information. We may share information with service providers who help us operate the website and handle form submissions, and, with your permission, with programs you ask us to help you with. We may also disclose information when required by law.</p>
    <h2>Cookies and analytics</h2>
    <p>This website may use cookies or similar technologies needed for it to function and, if enabled, for analytics. You can control cookies through your browser settings.</p>
    <h2>Data retention and security</h2>
    <p>We keep personal information only as long as needed for the purposes described above or as required by law, and we use reasonable safeguards to protect it. No method of transmission over the internet is completely secure.</p>
    <h2>Your privacy rights</h2>
    <p>Depending on where you live, including California, you may have the right to request access to, correction of or deletion of your personal information, and to know how it is used. To make a request, contact us using the details below. We will not discriminate against you for exercising your rights.</p>
    <h2>Children's privacy</h2>
    <p>This website is not directed to children under 13, and we do not knowingly collect their personal information.</p>
    <h2>Changes to this policy</h2>
    <p>We may update this policy from time to time. The date at the top of this page shows when it was last updated.</p>
    <h2>Contact us</h2>
    <p>${esc(site.name)}<br>Phone: <a href="tel:${site.phoneHref}">${esc(site.phone)}</a><br>Email: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
  </div>
</section>`;
  addPage(
    {
      path: '/privacy-policy/',
      title: 'Privacy Policy',
      description: `Read the ${site.name} privacy policy to learn how we collect, use and protect information submitted through our website.`,
      og: 'home',
      priority: '0.3',
      schema: [breadcrumbSchema(crumbs)],
    },
    body
  );
})();

/* Thank-you (form confirmation) — not indexed */
addPage(
  {
    path: '/thank-you/',
    title: 'Thank You',
    description: 'Your consultation request has been received.',
    noindex: true,
    sitemap: false,
  },
  `<section class="hero page-hero">
  <div class="container hero-grid">
    <div>
      <p class="eyebrow">Request received</p>
      <h1>Thank you. We have your request.</h1>
      <p class="lead">A member of the ${esc(site.name)} team will review your details and get back to you soon. If your request is urgent, call us at <a href="tel:${site.phoneHref}">${esc(site.phone)}</a>.</p>
      <div class="btn-row">
        <a class="btn btn-primary btn-lg" href="/services/">Explore services ${icon('arrow')}</a>
        <a class="btn btn-outline btn-lg" href="/">Back to home</a>
      </div>
    </div>
    <div class="hero-media"><div class="frame">${img('contact', 'Illustration of a map pin, a phone card and a calendar for scheduling a consultation', { eager: true })}</div></div>
  </div>
</section>`
);

/* 404 */
addPage(
  {
    path: '/404.html',
    title: 'Page Not Found',
    description: 'The page you are looking for could not be found.',
    noindex: true,
    sitemap: false,
  },
  `<section class="section error-page">
  <div class="container">
    <p class="error-code">404</p>
    <h1>We could not find that page</h1>
    <p class="lead" style="margin-inline:auto">The page may have moved. Try one of these instead.</p>
    <div class="btn-row" style="justify-content:center">
      <a class="btn btn-primary" href="/">Home</a>
      <a class="btn btn-outline" href="/services/">Services</a>
      <a class="btn btn-outline" href="/contact/">Contact</a>
    </div>
  </div>
</section>`
);

/* Gallery — a PHP page so photos uploaded in the admin appear immediately. */
(function gallery() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Gallery', href: '/gallery/' }];
  const categories = Object.fromEntries([...services.map((s) => [s.slug, s.name]), ['other', 'Other projects']]);
  const empty = `<div class="gallery-empty">
      <h2>Project photos are on the way</h2>
      <p>We are adding photos of recent upgrades. In the meantime, explore our services or request a consultation to talk about your home.</p>
      <div class="btn-row" style="justify-content:center"><a class="btn btn-primary" href="/services/">Explore services ${icon('arrow')}</a><a class="btn btn-accent" href="/contact/">Request a consultation</a></div>
    </div>`;
  const body = `
${pageHero({
  crumbs,
  eyebrow: 'Gallery',
  h1: 'Our work, up close',
  lead: 'Photos of energy-efficiency upgrades from homes across Southern California: water heaters, heat pumps, water-saving fixtures, water-wise yards and LED lighting.',
  cta: false,
})}
<section class="section" style="padding-top:0" aria-label="Project photos">
  <div class="container">
<!--gallery:php-->
<?php
$items = json_decode((string) @file_get_contents(__DIR__ . '/../uploads/gallery.json'), true);
if (!is_array($items)) { $items = []; }
$cats = ${JSON.stringify(categories).replace(/^\{/, '[').replace(/\}$/, ']').replace(/":/g, '" =>')};
$h = function ($v) { return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); };
$present = array_map(function ($i) { return (string) ($i['category'] ?? ''); }, $items);
$used = array_values(array_filter(array_keys($cats), function ($c) use ($present) { return in_array($c, $present, true); }));
?>
<?php if (!$items): ?>
<!--gallery:empty-->${empty}<!--/gallery:empty-->
<?php else: ?>
    <?php if (count($used) > 1): ?>
    <div class="gallery-filters" role="group" aria-label="Show photos by service">
      <button type="button" class="pill is-active" data-filter="" aria-pressed="true">All photos</button>
      <?php foreach ($used as $c): ?><button type="button" class="pill" data-filter="<?= $h($c) ?>" aria-pressed="false"><?= $h($cats[$c] ?? $c) ?></button><?php endforeach; ?>
    </div>
    <?php endif; ?>
    <ul class="gallery-grid">
      <?php foreach ($items as $i => $it): $alt = ($it['alt'] ?? '') !== '' ? $it['alt'] : (($it['caption'] ?? '') !== '' ? $it['caption'] : 'Energy-efficiency upgrade project photo'); ?>
      <li data-category="<?= $h($it['category'] ?? '') ?>">
        <a class="gallery-item" href="/uploads/gallery/<?= $h($it['file']) ?>" data-lightbox data-caption="<?= $h($it['caption'] ?? '') ?>" data-alt="<?= $h($alt) ?>">
          <img src="/uploads/gallery/<?= $h($it['thumb']) ?>" alt="<?= $h($alt) ?>" width="<?= (int) $it['w'] ?>" height="<?= (int) $it['h'] ?>"<?= $i < 6 ? '' : ' loading="lazy"' ?> decoding="async">
          <?php if (($it['caption'] ?? '') !== ''): ?><span class="gallery-cap"><?= $h($it['caption']) ?></span><?php endif; ?>
        </a>
      </li>
      <?php endforeach; ?>
    </ul>
<?php endif; ?>
<!--/gallery:php-->
  </div>
</section>
<dialog class="lightbox" id="lightbox" aria-label="Photo viewer">
  <button class="lightbox-close" type="button" data-close aria-label="Close">×</button>
  <button class="lightbox-nav lightbox-prev" type="button" data-prev aria-label="Previous photo">‹</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lightbox-nav lightbox-next" type="button" data-next aria-label="Next photo">›</button>
</dialog>
${ctaBand({ title: 'Want results like these at home?' })}`;
  addPage(
    {
      path: '/gallery/',
      file: 'index.php',
      title: 'Project Gallery',
      description: `Photos of energy-efficiency upgrades by ${site.name}: heat pump and tankless water heaters, mini-splits, water-saving fixtures, turf replacement and LED lighting.`,
      og: 'home',
      priority: '0.7',
      schema: [breadcrumbSchema(crumbs), { '@type': 'CollectionPage', name: `${site.name} project gallery`, url: abs('/gallery/'), about: { '@id': abs('/#business') } }],
    },
    body
  );
})();

/* PHP settings for the admin and the contact form, generated from site.config.js. */
function writePhpConfig() {
  const php = (v) => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  const arr = (obj) => `[${Object.entries(obj).map(([k, v]) => `${php(k)} => ${php(v)}`).join(', ')}]`;
  const categories = Object.fromEntries([...services.map((s) => [s.slug, s.name]), ['other', 'Other projects']]);
  const config = `<?php
// Generated by build.js from src/site.config.js. Do not edit here; edit the config and rebuild.
define('JE_SITE_NAME', ${php(site.name)});
define('JE_SITE_URL', ${php(site.url)});
define('JE_FORM_TO', ${php(site.form.to || site.email)});
define('JE_PHONE', ${php(site.phone)});
define('JE_PHONE_HREF', ${php(site.phoneHref)});
define('JE_CATEGORIES', ${arr(categories)});
define('JE_PROGRAMS', ${arr(Object.fromEntries(programs.map((p) => [p.id, p.name])))});
`;
  fs.writeFileSync(path.join(DIST, 'admin', 'site-config.php'), config);
  fs.writeFileSync(path.join(DIST, 'admin', 'slots.json'), JSON.stringify(SLOTS, null, 2) + '\n');
}

/* ---------- write ---------- */
function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(path.join(SRC, 'assets'), path.join(DIST, 'assets'));
  copyDir(path.join(SRC, 'static'), DIST);
  copyDir(path.join(SRC, 'php'), DIST);
  writePhpConfig();
  const rendered = pages;

  for (const p of rendered) {
    const out = p.path.endsWith('.html') ? path.join(DIST, p.path) : path.join(DIST, p.path, p.file || 'index.html');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, p.html);
  }

  const urls = rendered
    .filter((p) => p.sitemap !== false && !p.noindex)
    .map((p) => `  <url>\n    <loc>${abs(p.path)}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n    <priority>${p.priority || '0.5'}</priority>\n  </url>`)
    .join('\n');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
  fs.writeFileSync(
    path.join(DIST, 'site.webmanifest'),
    JSON.stringify(
      {
        name: site.name,
        short_name: site.shortName,
        start_url: '/',
        display: 'browser',
        background_color: '#ffffff',
        theme_color: '#f6b941',
        icons: [
          { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      null,
      2
    ) + '\n'
  );

  console.log(`Built ${rendered.length} pages into ${path.relative(process.cwd(), DIST) || 'dist'}/`);
  const drafts = programs.filter((p) => !p.approved).map((p) => p.name);
  if (drafts.length) console.log(`Reminder: program descriptions awaiting client approval: ${drafts.join(', ')}`);
  if (!site.detailsVerified) console.log('Reminder: business contact details are placeholders (site.config.js detailsVerified: false).');
}

build();
