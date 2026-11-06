"use strict";

const fs = require("fs");
const path = require("path");
const { projects, site, social } = require("./project-data");
const {
  root,
  page,
  projectCard,
  artifact,
  escapeHtml,
  escapeAttr
} = require("./site-shell");

const YEAR = "2026";
const EFFECTIVE = "3 November 2026";

/* ------------------------------------------------------------------ */
/* Shared structured data                                             */
/* ------------------------------------------------------------------ */

const personSchema = {
  "@type": "Person",
  "@id": site.baseUrl + "/#person",
  name: site.owner,
  alternateName: "Function Psi",
  url: site.baseUrl + "/",
  jobTitle: "Creative Developer",
  description:
    "Rendani Manugeni is a South African creative developer building 3D worlds, WebGL instruments, and websites with a pulse.",
  sameAs: [social.x, social.instagram, social.github, social.youtube],
  address: {
    "@type": "PostalAddress",
    addressCountry: "ZA"
  }
};

const websiteSchema = {
  "@type": "WebSite",
  "@id": site.baseUrl + "/#website",
  url: site.baseUrl + "/",
  name: "Function Psi",
  description: site.tagline,
  publisher: { "@id": site.baseUrl + "/#person" },
  inLanguage: "en-ZA"
};

function homeSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personSchema,
      websiteSchema,
      {
        "@type": "ProfilePage",
        "@id": site.baseUrl + "/#profile",
        url: site.baseUrl + "/",
        name: "Function Psi — Rendani Manugeni",
        isPartOf: { "@id": site.baseUrl + "/#website" },
        about: { "@id": site.baseUrl + "/#person" }
      }
    ]
  };
}

function aboutSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personSchema,
      {
        "@type": "ProfilePage",
        url: site.baseUrl + "/about.html",
        name: "About Rendani Manugeni — Function Psi",
        description:
          "The practice, principles, and toolkit of Rendani Manugeni, the creative developer behind Function Psi.",
        mainEntity: { "@id": site.baseUrl + "/#person" },
        isPartOf: { "@id": site.baseUrl + "/#website" }
      }
    ]
  };
}

function workSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Work — Function Psi",
    url: site.baseUrl + "/work/",
    description:
      "Selected 3D, Web3D, and web projects by Rendani Manugeni, published as Function Psi.",
    isPartOf: { "@id": site.baseUrl + "/#website" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map(function (project, index) {
        return {
          "@type": "ListItem",
          position: index + 1,
          name: project.title,
          url: site.baseUrl + "/work/" + project.slug + ".html"
        };
      })
    }
  };
}

function caseSchema(project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: site.baseUrl + "/work/" + project.slug + ".html",
    image: site.baseUrl + "/assets/work/" + project.cover,
    genre: project.categoryLabel,
    dateCreated: project.year,
    creator: {
      "@type": "Person",
      name: site.owner,
      url: site.baseUrl + "/about.html"
    },
    isPartOf: {
      "@type": "CollectionPage",
      name: "Work — Function Psi",
      url: site.baseUrl + "/work/"
    },
    about: project.discipline
  };
}

function legalSchema(name, description, canonical) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: name + " — Function Psi",
    description: description,
    url: site.baseUrl + canonical,
    isPartOf: { "@id": site.baseUrl + "/#website" },
    publisher: { "@id": site.baseUrl + "/#person" }
  };
}

/* ------------------------------------------------------------------ */
/* Home                                                               */
/* ------------------------------------------------------------------ */

function tickerGroup() {
  const items = [
    "Making digital stuff is so cool.",
    "3D worlds",
    "WebGL instruments",
    "Websites with a pulse",
    "Rendani Manugeni",
    "Function Psi"
  ];

  return [
    '<div class="ticker__group">',
    items
      .map(function (item) {
        return '  <span class="ticker__item">' + item + "</span>";
      })
      .join("\n"),
    "</div>"
  ].join("\n");
}

function capabilities() {
  const cards = [
    {
      number: "01",
      title: "Objects with weight.",
      copy:
        "Modelling, materials, lighting, and animation for screens that can handle it. I care about the way a surface catches light and the way a camera earns a reveal.",
      tags: ["Blender", "Three.js", "Cycles"]
    },
    {
      number: "02",
      title: "The browser is the stage.",
      copy:
        "Real-time scenes, custom shaders, audio-reactive systems, and the performance work that keeps them alive on a phone.",
      tags: ["Three.js", "GLSL", "Web Audio"]
    },
    {
      number: "03",
      title: "Sites with a pulse.",
      copy:
        "Art direction, front-end architecture, and motion design for sites that need to feel authored rather than assembled.",
      tags: ["HTML / CSS", "GSAP", "Accessibility"]
    }
  ];

  return cards
    .map(function (card) {
      return [
        '<article class="cap-card">',
        '  <p class="cap-card__number">' + card.number + " / Capability</p>",
        "  <div>",
        "    <h3>" + card.title + "</h3>",
        "    <p>" + card.copy + "</p>",
        '    <div class="cap-card__tags">',
        card.tags
          .map(function (tag) {
            return "      <span>" + tag + "</span>";
          })
          .join("\n"),
        "    </div>",
        "  </div>",
        "</article>"
      ].join("\n");
    })
    .join("\n");
}

function processSteps() {
  const steps = [
    {
      title: "Listen",
      copy:
        "The first pass is questions. What is this for, who is it for, and what should someone feel in the first five seconds? I would rather find the sharp idea before opening a design file."
    },
    {
      title: "Sketch in motion",
      copy:
        "I storyboard in the browser early. Type, timing, and camera moves are easier to judge when they are moving. Static mockups are a checkpoint, not the destination."
    },
    {
      title: "Build the real thing",
      copy:
        "No beautiful prototype that dies in handoff. I build the actual interface, with real content, real breakpoints, and real performance constraints."
    },
    {
      title: "Tune until it feels alive",
      copy:
        "The last ten percent is timing, easing, and restraint. I keep tuning until the page has a pulse and nothing moves just because it can."
    }
  ];

  return steps
    .map(function (step, index) {
      return [
        '<article class="process-step" data-reveal>',
        '  <p class="process-step__num">' + String(index + 1).padStart(2, "0") + "</p>",
        "  <h3>" + step.title + "</h3>",
        "  <p>" + step.copy + "</p>",
        "</article>"
      ].join("\n");
    })
    .join("\n");
}

