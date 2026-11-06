"use strict";

const fs = require("fs");
const path = require("path");
const { site } = require("./project-data");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8").trim();
}

const components = {
  header: read("components/header.html"),
  footer: read("components/footer.html"),
  cookie: read("components/cookie.html"),
  cursor: read("components/cursor.html"),
  loader: read("components/loader.html")
};

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap";

const VENDOR_SCRIPTS = [
  '<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.min.js"></script>'
].join("\n");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function jsonLd(data) {
  const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
  return '<script type="application/ld+json">\n' + json + "\n</script>";
}

function absoluteUrl(canonicalPath) {
  if (!canonicalPath || canonicalPath === "/") return site.baseUrl + "/";
  return site.baseUrl + (canonicalPath.startsWith("/") ? canonicalPath : "/" + canonicalPath);
}

function head(options) {
  const {
    title,
    description,
    canonical = "/",
    ogType = "website",
    image = "/assets/og/og-cover.png",
    imageAlt = "Function Psi — Making digital stuff is so cool.",
    robots = "index, follow, max-image-preview:large",
    styles = ["/css/base.css"],
    extraHead = "",
    schema = null
  } = options;

  const canonicalUrl = absoluteUrl(canonical);
  const imageUrl = site.baseUrl + image;

  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>" + escapeHtml(title) + "</title>",
    '<meta name="description" content="' + escapeAttr(description) + '">',
    '<link rel="canonical" href="' + canonicalUrl + '">',
    '<meta name="robots" content="' + robots + '">',
    '<meta name="author" content="Rendani Manugeni">',
    '<meta name="theme-color" content="#08090a">',
    '<meta name="color-scheme" content="dark">',
    '<meta name="format-detection" content="telephone=no">',
    '<meta property="og:site_name" content="Function Psi">',
    '<meta property="og:locale" content="en_ZA">',
    '<meta property="og:type" content="' + ogType + '">',
    '<meta property="og:title" content="' + escapeAttr(title) + '">',
    '<meta property="og:description" content="' + escapeAttr(description) + '">',
    '<meta property="og:url" content="' + canonicalUrl + '">',
    '<meta property="og:image" content="' + imageUrl + '">',
    '<meta property="og:image:type" content="image/png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="' + escapeAttr(imageAlt) + '">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:site" content="@fnpsi_">',
    '<meta name="twitter:creator" content="@fnpsi_">',
    '<meta name="twitter:title" content="' + escapeAttr(title) + '">',
    '<meta name="twitter:description" content="' + escapeAttr(description) + '">',
    '<meta name="twitter:image" content="' + imageUrl + '">',
    '<meta name="twitter:image:alt" content="' + escapeAttr(imageAlt) + '">',
    '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
    '<link rel="manifest" href="/site.webmanifest">',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link href="' + FONTS + '" rel="stylesheet">',
    styles
      .map(function (href) {
        return '<link rel="stylesheet" href="' + href + '">';
      })
      .join("\n"),
    extraHead,
    schema ? jsonLd(schema) : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function bodyAttributes({ bodyClass = "", page = "", project = "" }) {
  const attributes = [];
  if (bodyClass) attributes.push('class="' + bodyClass + '"');
  if (page) attributes.push('data-page="' + page + '"');
  if (project) attributes.push('data-project="' + project + '"');
  return attributes.join(" ");
}

function page(options) {
  const {
    title,
    description,
    canonical,
    ogType,
    image,
    imageAlt,
    robots,
    styles,
    extraHead,
    schema,
    bodyClass,
    page: pageName,
    project,
    loader = false,
    content,
    scripts = ""
  } = options;

  const bodyAttrs = bodyAttributes({ bodyClass, page: pageName, project });

  return [
    "<!doctype html>",
    '<html lang="en-ZA" class="no-js">',
    "<head>",
    head({
      title,
      description,
      canonical,
      ogType,
      image,
      imageAlt,
      robots,
      styles,
      extraHead,
      schema
    }),
    '<script>document.documentElement.classList.remove("no-js");</script>',
    "</head>",
    "<body" + (bodyAttrs ? " " + bodyAttrs : "") + ">",
    '<a class="skip-link" href="#main">Skip to content</a>',
    loader ? components.loader : "",
    components.header,
    content,
    components.footer,
    components.cookie,
    components.cursor,
    VENDOR_SCRIPTS,
    loader ? '<script src="/js/loader.js"></script>' : "",
    '<script src="/js/consent.js"></script>',
    '<script src="/js/app.js"></script>',
    scripts,
    "</body>",
    "</html>",
    ""
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function projectCard(project, index, options = {}) {
  const { workPage = false } = options;
  const number = String(index + 1).padStart(2, "0");
  const dataAttributes = workPage
    ? [
        "data-project-card",
        'data-category="' + project.category + '"',
        'data-category-label="' + escapeAttr(project.categoryLabel) + '"',
        'data-slug="' + project.slug + '"',
        'data-title="' + escapeAttr(project.title) + '"'
      ].join(" ")
    : "";

  return [
    '<a class="project-card" href="/work/' + project.slug + '.html" ' + dataAttributes + ' data-cursor-label="View">',
    '  <div class="project-card__media">',
    '    <span class="project-card__index">' + number + "</span>",
    '    <img src="/assets/work/' + project.cover + '" alt="' + escapeAttr(project.coverAlt) + '" width="' + project.cardImageWidth + '" height="' + project.cardImageHeight + '" loading="lazy" decoding="async">',
    "  </div>",
    '  <div class="project-card__body">',
    '    <div class="project-card__topline"><span>' + project.categoryLabel + "</span><span>" + project.year + "</span></div>",
    '    <h3 class="project-card__title"><span>' + project.title + '</span><span class="project-card__arrow" aria-hidden="true">↗</span></h3>',
    '    <p class="project-card__desc">' + project.card + "</p>",
    '    <p class="project-card__foot"><span aria-hidden="true">●</span>' + project.role + "</p>",
    "  </div>",
    "</a>"
  ].join("\n");
}

function artifact(item, figure) {
  return [
    '<div class="case-artifact case-artifact--' + item.type + '">',
    '  <div class="case-artifact__top"><span>' + item.label + "</span><span>" + item.meta + "</span></div>",
    '  <div class="case-artifact__center"><p class="case-artifact__word">' + item.word + "</p></div>",
    '  <div class="case-artifact__bottom"><span>Function Psi</span><span>Fig. ' + figure + "</span></div>",
    "</div>"
  ].join("\n");
}

module.exports = {
  root,
  components,
  head,
  page,
  projectCard,
  artifact,
  escapeHtml,
  escapeAttr,
  jsonLd,
  absoluteUrl,
  VENDOR_SCRIPTS
};
