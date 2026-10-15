/*
 * Prompts for AI-generated photographs, one per photo slot, used by
 * scripts/generate-photos.mjs. `alt` describes the finished photo and replaces
 * the drawing's alt text once the slot has a photo.
 *
 * These are illustrative stock-style images: they must not be presented as
 * Justice Energy Co.'s own completed projects. Replace them with real project
 * photos when the client supplies them.
 */
const STYLE =
  'Photorealistic professional photograph, natural light, realistic colors and textures, sharp focus, ' +
  'landscape 4:3 composition with the subject centered, Southern California setting, clean and inviting. ' +
  'No text, no logos, no brand names, no watermarks, no illustration or 3D render look.';

module.exports = {
  STYLE,
  slots: {
    'hero-home': {
      prompt: 'Modern single-story Southern California home on a sunny afternoon: white stucco walls with warm wood accents, large windows, a drought-tolerant front yard with succulents, ornamental grasses and decomposed granite, a compact outdoor heat pump unit neatly installed beside the house, clear blue sky.',
      alt: 'Modern Southern California home with a drought-tolerant front yard and an outdoor heat pump on a sunny day',
    },
    'services-cutaway': {
      prompt: 'Professional HVAC technician in a navy work shirt installing an outdoor heat pump unit beside a modern stucco home, the unit a realistic single-fan design with one round fan grille on its front face and plain side panels, organized tools on a mat, friendly and competent, mid-morning sun, technician seen from the side, not looking at the camera.',
      alt: 'Technician installing an outdoor heat pump unit beside a modern home',
    },
    'water-heating': {
      prompt: 'Newly installed tall white heat pump water heater in a clean, bright garage utility corner of a California home, tidy copper and PEX piping, an expansion tank and a drain pan, neat professional installation, soft daylight from a side window.',
      alt: 'Newly installed heat pump water heater in a clean garage utility area',
    },
    hvac: {
      prompt: 'Sleek white ductless mini-split indoor unit mounted high on the wall of a contemporary, design-forward living room: low-profile modular sofa, warm oak floor, minimalist decor, a large abstract artwork, a sculptural floor lamp, green plants, floor-to-ceiling windows with afternoon light. A relaxed adult sits on the sofa cushions, leaning back in the middle of the sofa (not on a bench or ottoman), pointing a small white remote control up at the mini-split and looking at the unit, which is mounted on the wall above and slightly to the side of the sofa. Cool air is clearly visible flowing out of the open louvers: soft white translucent streams of chilled mist fanning out and drifting down across the room toward the sofa, easy to see against the wall, like cold air made visible in a premium air-conditioner advertisement photo.',
      alt: 'Homeowner on a sofa adjusting a ductless mini-split with a remote as cool air flows into a modern living room',
    },
    'water-conservation': {
      prompt: 'Bright modern bathroom with an efficient chrome showerhead in a glass-enclosed shower, a white vessel sink with a slim water-saving faucet, and a modern white low-flow toilet, light gray tile, natural light, spotless.',
      alt: 'Modern bathroom with an efficient showerhead, water-saving faucet and low-flow toilet',
    },
    'turf-replacement': {
      prompt: 'Wide shot of two different-looking landscaping installers (one older with a gray beard, one younger) in matching navy work shirts, gloves and knee pads installing artificial turf in a Southern California backyard: they unroll a long, solid roll of realistic synthetic grass across a smooth, compacted decomposed-granite base, with most of the yard already covered in lush, even artificial turf neatly trimmed along a concrete border, a few more tightly rolled turf rolls nearby, single-story stucco home with a patio in the background, sunny morning, workers focused on the job and not looking at the camera.',
      alt: 'Landscaping crew installing artificial turf in a Southern California backyard',
    },
    'led-lighting': {
      prompt: 'Bright modern kitchen at dusk, photographed from a three-quarter side angle so a row of three LED pendant lights is clearly hanging over the middle of a white quartz island, recessed LED downlights in the ceiling and under-cabinet lighting, white shaker cabinets, crisp neutral-white 3500K light, white surfaces look truly white with no yellow, orange or amber cast, well exposed, clean and inviting.',
      alt: 'Modern kitchen lit by LED pendant lights and recessed LED downlights',
    },
    programs: {
      prompt: 'Homeowner couple in their forties at a bright kitchen table reviewing paperwork and a laptop with a friendly energy consultant, relaxed and engaged, natural light, people seen in profile, not looking at the camera.',
      alt: 'Homeowners reviewing program paperwork with an energy consultant at a kitchen table',
    },
    about: {
      prompt: 'Friendly energy-efficiency technician in a navy polo holding a tablet, talking with a smiling homeowner on the front walkway of a California home, warm late-afternoon light, natural candid moment, people not looking at the camera.',
      alt: 'Technician in a navy work shirt shaking hands with a smiling homeowner in front of a house',
    },
    contact: {
      prompt: 'Smiling young Caucasian woman with dark brown hair, working as a customer-service representative, dressed for summer in a light, airy short-sleeve white linen blouse, wearing a light headset at a bright, tidy office desk, talking on a call while taking notes, a desktop computer monitor on a stand with a wireless keyboard in front of her (no laptop), plants and natural summer light in the background, candid.',
      alt: 'Customer-service representative on a call at a bright office desk',
    },
    privacy: {
      prompt: 'Closed laptop and a notebook on a tidy light-wood home-office desk with a small plant and a cup of coffee, soft morning daylight, minimal and calm.',
      alt: 'Tidy home-office desk with a laptop, notebook and plant',
    },
  },
};