function homeContent() {
  const selected = projects
    .map(function (project, index) {
      return projectCard(project, index);
    })
    .join("\n");

  return [
    '<main id="main" tabindex="-1">',
    '  <section class="hero-cinema" data-hero-cinema aria-labelledby="hero-title">',
    '    <div class="hero-cinema__pin" data-hero-pin>',
    '      <div class="hero-cinema__stage" data-hero-visual>',
    '        <canvas class="hero-cinema__canvas" data-hero-canvas aria-hidden="true"></canvas>',
    '        <div class="hero-cinema__fallback" data-hero-fallback aria-hidden="true">',
    '          <div class="hero-cinema__fallback-orb"></div>',
    '          <span class="hero-cinema__fallback-ring"></span>',
    '          <span class="hero-cinema__fallback-ring hero-cinema__fallback-ring--two"></span>',
    "        </div>",
    '        <div class="hero-cinema__scrim" aria-hidden="true"></div>',
    '        <div class="hero-cinema__vignette" aria-hidden="true"></div>',
    '        <div class="hero-cinema__grain" aria-hidden="true"></div>',
    '        <span class="hero-cinema__crosshair hero-cinema__crosshair--one" aria-hidden="true"></span>',
    '        <span class="hero-cinema__crosshair hero-cinema__crosshair--two" aria-hidden="true"></span>',
    "      </div>",
    '      <div class="hero-cinema__rail" aria-hidden="true">',
    '        <span class="hero-cinema__rail-label">FNPSI / Signal study / 2026</span>',
    '        <span class="hero-cinema__rail-line"></span>',
    '        <span class="hero-cinema__rail-coords" data-hero-coords>X 0.0 / Y 0.0 / Z 9.0</span>',
    "      </div>",
    "",
    '      <div class="container hero-cinema__ui">',
    '        <div class="hero-cinema__top">',
    '          <p class="eyebrow">Rendani Manugeni / Creative developer</p>',
    '          <div class="hero-cinema__hud" aria-hidden="true">',
    '            <span data-hero-phase>01 / Signal</span>',
    '            <span class="hero-cinema__hud-track"><i data-hero-progress></i></span>',
    '            <span data-hero-percent>00</span>',
    "          </div>",
    "        </div>",
    "",
    '        <div class="hero-cinema__main">',
    '          <h1 class="hero-cinema__title" id="hero-title">',
    '            <span class="hero__line"><span>Making</span></span>',
    '            <span class="hero__line"><span>digital stuff</span></span>',
    '            <span class="hero__line"><span>is <em>so cool.</em></span></span>',
    "          </h1>",
    '          <div class="hero-cinema__intro">',
    '            <p class="hero__lede">I build <strong>3D worlds, WebGL instruments, and websites with a pulse.</strong> Function Psi is the independent practice of Rendani Manugeni — one person in South Africa, with a very wide browser.</p>',
    '            <div class="hero__actions">',
    '              <a class="btn" href="/work/" data-magnetic="0.14"><span>See the work</span><span aria-hidden="true">↗</span></a>',
    '              <a class="btn btn--ghost" href="/about.html"><span>About Rendani</span></a>',
    "            </div>",
    "          </div>",
    "        </div>",
    "",
    '        <div class="hero-cinema__phase-stage" aria-hidden="true">',
    '          <div class="hero-cinema__phase" data-hero-caption="1">',
    '            <p class="eyebrow">02 / Depth</p>',
    '            <p class="hero-cinema__phase-title">3D worlds <em>with weight.</em></p>',
    '            <p class="hero-cinema__phase-note">Modelling, materials, and lighting for screens that can handle it.</p>',
    "          </div>",
    '          <div class="hero-cinema__phase" data-hero-caption="2">',
    '            <p class="eyebrow">03 / Motion</p>',
    '            <p class="hero-cinema__phase-title">The browser is <em>the stage.</em></p>',
    '            <p class="hero-cinema__phase-note">Real-time scenes, custom shaders, and the performance work that keeps them alive.</p>',
    "          </div>",
    '          <div class="hero-cinema__phase" data-hero-caption="3">',
    '            <p class="eyebrow">04 / Enter</p>',
    '            <p class="hero-cinema__phase-title">Six projects. <em>Zero filler.</em></p>',
    '            <p class="hero-cinema__phase-note">Six self-initiated concepts across 3D, Web3D, and web. Each one is a full case study — brief, build, and the decisions that changed along the way.</p>',
    "          </div>",
    "        </div>",
    "",
    '        <div class="hero-cinema__bottom">',
    '          <div class="hero-cinema__meta">',
    '            <span><strong>Function Psi</strong> / Portfolio 2026</span>',
    '            <span>South Africa / <span data-clock>--:--</span> SAST</span>',
    '            <span>3D · Web3D · Web</span>',
    "          </div>",
    '          <div class="hero-cinema__controls">',
    '            <span class="hero-cinema__signal" data-webgl-note><i aria-hidden="true"></i><span data-webgl-note-text>Initialising WebGL</span></span>',
    '            <span class="hero-cinema__cue" aria-hidden="true"><span class="hero-cinema__cue-line"></span>Scroll to enter</span>',
    '            <a class="hero-cinema__enter" href="#selected" data-hero-enter>Enter the work <span aria-hidden="true">↓</span></a>',
    '            <a class="hero-cinema__skip" href="#intro">Skip intro <span aria-hidden="true">↓</span></a>',
    "          </div>",
    "        </div>",
    "      </div>",
    '      <div class="hero-cinema__flash" data-hero-flash aria-hidden="true"></div>',
    "    </div>",
    "  </section>",
    "",
    '  <div class="ticker" aria-hidden="true">',
    '    <div class="ticker__track">',
    tickerGroup(),
    tickerGroup(),
    "    </div>",
    "  </div>",
    "",
    '  <section class="section intro" id="intro" aria-labelledby="intro-title">',
    '    <div class="container intro__grid">',
    '      <aside class="intro__aside" data-reveal>',
    '        <p class="eyebrow">00 / Position</p>',
    "        <p>Function Psi is the independent practice of Rendani Manugeni — a creative developer in South Africa, working wherever the browser is.</p>",
    '        <a class="link-arrow" href="/about.html">More about the studio <span aria-hidden="true">↗</span></a>',
    "      </aside>",
    "      <div>",
    '        <p class="intro__statement" id="intro-title" data-reveal>I make <em>interfaces</em> that feel like places, <span class="quiet">not pages.</span></p>',
    '        <div class="intro__stats" data-reveal-group>',
    '          <div class="stat"><span class="stat__number">06<span>↗</span></span><span class="stat__label">Selected projects</span></div>',
    '          <div class="stat"><span class="stat__number">03<span>×</span></span><span class="stat__label">Disciplines: 3D, Web3D, Web</span></div>',
    '          <div class="stat"><span class="stat__number">01<span>Ψ</span></span><span class="stat__label">Human behind the pixels</span></div>',
    "        </div>",
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="section selected" id="selected" aria-labelledby="selected-title">',
    '    <div class="container">',
    '      <div class="section-head" data-reveal>',
    "        <div>",
    '          <p class="eyebrow">01 / Selected work</p>',
    '          <h2 class="section-head__title" id="selected-title">Six ways to make the internet <em>less boring.</em></h2>',
    "        </div>",
    '        <div class="section-head__aside">',
    "          <p>A mix of self-initiated concepts and studio-scale experiments. Every project is a complete case study — brief, build, and the decisions behind it.</p>",
    '          <p><a class="link-arrow" href="/work/">Open the full index <span aria-hidden="true">↗</span></a></p>',
    "        </div>",
    "      </div>",
    '      <div class="project-grid" data-reveal-group>',
    selected,
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="capabilities" data-capabilities aria-labelledby="capabilities-title">',
    '    <div class="capabilities__pin">',
    '      <div class="container capabilities__head" data-reveal>',
    "        <div>",
    '          <p class="eyebrow">02 / What I do</p>',
    '          <h2 id="capabilities-title">Three disciplines. One <em>restless</em> browser.</h2>',
    "        </div>",
    "        <p>The through-line is motion. Things should respond, settle, and occasionally surprise you. The tools change; the curiosity doesn't.</p>",
    "      </div>",
    '      <div class="container capabilities__viewport" data-cap-viewport>',
    '        <div class="capabilities__track" data-cap-track>',
    capabilities(),
    "        </div>",
    "      </div>",
    '      <div class="container capabilities__progress">',
    '        <div class="capabilities__progress-line" aria-hidden="true"><span data-cap-progress></span></div>',
    "        <span>Drag through the disciplines / scroll</span>",
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="section process" aria-labelledby="process-title">',
    '    <div class="container process__grid">',
    '      <div class="process__sticky" data-reveal>',
    '        <p class="eyebrow">03 / How it goes</p>',
    '        <h2 id="process-title">A process with <em>room to wander.</em></h2>',
    "        <p>Every project starts with a conversation and ends with something you can open in a browser. The middle is where the interesting accidents happen.</p>",
    "      </div>",
    '      <div class="process__list">',
    processSteps(),
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="section studio" aria-labelledby="studio-title">',
    '    <div class="container studio__grid">',
    '      <div class="studio__visual" data-reveal>',
    '        <span class="studio__glyph" aria-hidden="true">ƒΨ</span>',
    '        <div class="studio__visual-meta"><span>Studio mark / Function Psi</span><span>South Africa / worldwide</span></div>',
    "      </div>",
    '      <div class="studio__copy" data-reveal>',
    '        <p class="eyebrow">04 / The studio</p>',
    '        <h2 id="studio-title">Function Psi is <em>one person</em> with a very wide browser.</h2>',
    "        <p>I'm Rendani Manugeni, a creative developer from South Africa. I work with founders, studios, and small teams on launches, experiments, and the occasional strange idea. I handle the concept, design, and build — and bring in collaborators when the work needs another pair of hands.</p>",
    "        <p>The name comes from function and psi: a nod to systems, signals, and the strange space between logic and intuition.</p>",
    '        <a class="link-arrow" href="/about.html">More about Rendani <span aria-hidden="true">↗</span></a>',
    '        <div class="studio__facts"><span>Independent practice</span><span>Remote worldwide</span><span>3D · Web3D · Web</span></div>',
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="section now" aria-labelledby="now-title">',
    '    <div class="container now__grid">',
    "      <div>",
    '        <p class="eyebrow">05 / Currently</p>',
    '        <h2 id="now-title">Open for the <em>strange ones.</em></h2>',
    "      </div>",
    '      <div class="now__aside">',
    "        <p>I take on a small number of projects at a time: launches, experiments, and collaborations where the brief is clear but the outcome isn't. If you have a strange idea and a real deadline, I want to hear it.</p>",
    '        <a class="btn" href="' + social.x + '" target="_blank" rel="noopener noreferrer" data-magnetic="0.14"><span>Start a conversation</span><span aria-hidden="true">↗</span></a>',
    '        <p class="mono" style="color:var(--quiet);font-size:.6rem;">Remote worldwide / replies usually within 48 hours</p>',
    "      </div>",
    "    </div>",
    "  </section>",
    "</main>"
  ].join("\n");
}

