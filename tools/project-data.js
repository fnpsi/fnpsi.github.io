"use strict";

const projects = [
  {
    slug: "aetherium",
    title: "Aetherium",
    titleHtml: "Aether<em>ium</em>",
    category: "web3d",
    categoryLabel: "Web3D",
    year: "2026",
    theme: "theme-aetherium",
    cover: "aetherium.svg",
    coverAlt: "A liquid chrome form suspended in a dark field with acid-lime orbital lines.",
    card: "A chrome instrument that changes shape as you tune it. Real-time reflections, synthesized tones, and a launch film you can play.",
    summary: "A launch experience for a fictional spatial-audio instrument. One chrome form, three frequencies, and a scroll that behaves like a score.",
    role: "Creative direction / 3D / Front-end",
    discipline: "Web3D / Interaction",
    stack: "Three.js, GLSL, GSAP, Web Audio",
    status: "Self-initiated concept",
    briefTitle: "What does a sound look like before you hear it?",
    brief: [
      "Aetherium started with a question: what does a sound look like before you hear it? The brief was self-set — design a product launch for an instrument that does not exist, and make the object itself the interface. No renders. No video. One WebGL scene that carries the whole story.",
      "The product is a spatial-audio instrument with three adjustable frequencies. Instead of explaining it with a feature list, the page lets you feel the idea: a single chrome form that changes shape as the frequencies move."
    ],
    approachTitle: "Treat the page as a score.",
    approach: [
      "Each scroll segment moves the camera, changes the chrome's distortion, and brings a new frequency into the mix. A custom vertex displacement pass lets the form breathe without losing the hard reflections that make it feel manufactured.",
      "The interaction is deliberately small: move, hold, listen, scroll. Nothing competes with the object. Typography sits at the edges like a control surface, and the chrome does the emotional work."
    ],
    buildTitle: "A small system with a lot of surface.",
    build: [
      "The scene uses a high-resolution torus knot with a physical material and a procedural room environment for reflections. A lightweight Web Audio layer synthesizes three sine-based tones; the same values drive the object's scale, emissive rim, and orbital rings.",
      "GSAP ScrollTrigger choreographs the camera and the DOM typography. On mobile the mesh density drops, the particle field halves, and audio stays opt-in. The scene pauses when it leaves the viewport or the tab is hidden."
    ],
    buildList: [
      "Real-time chrome material with iridescence and clearcoat reflections.",
      "Pointer parallax and scroll-driven camera choreography.",
      "Three synthesized frequency bands mapped to geometry and light.",
      "Reduced-motion and no-WebGL poster fallbacks."
    ],
    quote: "The product is the page. The page is the <span>product.</span>",
    outcomes: [
      ["Format", "Real-time launch study"],
      ["Scene", "Chrome, particles, synthesized tone"],
      ["Motion", "Scroll + pointer choreography"],
      ["Fallback", "CSS chrome poster"]
    ],
    outcomeNote: "The study ends with a simple test: can a product page make you understand a sound before you hear it? The chrome is the argument. The next step would be a real audio engine, a launch film, and a version that lets visitors play the three frequencies themselves.",
    artifact: {
      type: "rings",
      word: "AE<br><em>01</em>",
      label: "AETHERIUM / OBJECT STUDY",
      meta: "CHROME / 2026"
    },
    gallery: [
      { type: "grid", word: "FREQ<br><em>03</em>", label: "FREQUENCY MAP", meta: "LOW / MID / HIGH" },
      { type: "wave", word: "SCROLL<br><em>SCORE</em>", label: "CAMERA PATH", meta: "GSAP / 60FPS" }
    ],
    cardImageWidth: 1600,
    cardImageHeight: 1200
  },
  {
    slug: "kinetic-type-lab",
    title: "Kinetic Type Lab",
    titleHtml: "Kinetic <em>Type</em> Lab",
    category: "3d",
    categoryLabel: "3D",
    year: "2025",
    theme: "theme-kinetic",
    cover: "kinetic-type-lab.svg",
    coverAlt: "Extruded typography in cream, orange and black, arranged like an experimental type specimen.",
    card: "A type specimen you can push, light, and export. Six material studies, one very large letterform.",
    summary: "A browser-based type playground that turns a word into architecture, then lets you photograph it.",
    role: "Concept / Type design / Development",
    discipline: "3D / Tooling",
    stack: "Three.js, custom geometry, GSAP, Canvas 2D",
    status: "Self-initiated tool",
    briefTitle: "A letter is a building with one room.",
    brief: [
      "Type is usually treated as a surface. Kinetic Type Lab asks what happens when it becomes a room. The brief was to build a tool that a designer could open in a browser, type a word into, and leave with a poster that felt designed rather than generated.",
      "The constraint was intentional: one word at a time, one light rig, six material studies. The lab should feel like a piece of studio equipment, not a toy with a thousand sliders."
    ],
    approachTitle: "Constrain the controls. Open the output.",
    approach: [
      "I built a small extrusion pipeline around Three.js text geometry, then limited the controls on purpose. Six material presets, three camera moves, and a single light rig. The constraints make the output feel authored.",
      "A Canvas 2D pass adds grain, crop marks, and the project's print metadata before export. The interface uses the same typographic grid as the artwork, so the tool and the output share a visual language."
    ],
    buildTitle: "A real tool, not a case-study mockup.",
    build: [
      "The lab supports live text entry, real-time material swapping, orbit controls, and PNG export at 2400 × 3000. A custom depth material keeps the type readable from extreme angles.",
      "GSAP handles the interface choreography; the renderer pauses when the tab is hidden. The entire experience is client-side and requires no account, upload, or server."
    ],
    buildList: [
      "Live text entry with beveled 3D geometry.",
      "Six material presets from chrome to translucent clay.",
      "Orbit camera with authored poster crops.",
      "High-resolution PNG export with print metadata."
    ],
    quote: "A letter is a building with one <span>room.</span>",
    outcomes: [
      ["Format", "Browser-based type tool"],
      ["Output", "2400 × 3000 PNG posters"],
      ["Controls", "Text, material, camera, light"],
      ["Engine", "Client-side Three.js"]
    ],
    outcomeNote: "The lab is intentionally narrow: one word, six materials, one light rig. That constraint is the point. The next iteration would add a typeface importer, a saved-poster gallery, and a small set of curated starting words.",
    artifact: {
      type: "grid",
      word: "K<br><em>Ψ</em>",
      label: "TYPE SPECIMEN / 01",
      meta: "EXTRUSION / 2025"
    },
    gallery: [
      { type: "stack", word: "TYPE<br><em>06</em>", label: "MATERIAL STUDIES", meta: "CLAY / CHROME" },
      { type: "rings", word: "2400<br><em>× 3000</em>", label: "PRINT EXPORT", meta: "CANVAS 2D" }
    ],
    cardImageWidth: 1600,
    cardImageHeight: 1200
  },
  {
    slug: "orbital-atlas",
    title: "Orbital Atlas",
    titleHtml: "Orbital <em>Atlas</em>",
    category: "web3d",
    categoryLabel: "Web3D",
    year: "2025",
    theme: "theme-orbital",
    cover: "orbital-atlas.svg",
    coverAlt: "A cyan and blue orbital data visualisation with a central planet, orbital paths and points of light.",
    card: "An orbital data story built on instanced WebGL. Scrub time, search the sky, and watch the planet disappear.",
    summary: "A near-Earth object atlas that makes 1,248 pieces of orbital data feel like a night sky you can scrub through.",
    role: "Design / Data visualisation / Front-end",
    discipline: "Web3D / Data",
    stack: "Three.js instancing, GLSL, GSAP, orbital data",
    status: "Self-initiated study",
    briefTitle: "Make the numbers feel like a sky.",
    brief: [
      "Public orbital data is dense, beautiful, and almost impossible to read. Orbital Atlas is an attempt to make it physical. The brief: build a browser tool that lets someone understand scale, distance, and time without reading a single table.",
      "The audience is curious, not necessarily scientific. The interface needed to reward a five-second visit and still hold up for someone who wants to inspect a single object's path."
    ],
    approachTitle: "Keep the numbers close to the surface.",
    approach: [
      "Each object is an instanced point with its own orbital path, altitude, and velocity. A time scrubber moves the whole system through a 24-hour window. The camera can pull back to a full system view or lock onto a single object.",
      "Labels are HTML, not canvas, so they stay crisp and accessible. A custom shader fades orbit trails with age and altitude, giving the field depth without a heavy post-processing stack."
    ],
    buildTitle: "One scene, a thousand paths.",
    build: [
      "The renderer uses GPU instancing for the object field and a separate line pass for orbit trails. A custom shader fades the trails with age and altitude. The interface is keyboard-accessible: arrow keys move time, and the search field jumps to an object.",
      "Data is bundled at build time, so there are no API keys or live network dependencies. The scene degrades to a flat map on devices without WebGL and respects reduced-motion preferences."
    ],
    buildList: [
      "1,248 instanced near-Earth objects.",
      "A 24-hour time scrubber with keyboard controls.",
      "Search and focus mode for individual orbits.",
      "Bundled public data with no API keys."
    ],
    quote: "Scale is a feeling <span>before</span> it is a number.",
    outcomes: [
      ["Format", "Data-driven WebGL study"],
      ["Objects", "1,248 instanced paths"],
      ["Interaction", "Time scrub + object search"],
      ["Fallback", "Accessible flat map"]
    ],
    outcomeNote: "The atlas is a study in scale, not a mission-planning tool. It shows what public orbital data could feel like if it were treated as a place rather than a table. A production version would need live data, a proper ephemeris model, and a much longer onboarding story.",
    artifact: {
      type: "rings",
      word: "NEO<br><em>1248</em>",
      label: "ORBITAL FIELD / LIVE",
      meta: "ALT 408 KM"
    },
    gallery: [
      { type: "grid", word: "24H<br><em>WINDOW</em>", label: "TIME SCRUB", meta: "ARROW KEYS" },
      { type: "wave", word: "PATH<br><em>TRACE</em>", label: "ORBIT TRAILS", meta: "GLSL / AGE" }
    ],
    cardImageWidth: 1600,
    cardImageHeight: 1200
  },
  {
    slug: "monolith",
    title: "Monolith",
    titleHtml: "Mono<em>lith</em>",
    category: "web",
    categoryLabel: "Web",
    year: "2025",
    theme: "theme-monolith",
    cover: "monolith.svg",
    coverAlt: "An architectural editorial composition of bone, black and vermilion blocks.",
    card: "An editorial commerce concept for quiet, heavy objects. Built around pace, negative space, and one very good chair.",
    summary: "A digital flagship for a furniture studio that treats objects like monuments. Slow pacing, oversized type, and a product browser that feels like a gallery.",
    role: "Art direction / UX / Build",
    discipline: "Web / Commerce",
    stack: "HTML, CSS, GSAP, headless commerce",
    status: "Concept storefront",
    briefTitle: "Sell the silence, not the sofa.",
    brief: [
      "Monolith is a fictional furniture studio making pieces for quiet rooms. The brief was to design a storefront that could sell a chair without a single lifestyle photo. The products needed to feel like architecture: heavy, considered, and worth slowing down for.",
      "The experience had to remain useful. A gallery is lovely until you need to know the dimensions, the finish, or the lead time. The design keeps the poetry in the frame and the practical detail within reach."
    ],
    approachTitle: "Three moves: title, object, detail.",
    approach: [
      "I stripped the interface back to three moves: a title, an object, a detail. Product pages behave like exhibition labels. The grid is deliberately irregular; the typography does most of the emotional work.",
      "A warm bone palette keeps the experience from feeling like another dark portfolio. Vermilion is reserved for the moments that need a pulse: add to cart, current section, a single line of emphasis."
    ],
    buildTitle: "A storefront that behaves like a room.",
    build: [
      "The build is static-first with a headless commerce layer. Product data drives the catalogue, while a small GSAP layer handles image reveals, menu transitions, and the cart drawer.",
      "The cart persists locally and gracefully falls back to a contact-based enquiry flow if the commerce endpoint is unavailable. Product pages include dimensions, materials, lead times, and care notes — the unglamorous details that make a storefront real."
    ],
    buildList: [
      "Catalogue, product detail, and cart drawer.",
      "Editorial journal with three launch stories.",
      "Local cart persistence with enquiry fallback.",
      "Responsive image crops and reduced-motion support."
    ],
    quote: "Sell the silence, not the <span>sofa.</span>",
    outcomes: [
      ["Format", "Editorial commerce concept"],
      ["Scope", "Catalogue / product / cart / journal"],
      ["Palette", "Bone, ink, vermilion"],
      ["Fallback", "Enquiry flow without commerce API"]
    ],
    outcomeNote: "The storefront proves the pacing can survive commerce. The next step would be real inventory, fulfilment, and a product photography system that keeps the same restraint. The silence is the feature; the checkout still has to work.",
    artifact: {
      type: "stack",
      word: "M<br><em>01</em>",
      label: "MONOLITH / OBJECT 01",
      meta: "ASH / OAK / STEEL"
    },
    gallery: [
      { type: "grid", word: "ROOM<br><em>STUDY</em>", label: "EDITORIAL GRID", meta: "TYPE / PACE" },
      { type: "rings", word: "CART<br><em>DRAWER</em>", label: "COMMERCE LAYER", meta: "LOCAL / PERSIST" }
    ],
    cardImageWidth: 1600,
    cardImageHeight: 1200
  },
  {
    slug: "field-notes",
    title: "Field Notes",
    titleHtml: "Field <em>Notes</em>",
    category: "web",
    categoryLabel: "Web",
    year: "2024",
    theme: "theme-field-notes",
    cover: "field-notes.svg",
    coverAlt: "An editorial collage in warm paper, black serif type and vermilion details.",
    card: "An editorial platform for people who take their time. Built around reading, not engagement.",
    summary: "A quiet reading room for a collective of writers, photographers, and researchers. Generous type, almost no chrome, and a search that feels like browsing a shelf.",
    role: "Design / Front-end / Publishing system",
    discipline: "Web / Editorial",
    stack: "Static site, headless CMS, GSAP, custom search",
    status: "Editorial concept",
    briefTitle: "Give the sentence somewhere to land.",
    brief: [
      "Field Notes is a fictional collective publishing long-form work about place, memory, and the more-than-human world. The brief was to make a website that felt like a printed object: warm paper, confident type, and enough room for a photograph to breathe.",
      "The publishing team needed a system, not a one-off page. The design had to flex across essays, interviews, photo series, and short field notes without losing its voice."
    ],
    approachTitle: "Reading is the interface.",
    approach: [
      "The design uses a single editorial grid and lets the content change the rhythm. Essays can open with a full-bleed image, a pull quote, or a field note. The archive is organised by issue, place, and contributor rather than by an algorithm.",
      "A custom search indexes titles, standfirsts, and tags client-side, so the archive stays fast without a database. Reading progress, footnotes, and captions are handled with small, purposeful interactions."
    ],
    buildTitle: "A quiet system under the paper.",
    build: [
      "A static-first publishing pipeline with a headless CMS for the editors. The build stays light: semantic HTML, a small CSS system, and progressive enhancement for the motion layer.",
      "GSAP adds a restrained page transition and scroll reveal; the rest is typography. The result loads quickly on a phone and still feels considered on a large display."
    ],
    buildList: [
      "Issue archive with place and contributor filters.",
      "Client-side search across titles, standfirsts, and tags.",
      "Essay template with reading progress and footnotes.",
      "Headless CMS workflow for a small editorial team."
    ],
    quote: "Give the sentence somewhere to <span>land.</span>",
    outcomes: [
      ["Format", "Editorial publishing concept"],
      ["Scope", "Home / archive / essay / search / about"],
      ["Tone", "Warm paper, serif, vermilion"],
      ["Build", "Static-first with headless CMS"]
    ],
    outcomeNote: "The archive is small on purpose. The system is built to grow one issue at a time, with the same grid and the same pace. The next step would be a real editorial calendar and a print-on-demand companion for the best long reads.",
    artifact: {
      type: "grid",
      word: "NOTE<br><em>04</em>",
      label: "FIELD NOTES / ISSUE 04",
      meta: "READ SLOWLY"
    },
    gallery: [
      { type: "stack", word: "ARCHIVE<br><em>048</em>", label: "EDITORIAL INDEX", meta: "PLACE / AUTHOR" },
      { type: "wave", word: "SEARCH<br><em>LOCAL</em>", label: "CLIENT-SIDE INDEX", meta: "NO DATABASE" }
    ],
    cardImageWidth: 1600,
    cardImageHeight: 1200
  },
  {
    slug: "signal-garden",
    title: "Signal Garden",
    titleHtml: "Signal <em>Garden</em>",
    category: "3d",
    categoryLabel: "3D",
    year: "2024",
    theme: "theme-signal-garden",
    cover: "signal-garden.svg",
    coverAlt: "An audio-reactive garden of acid green and violet waveforms growing from a dark field.",
    card: "An audio-reactive WebGL garden. Speak, hum, or plug in a MIDI controller and watch it bloom.",
    summary: "A garden that grows from sound. Microphone or MIDI input feeds a field of instanced blooms, each one opening in response to pitch, amplitude, and rhythm.",
    role: "Creative coding / Sound / WebGL",
    discipline: "3D / Audio",
    stack: "Three.js, Web Audio API, GLSL, MIDI",
    status: "Self-initiated installation",
    briefTitle: "Listen first. The geometry will follow.",
    brief: [
      "Signal Garden began as a way to make sound visible without turning it into a waveform. The brief was simple: build a small world that listens. No samples, no preset animation. Every flower is a response to live input.",
      "It needed to work in two very different contexts: a quiet browser tab with a microphone, and a projector in a room with a MIDI controller. The system had to be resilient to both."
    ],
    approachTitle: "Map sound to growth, not volume bars.",
    approach: [
      "I mapped pitch to hue, amplitude to scale, and transient density to the number of open blooms. A feedback delay in the audio graph lets the garden keep moving after a sound stops.",
      "The result is part instrument, part screensaver, part meditation. There is no score and no right way to play it. The only instruction is to make a sound."
    ],
    buildTitle: "A living shader with a limiter.",
    build: [
      "The field uses instanced geometry for the blooms and a custom shader for petal curvature. Web Audio handles microphone input, MIDI note detection, and a master limiter.",
      "A fallback mode generates a slow synthetic signal when microphone access is denied, so the garden never appears broken. The whole scene is capped at 1.5× DPR on mobile and pauses when the tab is hidden."
    ],
    buildList: [
      "Microphone and MIDI input modes.",
      "Pitch, amplitude, and transient mapping.",
      "Instanced blooms with custom petal shaders.",
      "Synthetic fallback when mic access is denied."
    ],
    quote: "Listen first. The geometry will <span>follow.</span>",
    outcomes: [
      ["Format", "Audio-reactive installation"],
      ["Input", "Microphone / MIDI / synthetic fallback"],
      ["Visual", "Instanced blooms + GLSL petals"],
      ["Use", "Browser installation and live visual"]
    ],
    outcomeNote: "The garden is never finished. Every input changes it. The installation version would add a projector mode, a longer audio loop, and a small set of gestures that let a room of people play it together.",
    artifact: {
      type: "wave",
      word: "SIGNAL<br><em>01</em>",
      label: "SIGNAL GARDEN / LIVE",
      meta: "INPUT / GROW"
    },
    gallery: [
      { type: "rings", word: "PITCH<br><em>HUE</em>", label: "AUDIO MAPPING", meta: "FREQ / COLOR" },
      { type: "grid", word: "MIDI<br><em>IN</em>", label: "INPUT LAYER", meta: "WEB AUDIO" }
    ],
    cardImageWidth: 1600,
    cardImageHeight: 1200
  }
];

const site = {
  name: "Function Psi",
  owner: "Rendani Manugeni",
  tagline: "Making digital stuff is so cool.",
  positioning: "One of the coolest websites out there.",
  baseUrl: "https://fnpsi.env.pm",
  githubUrl: "https://github.com/fnpsi/fnpsi.github.io",
  location: "South Africa",
  timeZone: "Africa/Johannesburg"
};

const social = {
  x: "https://x.com/fnpsi_",
  instagram: "https://instagram.com/fnpsi",
  github: "https://github.com/fnpsi",
  youtube: "https://youtube.com/@fnpsi"
};

module.exports = { projects, site, social };
