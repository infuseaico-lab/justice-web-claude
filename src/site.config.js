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

  // Contact details confirmed by the client; they also go into the schema markup.
  detailsVerified: true,

  phone: '(866) 504-8989',
  phoneHref: '+18665048989',
  email: 'info@justiceenergyco.com',
  address: {
    street: '12631 Imperial Hwy. D-130',
    city: 'Santa Fe Springs',
    region: 'CA',
    postalCode: '90670',
    country: 'US',
  },
  serviceArea: 'Southern California', // TODO: list counties or cities served
  areaServed: ['Los Angeles County', 'Orange County'], // TODO: confirm
  hours: 'Mon–Fri, 8:30 am – 5:00 pm',
  hoursClosed: 'Sat & Sun closed',
  // schema.org openingHours format; set to [] to omit.
  openingHours: ['Mo-Fr 08:30-17:00'],
  license: '', // TODO: e.g. 'CSLB #1234567' — shown in the footer when set
  social: {
    // TODO: add profile URLs; empty values are hidden.
    facebook: '',
    instagram: '',
    linkedin: '',
    google: '',
  },

  form: {
    // The consultation form posts to the PHP handler included with the site (cPanel hosting).
    // Requests are emailed to `to` and also listed in the admin under "Consultation requests".
    endpoint: '/contact.php',
    to: 'info@justiceenergyco.com',
    name: 'consultation',
  },

  // Google Analytics 4 measurement ID (G-XXXXXXX). Leave empty to load no analytics.
  ga4: '',
};