function homePage() {
  return page({
    title: "Function Psi — Rendani Manugeni",
    description:
      "Rendani Manugeni is a South African creative developer building 3D worlds, WebGL instruments, and websites with a pulse. Making digital stuff is so cool.",
    canonical: "/",
    imageAlt: "Function Psi — Making digital stuff is so cool.",
    bodyClass: "home",
    page: "home",
    styles: ["/css/base.css", "/css/main.css"],
    loader: true,
    extraHead: [
      '<script type="importmap">',
      "{",
      '  "imports": {',
      '    "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",',
      '    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"',
      "  }",
      "}",
      "</script>"
    ].join("\n"),
    schema: homeSchema(),
    content: homeContent(),
    scripts: '<script src="/js/hero3d.js" type="module"></script>'
  });
}

/* ------------------------------------------------------------------ */
/* About                                                              */
/* ------------------------------------------------------------------ */

function principle(number, title, copy) {
  return [
    '<article class="principle">',
    '  <p class="principle__num">' + number + " / Principle</p>",
    "  <h3>" + title + "</h3>",
    "  <p>" + copy + "</p>",
    "</article>"
  ].join("\n");
}

function toolkitRow(label, detail) {
  return [
    '<div class="toolkit__row">',
    "  <span>" + label + "</span>",
    "  <span>" + detail + "</span>",
    "</div>"
  ].join("\n");
}

function aboutFact(label, value, meta) {
  return [
    '<div class="about-fact">',
    '  <p class="about-fact__label">' + label + "</p>",
    '  <p class="about-fact__value">' + value + "</p>",
    '  <p class="about-fact__meta">' + meta + "</p>",
    "</div>"
  ].join("\n");
}

function aboutContent() {
  return [
    '<main id="main" tabindex="-1">',
    '  <section class="about-hero" aria-labelledby="about-title">',
    '    <div class="container">',
    '      <p class="eyebrow">About / Rendani Manugeni</p>',
    '      <h1 id="about-title">Creative developer.<br><em>Professional curious person.</em></h1>',
    '      <div class="about-hero__foot">',
    '        <p class="about-hero__lede">I make 3D worlds, WebGL instruments, and websites that feel like places. Function Psi is the name I publish under — and the way I think about the work.</p>',
    '        <div class="about-hero__meta">',
    "          <span>Based / South Africa</span>",
    "          <span>Working / Remote worldwide</span>",
    "          <span>Focus / 3D · Web3D · Web</span>",
    "          <span>Status / Open for select projects</span>",
    "        </div>",
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="section about-intro" aria-labelledby="about-intro-title">',
    '    <div class="container about-intro__grid">',
    '      <aside class="intro__aside" data-reveal>',
    '        <p class="eyebrow">01 / The short version</p>',
    "        <p>Function Psi is an independent creative practice, not an agency. One person, a wide browser, and a network of collaborators.</p>",
    '        <p class="mono" style="color:var(--quiet);font-size:.58rem;">South Africa / SAST / remote worldwide</p>',
    "      </aside>",
    '      <div class="about-intro__copy" id="about-intro-title" data-reveal>',
    "        <p>I'm <strong>Rendani Manugeni</strong>, a creative developer from South Africa. I build digital things that move: 3D worlds, real-time instruments, and websites with a point of view. My work sits between design and engineering, which is exactly where the interesting problems live.</p>",
    "        <p>I started Function Psi to make room for work that does not fit neatly into a deck. The projects here are self-initiated concepts and studio-scale experiments. Some are tools, some are stories, all of them are built to be opened, touched, and judged in the browser.</p>",
    "        <p class=\"muted\">The tagline is <strong>Making digital stuff is so cool.</strong> The positioning is <strong>One of the coolest websites out there.</strong> The first is a fact. The second is a standard I keep working toward.</p>",
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="section principles" aria-labelledby="principles-title">',
    '    <div class="container">',
    '      <div class="section-head" data-reveal>',
    "        <div>",
    '          <p class="eyebrow">02 / Principles</p>',
    '          <h2 class="section-head__title" id="principles-title">Four rules I keep <em>breaking.</em></h2>',
    "        </div>",
    '        <div class="section-head__aside"><p>Not because they are wrong. Because the work gets better when a rule has a reason. These are the defaults I argue with.</p></div>',
    "      </div>",
    '      <div class="principles__grid" data-reveal-group>',
    principle("01", "Make it feel first.", "A page can be useful and still feel like a filing cabinet. I start with the feeling, then earn the utility."),
    principle("02", "Motion is meaning.", "Animation should explain something: hierarchy, cause, scale, or surprise. If it only decorates, it gets cut."),
    principle("03", "Build the real thing.", "I would rather ship a working interface than present a beautiful image of one. Real content, real devices, real constraints."),
    principle("04", "Leave room to breathe.", "The best moments need silence around them. Negative space is not empty; it is pacing."),
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="section toolkit" aria-labelledby="toolkit-title">',
    '    <div class="container toolkit__layout">',
    '      <div class="toolkit__title" data-reveal>',
    '        <p class="eyebrow">03 / Toolkit</p>',
    '        <h2 id="toolkit-title">Tools are not the <em>point.</em></h2>',
    "        <p>The stack is whatever gets the idea into the browser without sanding off the interesting edges. These are the tools I reach for most.</p>",
    "      </div>",
    '      <div class="toolkit__list" data-reveal-group>',
    toolkitRow("Creative direction", "Concept, narrative, art direction"),
    toolkitRow("3D and WebGL", "Blender, Three.js, GLSL, Web Audio"),
    toolkitRow("Front-end", "HTML, CSS, JavaScript, performance"),
    toolkitRow("Motion and interaction", "GSAP, ScrollTrigger, Lenis"),
    toolkitRow("Design and prototyping", "Figma, code prototypes, type"),
    toolkitRow("Delivery", "Git, GitHub Pages, static-first builds"),
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="section about-facts" aria-labelledby="facts-title">',
    '    <div class="container">',
    '      <div class="section-head" data-reveal>',
    "        <div>",
    '          <p class="eyebrow">04 / The practical bits</p>',
    '          <h2 class="section-head__title" id="facts-title">A small studio with a <em>long reach.</em></h2>',
    "        </div>",
    '        <div class="section-head__aside"><p>Based in South Africa, working with people everywhere. The time zone is UTC+2, the internet is always on, and the kettle is usually warm.</p></div>',
    "      </div>",
    '      <div class="about-facts__grid" data-reveal-group>',
    aboutFact("Based in", "South Africa", "SAST / UTC+2"),
    aboutFact("Working", "Remote worldwide", "Async-friendly"),
    aboutFact("Focus", "3D, Web3D, Web", "Design + build"),
    aboutFact("Status", "Open for select projects", "A small number at a time"),
    aboutFact("Contact", "X @fnpsi_", "Fastest route"),
    aboutFact("Studio", "Function Psi", "Independent practice"),
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="section now" aria-labelledby="about-now-title">',
    '    <div class="container now__grid">',
    "      <div>",
    '        <p class="eyebrow">05 / Next</p>',
    '        <h2 id="about-now-title">Bring me the <em>strange one.</em></h2>',
    "      </div>",
    '      <div class="now__aside">',
    "        <p>I'm always interested in a good brief, a strange constraint, or a project that does not have a reference yet. The fastest way to reach me is X.</p>",
    '        <a class="btn" href="' + social.x + '" target="_blank" rel="noopener noreferrer" data-magnetic="0.14"><span>Say hello on X</span><span aria-hidden="true">↗</span></a>',
    '        <p class="mono" style="color:var(--quiet);font-size:.6rem;">@fnpsi_ / replies usually within 48 hours</p>',
    "      </div>",
    "    </div>",
    "  </section>",
    "</main>"
  ].join("\n");
}

