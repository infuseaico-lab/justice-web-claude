/*
 * Service page content. Each entry builds one page at /services/<slug>/.
 * Copy is written from the approved proposal scope; adjust product brands,
 * specifics and claims only with client-provided information.
 */
module.exports = [
  {
    slug: 'water-heating',
    name: 'Water Heating',
    icon: 'flame',
    image: 'water-heating',
    imageAlt: 'Illustration of a heat pump water heater and a wall-mounted tankless water heater in a utility room',
    title: 'Tankless & Heat Pump Water Heaters',
    metaDescription:
      'Upgrade to a tankless, heat pump or condensing tank water heater. We help Southern California homeowners compare options and check program eligibility.',
    h1: 'Efficient water heating, sized for your home',
    lead:
      'Your water heater is one of the biggest energy users in the house. We help you compare tankless, heat pump and condensing tank-type systems, then install the one that fits how your household actually uses hot water.',
    summary: 'Tankless, heat pump and condensing tank-type water heaters.',
    options: [
      {
        name: 'Heat pump water heaters',
        icon: 'fan',
        text: 'Move heat from the surrounding air into the tank instead of generating it directly, using far less electricity than a standard electric-resistance tank.',
      },
      {
        name: 'Tankless water heaters',
        icon: 'flame',
        text: 'Heat water on demand so there is no tank kept hot around the clock. A compact, wall-mounted unit frees up floor space.',
      },
      {
        name: 'Condensing tank-type heaters',
        icon: 'drop',
        text: 'Capture extra heat from exhaust gases for higher efficiency than a conventional gas tank, with a familiar storage setup.',
      },
    ],
    benefits: [
      'Lower water-heating energy use compared with older standard units',
      'Options matched to your household size, fuel type and available space',
      'Guidance on electrical, venting and placement requirements before work begins',
      'Help identifying incentive programs your upgrade may qualify for',
    ],
    signs: [
      'Your water heater is 10 or more years old',
      'You run out of hot water or wait a long time for it',
      'You notice rust, leaks or rumbling noises from the tank',
      'You are planning an all-electric or energy-efficiency remodel',
    ],
    programs: ['tech-clean', 'socalren', 'go-zero'],
    faqs: [
      {
        q: 'Which is better: a tankless or a heat pump water heater?',
        a: 'It depends on your home. Heat pump water heaters suit homes going electric and need space with enough surrounding air, such as a garage. Tankless units suit homes with limited space and steady gas or electrical service. We walk through both during your consultation.',
      },
      {
        q: 'Will I need electrical work for a heat pump water heater?',
        a: 'Sometimes. Many heat pump water heaters need a dedicated circuit, and some homes need panel upgrades. We check this during the consultation so there are no surprises.',
      },
      {
        q: 'Are there rebates for upgrading my water heater?',
        a: 'Some programs offer incentives for qualifying water heater upgrades. Availability, amounts and eligibility change and are not guaranteed, so we review the current options with you before you commit.',
      },
    ],
  },
  {
    slug: 'hvac-heat-pumps',
    name: 'HVAC & Heat Pumps',
    icon: 'fan',
    image: 'hvac',
    imageAlt: 'Illustration of a ductless mini-split indoor unit in a living room connected to an outdoor heat pump',
    title: 'Heat Pump & Mini-Split Installation',
    metaDescription:
      'Heat and cool efficiently with ductless mini-split and split-system heat pumps from Justice Energy Co. Clear upgrade options for Southern California homes.',
    h1: 'Heat pumps that heat and cool, all year',
    lead:
      'A heat pump replaces a separate furnace and air conditioner with one efficient system. We explain the difference between ductless mini-splits and ducted split systems so you can choose with confidence.',
    summary: 'Mini-split and split-system heat pumps, with clear upgrade options.',
    options: [
      {
        name: 'Ductless mini-split heat pumps',
        icon: 'fan',
        text: 'Wall-mounted indoor units connected to an outdoor unit. Ideal for homes without ducts, additions, garages converted to living space and individual rooms.',
      },
      {
        name: 'Split-system heat pumps',
        icon: 'home',
        text: 'A ducted system that replaces a central furnace and AC, using your existing ductwork to heat and cool the whole home.',
      },
      {
        name: 'Zoning & controls',
        icon: 'gauge',
        text: 'Thermostats and zoning that let you heat or cool only the rooms you use, helping the system run efficiently.',
      },
    ],
    benefits: [
      'One system for both heating and cooling',
      'High-efficiency electric operation with no on-site combustion',
      'Quiet operation and room-by-room comfort with zoned systems',
      'Clear explanations of equipment options, sizing and what the work involves',
    ],
    signs: [
      'Some rooms are always too hot or too cold',
      'Your furnace or AC is aging or needs frequent repairs',
      'Your home has no ductwork, or the ducts are in poor condition',
      'You want to move away from gas heating',
    ],
    programs: ['tech-clean', 'socalren', 'comfi', 'go-zero'],
    faqs: [
      {
        q: 'What is the difference between a mini-split and a split system?',
        a: 'A mini-split is ductless: each indoor unit delivers air directly into a room. A split system uses ducts to move air through the whole house. Homes without ductwork are often a strong fit for mini-splits.',
      },
      {
        q: 'Do heat pumps work during Southern California winters?',
        a: 'Yes. Modern heat pumps are designed to heat efficiently in mild climates like Southern California and also provide air conditioning in summer.',
      },
      {
        q: 'How long does a heat pump installation take?',
        a: 'Many mini-split installations are completed in one to two days. Whole-home split systems can take longer depending on ductwork and electrical needs. We give you a timeline after the consultation.',
      },
    ],
  },
  {
    slug: 'water-conservation',
    name: 'Water Conservation',
    icon: 'drop',
    image: 'water-conservation',
    imageAlt: 'Illustration of a bathroom with an efficient showerhead, a faucet with an aerator and a low-flow toilet',
    title: 'Low-Flow Fixtures & Water Conservation',
    metaDescription:
      'Cut indoor water use with efficient showerheads, faucet aerators and low-flow toilets from Justice Energy Co. Water-saving upgrades for Southern California homes.',
    h1: 'Save water without sacrificing comfort',
    lead:
      'Small fixtures make a big difference. Replacing showerheads, faucet aerators and older toilets with water-efficient models reduces water use every day, and less hot water used means less energy spent heating it.',
    summary: 'Showerhead and faucet aerator replacements, plus low-flow toilet replacements.',
    options: [
      {
        name: 'Showerhead replacements',
        icon: 'drop',
        text: 'Efficient showerheads designed to use less water per minute while keeping a comfortable spray.',
      },
      {
        name: 'Faucet aerators',
        icon: 'faucet',
        text: 'Simple aerator replacements for kitchen and bathroom faucets that reduce flow without changing how the faucet feels.',
      },
      {
        name: 'Low-flow toilets',
        icon: 'check',
        text: 'High-efficiency toilet replacements that use less water per flush than older models.',
      },
    ],
    benefits: [
      'Lower indoor water use for every person in the household',
      'Less hot water used, which also reduces water-heating energy',
      'Quick installations with minimal disruption',
      'Help understanding water-saving programs that may apply',
    ],
    signs: [
      'Your toilets or fixtures are older models',
      'Your water bills are higher than you expect',
      'You want quick upgrades that make a difference right away',
      'You are already upgrading your water heater',
    ],
    programs: ['socal-watersmart', 'socalren', 'mea'],
    faqs: [
      {
        q: 'Will a low-flow showerhead feel weaker?',
        a: 'Modern efficient showerheads are engineered to deliver a comfortable spray at lower flow rates. We can talk through options if you have a preference.',
      },
      {
        q: 'How long do water conservation upgrades take?',
        a: 'Showerhead and aerator replacements are usually quick. Toilet replacements typically take a few hours each. We confirm timing when we schedule your visit.',
      },
      {
        q: 'Can water conservation upgrades lower my energy bill?',
        a: 'Using less hot water at showers and faucets means your water heater runs less, which can reduce energy use as well as water use.',
      },
    ],
  },
  {
    slug: 'turf-replacement',
    name: 'Turf Replacement',
    icon: 'leaf',
    image: 'turf-replacement',
    imageAlt: 'Backyard with a green lawn, a stepping-stone path, lounge seating and planted borders lit at dusk',
    title: 'Turf Replacement & Water-Wise Yards',
    metaDescription:
      'Replace thirsty lawn with a water-wise landscape. Learn about turf replacement options and the consultation process for Southern California homes.',
    h1: 'Replace thirsty turf with a water-wise yard',
    lead:
      'Lawns are one of the largest outdoor water users in Southern California. Turf replacement swaps grass for climate-appropriate plants, mulch and efficient irrigation, creating a yard that looks good with far less water.',
    summary: 'Turf replacement services and a clear consultation process.',
    options: [
      {
        name: 'Lawn removal',
        icon: 'leaf',
        text: 'Removing existing grass and preparing the soil for a new, climate-appropriate landscape.',
      },
      {
        name: 'Climate-appropriate planting',
        icon: 'sprout',
        text: 'Native and drought-tolerant plants, mulch and permeable surfaces suited to Southern California conditions.',
      },
      {
        name: 'Efficient irrigation',
        icon: 'drop',
        text: 'Drip irrigation and smart controls that deliver water directly to plant roots.',
      },
    ],
    benefits: [
      'Significantly less outdoor water use',
      'Lower ongoing maintenance than a traditional lawn',
      'A landscape suited to the local climate',
      'Guidance on program requirements, which may need approval before work starts',
    ],
    signs: [
      'Your lawn needs frequent watering to stay green',
      'You are tired of mowing and lawn maintenance',
      'Parts of your yard are patchy or rarely used',
      'You want to lower your outdoor water use',
    ],
    programs: ['socal-watersmart', 'mea', 'crp'],
    process: [
      { title: 'Consultation', text: 'We discuss your yard, goals and budget, and explain how turf replacement works.' },
      { title: 'Site review & plan', text: 'We measure the area, review site conditions and outline a plant and irrigation plan.' },
      { title: 'Program check', text: 'Some programs require pre-approval before any grass is removed. We review this with you first.' },
      { title: 'Installation', text: 'We remove the turf, install the new landscape and irrigation, and walk you through care.' },
    ],
    faqs: [
      {
        q: 'Do I need approval before removing my lawn?',
        a: 'Some turf replacement programs require you to apply and be approved before removing any grass. We review this with you during the consultation so you do not lose eligibility.',
      },
      {
        q: 'Will my yard still look green?',
        a: 'Yes. Water-wise landscapes use a variety of drought-tolerant plants, textures and colors, and can be designed to be just as inviting as a lawn.',
      },
      {
        q: 'Is artificial turf included?',
        a: 'Program rules on artificial turf vary. We focus on living, climate-appropriate landscapes and can discuss your options during the consultation.',
      },
    ],
  },
  {
    slug: 'led-lighting-retrofits',
    name: 'LED Lighting Retrofits',
    icon: 'bulb',
    image: 'led-lighting',
    imageAlt: 'Illustration of a kitchen lit by LED pendant lights and recessed downlights',
    title: 'LED Lighting Retrofits & Upgrades',
    metaDescription:
      'Swap outdated lighting for efficient LED fixtures and retrofits with Justice Energy Co. Better light, lower energy use and less maintenance.',
    h1: 'Brighter spaces with efficient LED lighting',
    lead:
      'LED retrofits replace older bulbs and fixtures with efficient LED technology. You get better-quality light that uses less energy and lasts longer, so you change bulbs far less often.',
    summary: 'Lighting upgrades and LED retrofits with relevant service information.',
    options: [
      {
        name: 'LED retrofits',
        icon: 'bulb',
        text: 'Converting existing fixtures to LED, including recessed cans, linear fixtures and common bulb types.',
      },
      {
        name: 'Fixture upgrades',
        icon: 'home',
        text: 'Replacing outdated fixtures with new LED fixtures for kitchens, living areas, garages and exteriors.',
      },
      {
        name: 'Controls',
        icon: 'gauge',
        text: 'Dimmers, timers and sensors that keep lights off when they are not needed.',
      },
    ],
    benefits: [
      'Less electricity used for the same amount of light',
      'Long-lasting bulbs that reduce replacement and maintenance',
      'Better light quality, with color options to suit each room',
      'Less heat from fixtures compared with incandescent lighting',
    ],
    signs: [
      'You still use incandescent, halogen or fluorescent lighting',
      'Bulbs burn out often or fixtures flicker',
      'Some areas feel dim or have uneven light',
      'You want to reduce energy use with a quick upgrade',
    ],
    programs: ['socalren', 'mea', 'camr'],
    faqs: [
      {
        q: 'How much energy do LEDs save?',
        a: 'LEDs use significantly less electricity than incandescent and halogen bulbs to produce similar light. Actual savings depend on the fixtures replaced and how often lights are used.',
      },
      {
        q: 'Can you retrofit my existing fixtures?',
        a: 'In many cases, yes. Recessed cans and many common fixtures can be converted to LED. We will recommend a retrofit or a full fixture replacement based on what you have.',
      },
      {
        q: 'Do you offer lighting upgrades for businesses?',
        a: 'Contact us about your property. We will let you know which services are available for your building type.',
      },
    ],
  },
];
