/*
 * Business details used across every page, the footer, schema markup and the
 * contact form. Values marked TODO are placeholders: replace them with details
 * the client has verified before launch. Empty strings are left out of the
 * schema markup and the page instead of being shown.
 */
module.exports = {
  name: 'Justice Energy Co.',
  shortName: 'Justice Energy',
  // Production URL, no trailing slash. Used for canonical links, the sitemap and Open Graph tags.
  url: 'https://justiceenergyco.com',
  tagline: 'Energy-efficiency upgrades and retrofits for Southern California homes',
  description:
    'Energy-efficiency upgrades for Southern California homes: heat pump & tankless water heaters, mini-splits, low-flow fixtures, turf replacement and LED lighting.',

  // Set to true once phone, email, address and hours are confirmed. While false, the
  // contact details still show on the page but are left out of the schema markup.
  detailsVerified: false,

  // TODO: confirm with the client. The phone below is a placeholder from the reserved 555 range.
  phone: '(555) 010-0199',
  phoneHref: '+15550100199',
  email: 'info@justiceenergyco.com', // TODO: confirm inbox
  address: {
    street: '', // TODO: street address, or leave empty for a service-area business
    city: '', // TODO
    region: 'CA',
    postalCode: '', // TODO
    country: 'US',
  },
  serviceArea: 'Southern California', // TODO: list counties or cities served
  areaServed: ['Los Angeles County', 'Orange County'], // TODO: confirm
  hours: 'Mon–Fri, 8:00 am – 5:00 pm', // TODO: confirm
  // schema.org openingHours format; set to [] to omit.
  openingHours: ['Mo-Fr 08:00-17:00'],
  license: '', // TODO: e.g. 'CSLB #1234567' — shown in the footer when set
  social: {
    // TODO: add profile URLs; empty values are hidden.
    facebook: '',
    instagram: '',
    linkedin: '',
    google: '',
  },

  form: {
    // Where the consultation form posts. Leave empty to use Netlify Forms
    // (works automatically when the site is deployed on Netlify).
    // For other hosts set this to a Formspree / Web3Forms / Basin endpoint URL.
    endpoint: '',
    name: 'consultation',
  },

  // Google Analytics 4 measurement ID (G-XXXXXXX). Leave empty to load no analytics.
  ga4: '',
};