function aboutPage() {
  return page({
    title: "About — Rendani Manugeni / Function Psi",
    description:
      "Meet Rendani Manugeni, the South African creative developer behind Function Psi. The practice, principles, toolkit, and the work between 3D, Web3D, and the web.",
    canonical: "/about.html",
    imageAlt: "About Rendani Manugeni — Function Psi.",
    bodyClass: "about",
    page: "about",
    styles: ["/css/base.css", "/css/main.css"],
    schema: aboutSchema(),
    content: aboutContent()
  });
}

/* ------------------------------------------------------------------ */
/* Work index                                                         */
/* ------------------------------------------------------------------ */

function filterButton(value, label, count, active) {
  return [
    '<button class="filter' + (active ? " is-active" : "") + '" type="button" data-filter="' + value + '" aria-pressed="' + (active ? "true" : "false") + '">',
    label + " <span>" + count + "</span>",
    "</button>"
  ].join("");
}

function workContent() {
  const cards = projects
    .map(function (project, index) {
      return projectCard(project, index, { workPage: true });
    })
    .join("\n");

  return [
    '<main id="main" tabindex="-1">',
    '  <section class="work-hero" aria-labelledby="work-title">',
    '    <div class="container">',
    '      <p class="eyebrow">Work / 2024—2026</p>',
    '      <h1 id="work-title">Six projects.<br><em>Zero filler.</em></h1>',
    '      <div class="work-hero__foot">',
    '        <p class="work-hero__lede">Self-initiated concepts, tools, and studio-scale experiments across 3D, Web3D, and the web. Every entry is a complete case study with a real point of view.</p>',
    '        <div class="work-hero__stats">',
    "          <div><strong>06</strong>Projects</div>",
    "          <div><strong>03</strong>Disciplines</div>",
    "          <div><strong>02</strong>Years</div>",
    "        </div>",
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="work-index" aria-labelledby="index-title">',
    '    <div class="container">',
    '      <h2 class="eyebrow" id="index-title" style="margin-bottom:1rem;">Index / filter by discipline</h2>',
    '      <div class="work-toolbar">',
    '        <div class="filters" role="group" aria-label="Filter projects">',
    filterButton("all", "All", "06", true),
    filterButton("3d", "3D", "02", false),
    filterButton("web3d", "Web3D", "02", false),
    filterButton("web", "Web", "02", false),
    "        </div>",
    '        <p class="work-count"><strong data-work-count>06</strong> projects shown</p>',
    "      </div>",
    '      <div class="work-grid" data-work-grid>',
    cards,
    "      </div>",
    '      <div class="work-empty" data-work-empty>',
    "        <h2>Nothing in this corner yet.</h2>",
    "        <p>Try another discipline, or view the full index.</p>",
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="recent-work" data-recent-work hidden aria-labelledby="recent-title">',
    '    <div class="container">',
    '      <div class="recent-work__head">',
    "        <div>",
    '          <p class="eyebrow">Optional memory</p>',
    '          <h2 id="recent-title">Recently viewed</h2>',
    "        </div>",
    '        <p class="mono" style="color:var(--quiet);font-size:.58rem;">Stored in this browser only, and only if you accepted optional storage. <button type="button" class="link-arrow" data-cookie-settings style="padding:0;border:0;background:none;color:var(--lime);font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;">Change</button></p>',
    "      </div>",
    '      <div class="recent-work__grid" data-recent-grid></div>',
    "    </div>",
    "  </section>",
    "",
    '  <section aria-labelledby="work-note-title">',
    '    <div class="container work-note">',
    "      <div>",
    '        <p class="eyebrow">A note on the work</p>',
    '        <h2 id="work-note-title">Not a portfolio of <em>screenshots.</em></h2>',
    "      </div>",
    "      <div>",
    "        <p>Each project page explains the brief, the build, and the decisions that shaped it. If you want the short version, start with the work. If you want the full version, read the case study. The code is static, the motion is intentional, and every page is a complete study rather than a mockup.</p>",
    "        <p style=\"margin-top:1rem;\">These are self-initiated concepts unless a project says otherwise. Any brands, products, or metrics are fictional and used to make the design problem concrete.</p>",
    "      </div>",
    "    </div>",
    "  </section>",
    "</main>"
  ].join("\n");
}

function workPage() {
  return page({
    title: "Work — Function Psi",
    description:
      "Selected 3D, Web3D, and web projects by Rendani Manugeni. Six self-initiated concepts, six case studies, zero filler.",
    canonical: "/work/",
    imageAlt: "Function Psi work index — six projects across 3D, Web3D, and web.",
    bodyClass: "work",
    page: "work",
    styles: ["/css/base.css", "/css/main.css", "/css/work.css"],
    loader: true,
    schema: workSchema(),
    content: workContent(),
    scripts: '<script src="/js/work.js"></script>'
  });
}

/* ------------------------------------------------------------------ */
/* Case studies                                                       */
/* ------------------------------------------------------------------ */

function caseParagraphs(paragraphs) {
  return paragraphs
    .map(function (paragraph) {
      return "        <p>" + paragraph + "</p>";
    })
    .join("\n");
}

function caseMetaItem(label, value) {
  return [
    '        <div class="case-meta__item">',
    '          <p class="case-meta__label">' + label + "</p>",
    '          <p class="case-meta__value">' + value + "</p>",
    "        </div>"
  ].join("\n");
}

