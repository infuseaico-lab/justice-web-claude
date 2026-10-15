/*
 * Program content for /programs/. The client listed these programs in the
 * proposal; Justice Energy Co. must confirm each official name, description,
 * participation and eligibility wording, and supply approved logos, before
 * launch. `approved: false` marks descriptions that are still drafts — the
 * build prints a reminder for each one.
 */
module.exports = [
  {
    id: 'comfi',
    name: 'Comfi',
    approved: false,
    description:
      'Comfi is one of the programs Justice Energy Co. works with to help homeowners move forward with comfort and efficiency upgrades. Ask us how it works and whether your project may qualify.',
    services: ['hvac-heat-pumps', 'water-heating'],
  },
  {
    id: 'socalren',
    name: 'SoCalREN',
    longName: 'Southern California Regional Energy Network',
    approved: false,
    description:
      'The Southern California Regional Energy Network is a public-agency-led network that offers energy-efficiency programs and resources across Southern California. We can help you understand which offerings may apply to your upgrade.',
    services: ['water-heating', 'hvac-heat-pumps', 'water-conservation', 'led-lighting-retrofits'],
  },
  {
    id: 'mea',
    name: 'MEA',
    approved: false,
    description:
      'MEA is one of the programs Justice Energy Co. participates in. Contact us to learn which upgrades it covers and whether your property may be eligible.',
    services: ['water-conservation', 'turf-replacement', 'led-lighting-retrofits'],
  },
  {
    id: 'crp',
    name: 'CRP',
    approved: false,
    description:
      'CRP is one of the programs Justice Energy Co. participates in. Contact us to learn which upgrades it covers and whether your property may be eligible.',
    services: ['turf-replacement', 'water-conservation'],
  },
  {
    id: 'socal-watersmart',
    name: 'SoCal WaterSmart',
    approved: false,
    description:
      'SoCal WaterSmart offers resources and rebates for water-saving devices and turf replacement in participating Southern California water service areas. Some offerings require approval before work begins, so talk with us before you start.',
    services: ['turf-replacement', 'water-conservation'],
  },
  {
    id: 'tech-clean',
    name: 'TECH Clean California',
    approved: false,
    description:
      'TECH Clean California is a statewide initiative that supports the adoption of heat pump technology for space and water heating. We can explain how heat pump upgrades may fit within the program.',
    services: ['hvac-heat-pumps', 'water-heating'],
  },
  {
    id: 'go-zero',
    name: 'Go Zero',
    approved: false,
    description:
      'Go Zero is one of the programs Justice Energy Co. works with for efficiency and electrification upgrades. Ask us how it works and whether your home may qualify.',
    services: ['water-heating', 'hvac-heat-pumps'],
  },
  {
    id: 'camr',
    name: 'CAMR',
    approved: false,
    description:
      'CAMR is one of the programs Justice Energy Co. participates in. Contact us to learn which upgrades it covers and whether your property may be eligible.',
    services: ['led-lighting-retrofits', 'water-conservation'],
  },
];