function caseContent(project, index) {
  const number = String(index + 1).padStart(2, "0");
  const next = projects[(index + 1) % projects.length];

  return [
    '<div class="case-progress" aria-hidden="true"><span data-case-progress></span></div>',
    '<main id="main" tabindex="-1">',
    '  <article data-case-article>',
    '    <header class="case-hero" aria-labelledby="case-title">',
    '      <div class="container">',
    '        <nav class="case-breadcrumb" aria-label="Breadcrumb">',
    '          <a href="/">Home</a><span aria-hidden="true">/</span><a href="/work/">Work</a><span aria-hidden="true">/</span><span aria-current="page">' + project.title + "</span>",
    "        </nav>",
    '        <div class="case-hero__head">',
    "          <div>",
    '            <p class="eyebrow">Project ' + number + " / " + project.categoryLabel + " / " + project.year + "</p>",
    '            <h1 id="case-title">' + project.titleHtml + "</h1>",
    "          </div>",
    '          <p class="case-hero__summary"><strong>' + project.status + "</strong>" + project.summary + "</p>",
    "        </div>",
    '        <figure class="case-cover">',
    '          <img src="/assets/work/' + project.cover + '" alt="' + escapeAttr(project.coverAlt) + '" width="' + project.cardImageWidth + '" height="' + project.cardImageHeight + '" fetchpriority="high" decoding="async">',
    '          <figcaption class="case-cover__label">' + project.title + " / " + project.categoryLabel + " / " + project.year + "</figcaption>",
    "        </figure>",
    '        <div class="case-meta">',
    caseMetaItem("Role", project.role),
    caseMetaItem("Discipline", project.discipline),
    caseMetaItem("Stack", project.stack),
    caseMetaItem("Status", project.status),
    "        </div>",
    "      </div>",
    "    </header>",
    "",
    '    <div class="case-body">',
    '      <div class="container case-body__grid">',
    '        <aside class="case-aside">',
    '          <p class="case-aside__title">In this study</p>',
    '          <nav class="case-aside__list" data-toc aria-label="Case study sections">',
    '            <a href="#brief">01 / Brief</a>',
    '            <a href="#approach">02 / Approach</a>',
    '            <a href="#build">03 / Build</a>',
    '            <a href="#outcome">04 / Outcome</a>',
    "          </nav>",
    '          <p class="case-aside__note">Self-initiated concept / ' + project.year + ". Any brands, products, or metrics on this page are fictional and used to make the design problem concrete.</p>",
    "        </aside>",
    '        <div class="case-content">',
    '          <section class="case-section" id="brief">',
    '            <p class="case-section__eyebrow">01 / Brief</p>',
    "            <h2>" + project.briefTitle + "</h2>",
    '            <div class="case-prose">',
    caseParagraphs(project.brief),
    "            </div>",
    "          </section>",
    "",
    '          <section class="case-section" id="approach">',
    '            <p class="case-section__eyebrow">02 / Approach</p>',
    "            <h2>" + project.approachTitle + "</h2>",
    '            <div class="case-prose">',
    caseParagraphs(project.approach),
    "            </div>",
    '            <p class="case-quote">“' + project.quote + '”</p>',
    "          </section>",
    "",
    '          <section class="case-section" id="build">',
    '            <p class="case-section__eyebrow">03 / Build</p>',
    "            <h2>" + project.buildTitle + "</h2>",
    '            <div class="case-prose">',
    caseParagraphs(project.build),
    "            </div>",
    '            <ul class="case-list">',
    project.buildList
      .map(function (item, itemIndex) {
        return '              <li><span>' + String(itemIndex + 1).padStart(2, "0") + "</span>" + item + "</li>";
      })
      .join("\n"),
    "            </ul>",
    artifact(project.artifact, "01"),
    '            <div class="case-gallery" aria-label="Project details">',
    artifact(project.gallery[0], "02"),
    artifact(project.gallery[1], "03"),
    "            </div>",
    "          </section>",
    "",
    '          <section class="case-section" id="outcome">',
    '            <p class="case-section__eyebrow">04 / Outcome</p>',
    "            <h2>What it leaves behind.</h2>",
    '            <div class="case-outcome">',
    project.outcomes
      .map(function (item) {
        return '              <div class="case-outcome__item"><span>' + item[0] + "</span><strong>" + item[1] + "</strong></div>";
      })
      .join("\n"),
    "            </div>",
    project.outcomeNote ? '            <p class="case-outcome__note">' + project.outcomeNote + "</p>" : "",
    "          </section>",
    "        </div>",
    "      </div>",
    "    </div>",
    "  </article>",
    "",
    '  <a class="case-next" href="/work/' + next.slug + '.html" aria-label="Next project: ' + escapeAttr(next.title) + '">',
    '    <div class="container">',
    '      <div class="case-next__head"><span>Next project / ' + next.categoryLabel + '</span><span aria-hidden="true">↗</span></div>',
    '      <h2 class="case-next__title">' + next.titleHtml + "</h2>",
    '      <p class="case-next__meta"><span>' + next.year + "</span><span>" + next.discipline + "</span><span>" + next.role + "</span></p>",
    "    </div>",
    "  </a>",
    "</main>"
  ].join("\n");
}

function casePage(project, index) {
  return page({
    title: project.title + " — Function Psi",
    description: project.summary,
    canonical: "/work/" + project.slug + ".html",
    ogType: "article",
    imageAlt: project.coverAlt,
    bodyClass: project.theme,
    page: "work",
    styles: ["/css/base.css", "/css/case-study.css"],
    project: project.slug,
    schema: caseSchema(project),
    content: caseContent(project, index),
    scripts: '<script src="/js/case-study.js"></script>'
  });
}

/* ------------------------------------------------------------------ */
/* Privacy                                                            */
/* ------------------------------------------------------------------ */

function privacyContent() {
  return [
    '<main id="main" tabindex="-1">',
    '  <section class="legal-hero" aria-labelledby="privacy-title">',
    '    <div class="container">',
    '      <p class="eyebrow">Legal / Privacy</p>',
    '      <h1 id="privacy-title">Privacy, <em>plainly.</em></h1>',
    '      <div class="legal-hero__meta">',
    "        <span>Effective " + EFFECTIVE + "</span>",
    "        <span>Version 1.0</span>",
    "        <span>Rendani Manugeni / Function Psi</span>",
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="legal-body">',
    '    <div class="container legal-layout">',
    '      <aside class="legal-toc" data-toc>',
    '        <p class="legal-toc__title">On this page</p>',
    '        <nav aria-label="Privacy policy sections">',
    '          <a href="#who">1. Who this policy is from</a>',
    '          <a href="#summary">2. The short version</a>',
    '          <a href="#cookies">3. What this site stores</a>',
    '          <a href="#third-parties">4. Third-party services</a>',
    '          <a href="#bases">5. Why I process information</a>',
    '          <a href="#sharing">6. Sharing</a>',
    '          <a href="#transfers">7. International transfers</a>',
    '          <a href="#retention">8. Retention</a>',
    '          <a href="#security">9. Security</a>',
    '          <a href="#rights">10. Your rights</a>',
    '          <a href="#children">11. Children</a>',
    '          <a href="#links">12. External links</a>',
    '          <a href="#changes">13. Changes</a>',
    '          <a href="#contact">14. Contact</a>',
    "        </nav>",
    '        <p class="legal-toc__note">This policy describes the site as built: static, minimal, and without advertising or analytics cookies.</p>',
    "      </aside>",
    "",
    '      <div class="legal-prose">',
    '        <section id="who">',
    "          <h2>1. Who this policy is from</h2>",
    "          <p>This site is operated by <strong>Rendani Manugeni</strong>, an independent creative developer based in South Africa, trading as <strong>Function Psi</strong> (“I”, “me”, “my”). I am the responsible party for the purposes of South Africa’s Protection of Personal Information Act, 2013 (<strong>POPIA</strong>), and the controller for the purposes of the EU and UK General Data Protection Regulation (<strong>GDPR</strong>) where it applies.</p>",
    "          <p>This policy covers <strong>fnpsi.env.pm</strong> and the site’s <strong>fnpsi.github.io</strong> address. It does not cover the social platforms I link to, or any third-party site you reach from here.</p>",
    "          <p>You can contact me about privacy at <a href=\"" + social.x + "\" target=\"_blank\" rel=\"noopener noreferrer\">X / @fnpsi_</a> or through <a href=\"" + social.github + "\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub / fnpsi</a>.</p>",
    "        </section>",
    "",
    '        <section id="summary">',
    "          <h2>2. The short version</h2>",
    "          <ul>",
    "            <li>There are no accounts, no contact form, no newsletter, no advertising cookies, and no third-party analytics on this site.</li>",
    "            <li>The site stores your cookie choice in your browser. If you accept optional storage, it also remembers the last three project pages you viewed so they can appear on the Work page.</li>",
    "            <li>Fonts and code libraries are loaded from Google Fonts and jsDelivr. Those providers receive your IP address and standard request information when your browser fetches those files.</li>",
    "            <li>GitHub Pages hosts the site and processes standard server logs. I do not receive a visitor-level analytics report from GitHub Pages.</li>",
    "            <li>You can change or withdraw your choice at any time using <strong>Cookie settings</strong> in the footer.</li>",
    "          </ul>",
    "          <p class=\"legal-note\"><strong>No sale, no profiling.</strong> I do not sell personal information, rent it, or use it for automated decision-making or behavioural advertising.</p>",
    "        </section>",
    "",
    '        <section id="cookies">',
    "          <h2>3. What this site stores on your device</h2>",
    "          <p>The site itself does not set cookies. It uses <strong>local storage</strong>, which is a browser storage mechanism. Local storage is not a cookie, but it is treated with the same care because it can persist between visits.</p>",
    '          <table class="legal-table">',
    "            <thead><tr><th>Name</th><th>Type</th><th>Purpose</th><th>Duration</th><th>Required</th></tr></thead>",
    "            <tbody>",
    "              <tr><td><code>fnpsi-consent-v1</code></td><td>Local storage</td><td>Remembers your cookie choice and the time you made it.</td><td>Until you clear it.</td><td>Yes</td></tr>",
    "              <tr><td><code>fnpsi-recent-work-v1</code></td><td>Local storage</td><td>Stores the last three project pages you viewed, so the Work page can show a “Recently viewed” section.</td><td>Until you clear it, or choose “Essential only”.</td><td>No</td></tr>",
    "            </tbody>",
    "          </table>",
    "          <p>The consent record is strictly necessary to remember and respect your choice. The recent-project memory is optional and is only written if you choose <strong>Accept all</strong>. Choosing <strong>Essential only</strong> removes any recent-project data and prevents it from being written again.</p>",
    "          <p>You can clear local storage through your browser settings at any time. Clearing it will make the consent banner appear again on your next visit, because the site will no longer have a record of your choice.</p>",
    "        </section>",
    "",
    '        <section id="third-parties">',
    "          <h2>4. Third-party services</h2>",
    "          <p>The site is static, but it loads a small number of files from third-party networks. When your browser requests those files, the provider receives your IP address and standard request information such as your user agent, the page you came from, and the time of the request.</p>",
    "          <ul>",
    "            <li><strong>Google Fonts</strong> (<code>fonts.googleapis.com</code> and <code>fonts.gstatic.com</code>) supplies the typefaces. Google’s privacy policy explains its processing: <a href=\"https://policies.google.com/privacy\" target=\"_blank\" rel=\"noopener noreferrer\">policies.google.com/privacy</a>.</li>",
    "            <li><strong>jsDelivr</strong> (<code>cdn.jsdelivr.net</code>) supplies the Three.js, GSAP, ScrollTrigger, and Lenis files. jsDelivr’s privacy information is available at <a href=\"https://www.jsdelivr.com/privacy-policy-jsdelivr-net\" target=\"_blank\" rel=\"noopener noreferrer\">jsdelivr.com/privacy-policy-jsdelivr-net</a>.</li>",
    "            <li><strong>GitHub Pages</strong> (GitHub, Inc.) hosts and serves the site. GitHub processes standard server logs, including IP addresses, requested paths, and timestamps, for security and abuse prevention. GitHub’s privacy statement is at <a href=\"https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement\" target=\"_blank\" rel=\"noopener noreferrer\">docs.github.com</a>.</li>",
    "          </ul>",
    "          <p>There are no embedded social feeds, tracking pixels, advertising networks, or third-party analytics scripts on this site. Social links are ordinary links: the platform only receives information about you if you click through and visit it.</p>",
    "        </section>",
    "",
    '        <section id="bases">',
    "          <h2>5. Why I process information</h2>",
    "          <p>Where POPIA applies, I rely on the following grounds:</p>",
    "          <ul>",
    "            <li><strong>Consent</strong> for the optional recent-project memory, and for any communication you choose to send me through a social platform.</li>",
    "            <li><strong>Legitimate interests</strong> in keeping the site secure, responding to messages, and understanding whether the site is working. These interests are balanced against your rights and expectations.</li>",
    "            <li><strong>Legal obligation</strong> where I am required to process or retain information by law.</li>",
    "            <li><strong>Contract</strong> where processing is necessary to discuss or deliver work you have asked me to do.</li>",
    "          </ul>",
    "          <p>Where GDPR applies, the corresponding legal bases are consent (Article 6(1)(a)), legitimate interests (Article 6(1)(f)), legal obligation (Article 6(1)(c)), and contract (Article 6(1)(b)). I do not carry out automated decision-making or profiling that produces legal or similarly significant effects.</p>",
    "        </section>",
    "",
    '        <section id="sharing">',
    "          <h2>6. Sharing</h2>",
    "          <p>I do not sell, rent, or trade personal information. I share information only in these limited situations:</p>",
    "          <ul>",
    "            <li>With the service providers described above, to the extent they process information as part of delivering the site.</li>",
    "            <li>With professional advisers such as accountants or lawyers, where necessary and under confidentiality obligations.</li>",
    "            <li>With authorities, regulators, or courts where required by law, or to establish, exercise, or defend legal claims.</li>",
    "            <li>With a successor if the practice is transferred, merged, or sold, subject to this policy continuing to apply to existing information.</li>",
    "          </ul>",
    "          <p>The recent-project list stays in your browser. It is never sent to me or to a third party by this site.</p>",
    "        </section>",
    "",
    '        <section id="transfers">',
    "          <h2>7. International transfers</h2>",
    "          <p>I am based in South Africa. Google, jsDelivr, and GitHub may process information in the United States, the European Union, or other countries where they operate. Where POPIA applies, I take reasonable steps to ensure that transfers are lawful and that recipients are subject to laws or binding agreements that provide an adequate level of protection. Where GDPR applies, transfers rely on appropriate safeguards such as standard contractual clauses or an adequacy decision, as applicable to the provider.</p>",
    "        </section>",
    "",
    '        <section id="retention">',
    "          <h2>8. Retention</h2>",
    "          <ul>",
    "            <li><strong>Consent record:</strong> kept in your browser until you clear it or change it.</li>",
    "            <li><strong>Recent projects:</strong> kept in your browser until you clear it, choose “Essential only”, or view enough projects for older entries to be replaced.</li>",
    "            <li><strong>Messages:</strong> kept for as long as needed to respond and, if we work together, for as long as necessary to manage the project and meet legal or accounting obligations. Messages that do not lead to work are deleted when they are no longer useful.</li>",
    "            <li><strong>Hosting logs:</strong> controlled by GitHub under its own retention practices. I do not have access to raw visitor logs through GitHub Pages.</li>",
    "          </ul>",
    "        </section>",
    "",
    '        <section id="security">',
    "          <h2>9. Security</h2>",
    "          <p>The site is served over HTTPS through GitHub Pages. It has no server-side database, no login system, and no payment processing. I keep the amount of information the site handles to a minimum, which reduces risk. No method of transmission or storage is completely secure, so I cannot promise absolute security. If you believe you have found a vulnerability, please report it through the process in the repository’s <a href=\"" + social.github + "/fnpsi.github.io/security\" target=\"_blank\" rel=\"noopener noreferrer\">security policy</a> or send a private message on X.</p>",
    "        </section>",
    "",
    '        <section id="rights">',
    "          <h2>10. Your rights</h2>",
    "          <p>Depending on where you live, you may have some or all of the following rights:</p>",
    "          <ul>",
    "            <li><strong>Access</strong> the personal information I hold about you.</li>",
    "            <li><strong>Correct</strong> information that is inaccurate, incomplete, or misleading.</li>",
    "            <li><strong>Delete</strong> information that I am not required to keep.</li>",
    "            <li><strong>Object</strong> to processing based on legitimate interests.</li>",
    "            <li><strong>Restrict</strong> or <strong>port</strong> information, where GDPR applies.</li>",
    "            <li><strong>Withdraw consent</strong> at any time, without affecting processing that happened before withdrawal.</li>",
    "            <li><strong>Complain</strong> to a supervisory authority.</li>",
    "          </ul>",
    "          <p>To exercise a right, contact me on X or GitHub. I may ask for enough information to verify that the request is genuine. I aim to respond within 30 days. Because the site does not identify visitors, I may not be able to locate any information about you beyond a message you have sent me.</p>",
    "          <p>In South Africa, you can complain to the Information Regulator at <a href=\"https://inforegulator.org.za\" target=\"_blank\" rel=\"noopener noreferrer\">inforegulator.org.za</a>. In the EU or UK, you can complain to your local supervisory authority.</p>",
    "        </section>",
    "",
    '        <section id="children">',
    "          <h2>11. Children</h2>",
    "          <p>This site is a professional portfolio and is not directed at children. I do not knowingly collect personal information from children under 13 (or under 16 where local law sets a higher age of digital consent). If you believe a child has sent me personal information, contact me and I will delete it.</p>",
    "        </section>",
    "",
    '        <section id="links">',
    "          <h2>12. External links</h2>",
    "          <p>The site links to X, Instagram, GitHub, YouTube, and the websites of libraries and providers. Those sites have their own privacy policies and cookies. I am not responsible for their content or processing. Visiting them is your choice, and it happens outside this site.</p>",
    "        </section>",
    "",
    '        <section id="changes">',
    "          <h2>13. Changes</h2>",
    "          <p>I may update this policy when the site changes or when the law requires it. The effective date and version at the top of the page will change, and material updates will be described here. If the site adds analytics, embeds, a contact form, or any other feature that changes how information is handled, this policy will be updated before that feature goes live.</p>",
    "        </section>",
    "",
    '        <section id="contact">',
    "          <h2>14. Contact</h2>",
    "          <p>Questions, requests, or complaints about privacy can be sent to <strong>Rendani Manugeni / Function Psi</strong> via <a href=\"" + social.x + "\" target=\"_blank\" rel=\"noopener noreferrer\">X / @fnpsi_</a> or <a href=\"" + social.github + "\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub / fnpsi</a>. I aim to respond within 30 days.</p>",
    "        </section>",
    "",
    '        <div class="legal-copyright">',
    "          <p>© " + YEAR + " Rendani Manugeni. All rights reserved.</p>",
    '          <p><a href="/privacy.html">Privacy</a> / <a href="/terms.html">Terms</a></p>',
    "        </div>",
    "      </div>",
    "    </div>",
    "  </section>",
    "</main>"
  ].join("\n");
}

function privacyPage() {
  return page({
    title: "Privacy Policy — Function Psi",
    description:
      "How Rendani Manugeni and Function Psi handle information on fnpsi.env.pm: local storage, cookie choices, third-party services, and your rights.",
    canonical: "/privacy.html",
    imageAlt: "Function Psi privacy policy.",
    bodyClass: "legal",
    page: "legal",
    styles: ["/css/base.css", "/css/legal.css"],
    schema: legalSchema(
      "Privacy Policy",
      "How Rendani Manugeni and Function Psi handle information on fnpsi.env.pm.",
      "/privacy.html"
    ),
    content: privacyContent()
  });
}

/* ------------------------------------------------------------------ */
/* Terms                                                              */
/* ------------------------------------------------------------------ */

function termsContent() {
  return [
    '<main id="main" tabindex="-1">',
    '  <section class="legal-hero" aria-labelledby="terms-title">',
    '    <div class="container">',
    '      <p class="eyebrow">Legal / Terms</p>',
    '      <h1 id="terms-title">Terms, <em>without the fog.</em></h1>',
    '      <div class="legal-hero__meta">',
    "        <span>Effective " + EFFECTIVE + "</span>",
    "        <span>Version 1.0</span>",
    "        <span>Rendani Manugeni / Function Psi</span>",
    "      </div>",
    "    </div>",
    "  </section>",
    "",
    '  <section class="legal-body">',
    '    <div class="container legal-layout">',
    '      <aside class="legal-toc" data-toc>',
    '        <p class="legal-toc__title">On this page</p>',
    '        <nav aria-label="Terms of use sections">',
    '          <a href="#agreement">1. Agreement</a>',
    '          <a href="#who">2. Who I am</a>',
    '          <a href="#use">3. Using the site</a>',
    '          <a href="#showcase">4. Showcase content</a>',
    '          <a href="#ip">5. Intellectual property</a>',
    '          <a href="#warranties">6. No warranties</a>',
    '          <a href="#liability">7. Limitation of liability</a>',
    '          <a href="#indemnity">8. Indemnity</a>',
    '          <a href="#links">9. Third-party links</a>',
    '          <a href="#privacy">10. Privacy</a>',
    '          <a href="#changes">11. Changes</a>',
    '          <a href="#law">12. Governing law</a>',
    '          <a href="#severability">13. Severability</a>',
    '          <a href="#contact">14. Contact</a>',
    "        </nav>",
    '        <p class="legal-toc__note">Short version: look, link, and enjoy the work. Do not copy it, scrape it, or pretend it is yours.</p>',
    "      </aside>",
    "",
    '      <div class="legal-prose">',
    '        <section id="agreement">',
    "          <h2>1. Agreement</h2>",
    "          <p>These Terms of Use (“Terms”) govern your access to and use of <strong>fnpsi.env.pm</strong> and the site’s <strong>fnpsi.github.io</strong> address (together, the “Site”). By accessing or using the Site, you agree to these Terms. If you do not agree, please do not use the Site.</p>",
    "          <p>These Terms apply to everyone who visits the Site, whether or not you interact with anything on it.</p>",
    "        </section>",
    "",
    '        <section id="who">',
    "          <h2>2. Who I am</h2>",
    "          <p>The Site is operated by <strong>Rendani Manugeni</strong>, an independent creative developer based in South Africa, trading as <strong>Function Psi</strong> (“I”, “me”, “my”). References to “you” mean the person visiting the Site.</p>",
    "        </section>",
    "",
    '        <section id="use">',
    "          <h2>3. Using the site</h2>",
    "          <p>You may use the Site for personal, lawful purposes. You agree not to:</p>",
    "          <ul>",
    "            <li>interfere with the Site’s operation, security, or availability;</li>",
    "            <li>attempt to gain unauthorized access to any system, network, or data;</li>",
    "            <li>introduce malware, viruses, or any harmful code;</li>",
    "            <li>scrape, crawl, or harvest the Site at a scale that places an unreasonable load on it, or use automated means to copy its content without permission;</li>",
    "            <li>remove or obscure copyright, attribution, or other proprietary notices; or</li>",
    "            <li>use the Site in a way that violates applicable law or the rights of another person.</li>",
    "          </ul>",
    "          <p>You may link to the Site and quote short excerpts with clear attribution, but you may not present the work as your own. The Site is provided free of charge and without any guarantee of uninterrupted availability.</p>",
    "        </section>",
    "",
    '        <section id="showcase">',
    "          <h2>4. Showcase content</h2>",
    "          <p>The projects on this Site are primarily <strong>self-initiated concepts, studies, and demonstrations</strong>. Unless a project page explicitly says otherwise, any brands, products, clients, metrics, testimonials, launch dates, or commercial results shown are fictional or illustrative. They are used to make a design problem concrete, not to describe a real commercial relationship or endorsement.</p>",
    "          <p>Where a project references a real tool, library, or platform, that tool remains the property of its respective owner. Nothing on the Site is an offer, a quote, a promise of results, or professional advice. If you want to discuss real work, contact me directly.</p>",
    "        </section>",
    "",
    '        <section id="ip">',
    "          <h2>5. Intellectual property</h2>",
    "          <p>Unless otherwise stated, all content on the Site — including text, code, layout, graphics, illustrations, 3D scenes, motion design, and the Function Psi name and marks — is owned by or licensed to <strong>Rendani Manugeni</strong> and is protected by copyright and other intellectual property laws.</p>",
    "          <p><strong>© " + YEAR + " Rendani Manugeni. All rights reserved.</strong></p>",
    "          <p>You are granted a limited, revocable, non-exclusive licence to view the Site and to make temporary copies that your browser makes in the ordinary course of displaying it. You may not reproduce, distribute, modify, publicly display, create derivative works from, or commercially exploit the content without my prior written permission, except where applicable law expressly permits it.</p>",
    "          <p>You may not scrape or reproduce the Site’s content to train machine-learning models without prior written permission, except where applicable law permits such use. If you are unsure whether a use is allowed, ask first.</p>",
    "          <p>Third-party libraries and typefaces used on the Site remain subject to their own licences, including Three.js, GSAP, Lenis, and Google Fonts. Third-party names and marks belong to their respective owners. If you believe content on the Site infringes your rights, contact me and I will investigate promptly.</p>",
    "        </section>",
    "",
    '        <section id="warranties">',
    "          <h2>6. No warranties</h2>",
    "          <p>The Site is provided <strong>“as is”</strong> and <strong>“as available”</strong>. To the maximum extent permitted by law, I make no warranties or representations of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy, availability, or non-infringement. I do not warrant that the Site will be error-free, secure, uninterrupted, or free of viruses or other harmful components, or that any information on it is complete or current.</p>",
    "          <p>Nothing on the Site constitutes professional, legal, financial, or technical advice. You use the Site at your own risk.</p>",
    "        </section>",
    "",
    '        <section id="liability">',
    "          <h2>7. Limitation of liability</h2>",
    "          <p>To the maximum extent permitted by law, I will not be liable for any indirect, incidental, special, consequential, or punitive loss or damage, or for any loss of data, profits, revenue, goodwill, or business opportunity, arising out of or in connection with your use of, or inability to use, the Site.</p>",
    "          <p>Where liability cannot be excluded, my total aggregate liability arising out of or in connection with the Site will not exceed <strong>ZAR 100</strong> or the amount you paid to use the Site, whichever is greater. Nothing in these Terms limits liability for fraud, wilful misconduct, death or personal injury caused by negligence, or any other liability that cannot lawfully be limited.</p>",
    "        </section>",
    "",
    '        <section id="indemnity">',
    "          <h2>8. Indemnity</h2>",
    "          <p>To the extent permitted by law, you agree to indemnify and hold harmless Rendani Manugeni and Function Psi from any claims, losses, liabilities, damages, costs, and reasonable legal fees arising out of your misuse of the Site, your breach of these Terms, or your violation of the rights of another person.</p>",
    "        </section>",
    "",
    '        <section id="links">',
    "          <h2>9. Third-party links</h2>",
    "          <p>The Site contains links to X, Instagram, GitHub, YouTube, and other third-party websites. Those links are provided for convenience. I do not control those sites and am not responsible for their content, availability, security, or privacy practices. Visiting a third-party site is at your own risk, and its terms and policies apply.</p>",
    "        </section>",
    "",
    '        <section id="privacy">',
    "          <h2>10. Privacy</h2>",
    "          <p>The <a href=\"/privacy.html\">Privacy Policy</a> explains how information is handled on the Site. It forms part of these Terms and is incorporated by reference.</p>",
    "        </section>",
    "",
    '        <section id="changes">',
    "          <h2>11. Changes</h2>",
    "          <p>I may update these Terms from time to time. The effective date and version at the top of the page will change, and the current version will always be available here. If the changes are material, I will make that clear on the page. Continued use of the Site after a change means you accept the updated Terms.</p>",
    "        </section>",
    "",
    '        <section id="law">',
    "          <h2>12. Governing law</h2>",
    "          <p>These Terms are governed by the laws of the Republic of South Africa. Subject to any mandatory consumer protections that apply in your country, the courts of South Africa have jurisdiction over any dispute arising out of or in connection with the Site or these Terms.</p>",
    "        </section>",
    "",
    '        <section id="severability">',
    "          <h2>13. Severability</h2>",
    "          <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable, that provision will be severed or limited to the minimum extent necessary, and the remaining provisions will continue in full force. These Terms, together with the Privacy Policy, are the entire agreement between you and me regarding use of the Site.</p>",
    "        </section>",
    "",
    '        <section id="contact">',
    "          <h2>14. Contact</h2>",
    "          <p>Questions about these Terms can be sent to <strong>Rendani Manugeni / Function Psi</strong> via <a href=\"" + social.x + "\" target=\"_blank\" rel=\"noopener noreferrer\">X / @fnpsi_</a> or <a href=\"" + social.github + "\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub / fnpsi</a>.</p>",
    "        </section>",
    "",
    '        <div class="legal-copyright">',
    "          <p>© " + YEAR + " Rendani Manugeni. All rights reserved.</p>",
    '          <p><a href="/privacy.html">Privacy</a> / <a href="/terms.html">Terms</a></p>',
    "        </div>",
    "      </div>",
    "    </div>",
    "  </section>",
    "</main>"
  ].join("\n");
}

function termsPage() {
  return page({
    title: "Terms of Use — Function Psi",
    description:
      "The terms that govern use of Rendani Manugeni’s Function Psi portfolio: permitted use, intellectual property, disclaimers, and governing law.",
    canonical: "/terms.html",
    imageAlt: "Function Psi terms of use.",
    bodyClass: "legal",
    page: "legal",
    styles: ["/css/base.css", "/css/legal.css"],
    schema: legalSchema(
      "Terms of Use",
      "The terms that govern use of Rendani Manugeni’s Function Psi portfolio.",
      "/terms.html"
    ),
    content: termsContent()
  });
}

/* ------------------------------------------------------------------ */
/* 404                                                                */
/* ------------------------------------------------------------------ */

function notFoundContent() {
  return [
    '<main id="main" tabindex="-1">',
    '  <section class="not-found" aria-labelledby="not-found-title">',
    '    <div class="container not-found__inner">',
    '      <p class="eyebrow">404 / Signal lost</p>',
    '      <h1 id="not-found-title">This page <em>wandered off.</em></h1>',
    "      <p>The link may be old, the project may have moved, or the internet may be having a day. The work is still here, and it is still cool.</p>",
    '      <div class="not-found__actions">',
    '        <a class="btn" href="/"><span>Back to home</span><span aria-hidden="true">↗</span></a>',
    '        <a class="btn btn--ghost" href="/work/"><span>Browse the work</span></a>',
    '        <a class="btn btn--ghost" href="/about.html"><span>About Rendani</span></a>',
    "      </div>",
    "    </div>",
    "  </section>",
    "</main>"
  ].join("\n");
}

function notFoundPage() {
  return page({
    title: "Page not found — Function Psi",
    description:
      "That page is not here. Return to Function Psi, the portfolio of Rendani Manugeni, or browse the work.",
    canonical: "/404.html",
    robots: "noindex, follow",
    imageAlt: "Function Psi — page not found.",
    bodyClass: "not-found-page",
    page: "404",
    styles: ["/css/base.css", "/css/legal.css"],
    content: notFoundContent()
  });
}

/* ------------------------------------------------------------------ */
/* Build                                                              */
/* ------------------------------------------------------------------ */

const pages = [
  { file: "index.html", html: homePage() },
  { file: "about.html", html: aboutPage() },
  { file: "work/index.html", html: workPage() },
  { file: "privacy.html", html: privacyPage() },
  { file: "terms.html", html: termsPage() },
  { file: "404.html", html: notFoundPage() }
];

projects.forEach(function (project, index) {
  pages.push({
    file: "work/" + project.slug + ".html",
    html: casePage(project, index)
  });
});

pages.forEach(function (entry) {
  const destination = path.join(root, entry.file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, entry.html, "utf8");
  console.log("wrote " + entry.file + " (" + entry.html.length + " bytes)");
});

const sitemapEntries = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  { path: "/work/", priority: "0.9", changefreq: "monthly" },
  { path: "/about.html", priority: "0.8", changefreq: "yearly" },
  { path: "/privacy.html", priority: "0.3", changefreq: "yearly" },
  { path: "/terms.html", priority: "0.3", changefreq: "yearly" }
].concat(
  projects.map(function (project) {
    return {
      path: "/work/" + project.slug + ".html",
      priority: "0.8",
      changefreq: "yearly"
    };
  })
);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]
  .concat(
    sitemapEntries.map(function (entry) {
      return [
        "  <url>",
        "    <loc>" + site.baseUrl + entry.path + "</loc>",
        "    <lastmod>" + YEAR + "-11-03</lastmod>",
        "    <changefreq>" + entry.changefreq + "</changefreq>",
        "    <priority>" + entry.priority + "</priority>",
        "  </url>"
      ].join("\n");
    })
  )
  .concat(["</urlset>", ""])
  .join("\n");

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");
console.log("wrote sitemap.xml");

const manifest = {
  name: "Function Psi — Rendani Manugeni",
  short_name: "Function Psi",
  description: site.tagline,
  start_url: "/",
  display: "standalone",
  background_color: "#08090a",
  theme_color: "#08090a",
  icons: [
    {
      src: "/assets/favicon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any"
    }
  ]
};

fs.writeFileSync(
  path.join(root, "site.webmanifest"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8"
);
console.log("wrote site.webmanifest");

console.log("Built " + pages.length + " pages for " + site.baseUrl);
