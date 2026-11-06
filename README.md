# Function Psi — Rendani Manugeni

The portfolio of **Rendani Manugeni**, a South African creative developer working as **Function Psi**. The site is a static, no-build showcase for 3D, Web3D, and web work — built around a real-time Three.js hero, GSAP scroll choreography, and a small set of complete case studies.

- Live site: [fnpsi.env.pm](https://fnpsi.env.pm)
- GitHub Pages: [fnpsi.github.io](https://fnpsi.github.io)
- Repository: [github.com/fnpsi/fnpsi.github.io](https://github.com/fnpsi/fnpsi.github.io)

**Making digital stuff is so cool.** One of the coolest websites out there.

---

## What is in the box

| Area | Details |
| --- | --- |
| Pages | Home, Work index, six case studies, About, Privacy, Terms, 404 |
| 3D | Three.js 0.170.0 hero with pointer + scroll response, reduced-motion and no-WebGL fallbacks |
| Motion | GSAP 3.13.0 + ScrollTrigger, Lenis 1.3.11 smooth scrolling |
| Portfolio | Category filters for 3D, Web3D, and Web; optional “recently viewed” memory |
| Consent | Persistent local-storage choice, accept-all or essential-only, reset from the footer |
| Accessibility | Skip link, focus management, reduced-motion support, semantic landmarks, visible focus states |
| Hosting | GitHub Pages, static files only, custom domain via `CNAME` |
| Metadata | Canonical URLs, Open Graph, Twitter cards, JSON-LD, sitemap, robots |

## Structure

```text
.
├── index.html                 # Home
├── about.html                 # About Rendani
├── privacy.html               # Privacy Policy
├── terms.html                 # Terms of Use
├── 404.html                   # Not found
├── work/
│   ├── index.html             # Portfolio index + filters
│   ├── aetherium.html
│   ├── kinetic-type-lab.html
│   ├── orbital-atlas.html
│   ├── monolith.html
│   ├── field-notes.html
│   └── signal-garden.html
├── assets/
│   ├── favicon.svg
│   ├── og/og-cover.png        # 1200 × 630 social preview
│   └── work/*.svg             # Project covers
├── components/                # Shared header, footer, consent, cursor, loader
├── css/
│   ├── base.css               # Tokens, layout, header, footer, consent, cursor
│   ├── main.css               # Home + About
│   ├── work.css               # Work index
│   ├── case-study.css         # Project detail pages
│   └── legal.css              # Privacy, Terms, 404
├── js/
│   ├── app.js                 # Navigation, Lenis, reveals, cursor, pinned section
│   ├── hero3d.js              # Three.js hero
│   ├── loader.js              # Loading screen
│   ├── consent.js             # Cookie consent + optional recent projects
│   ├── work.js                # Filters + recent projects
│   └── case-study.js          # Reading progress
├── tools/
│   ├── project-data.js        # All project copy and metadata
│   ├── site-shell.js          # Shared HTML shell + components
│   ├── build-pages.js         # Generates the HTML pages and sitemap
│   ├── serve.js               # Local static server
│   └── og-render.html         # Source for the social preview
├── CNAME                      # fnpsi.env.pm
├── sitemap.xml
├── robots.txt
├── site.webmanifest
└── .nojekyll
```

## Local preview

The site uses root-absolute paths (`/css/...`, `/work/...`), so open it through a local server rather than `file://`.

```bash
node tools/serve.js
```

Then visit [http://localhost:4173](http://localhost:4173). Set `PORT` to use another port:

```bash
PORT=8080 node tools/serve.js
```

Any static server works too:

```bash
npx serve .
```

## Deploying to GitHub Pages

The repository is already structured for GitHub Pages. There is **no build server and no build step** — the HTML files are committed as-is.

1. Push the repository to `github.com/fnpsi/fnpsi.github.io`.
2. In **Settings → Pages**, set **Source** to **Deploy from a branch**.
3. Choose branch **main** and folder **/ (root)**, then save.
4. Wait for the Pages deployment to finish. The site will be available at `https://fnpsi.github.io`.
5. Keep the `CNAME` file in the repository root. It contains:

   ```text
   fnpsi.env.pm
   ```

6. In **Settings → Pages → Custom domain**, confirm `fnpsi.env.pm` and enable **Enforce HTTPS** once the certificate is ready.

### DNS for the custom domain

At the DNS provider for `env.pm`, point the apex domain at GitHub Pages:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `fnpsi.github.io` |

If you prefer `www.fnpsi.env.pm` as the canonical host, set the `CNAME` file to `www.fnpsi.env.pm` and add a redirect from the apex. The current configuration uses the apex domain.

GitHub may ask you to verify the domain with a `TXT` record named `_github-pages-challenge-fnpsi`. Add the value GitHub gives you, then re-check the domain in repository settings.

> **Note:** If the site is ever served from a project subpath instead of a user/organization root, the root-absolute links in the generated HTML would need to become relative. This repository is `fnpsi.github.io`, so it is served from the domain root.

## Editing content

All project copy lives in `tools/project-data.js`. Each project has its card text, summary, role, stack, case-study sections, quote, outcomes, and artwork details.

After editing, regenerate the pages:

```bash
node tools/build-pages.js
```

The generator reads the shared components from `components/` and writes:

- `index.html`
- `about.html`
- `work/index.html`
- `work/*.html` for each project
- `privacy.html`, `terms.html`, `404.html`
- `sitemap.xml`
- `site.webmanifest`

The generated HTML is committed, so visitors and GitHub Pages never run Node.

### Adding a project

1. Add an object to `projects` in `tools/project-data.js`.
2. Add a cover at `assets/work/<slug>.svg` (or update the `cover` field).
3. Run `node tools/build-pages.js`.
4. Update the hard-coded counts in the Work filters if the number of projects changes (`06`, `02`, `02`, `02` in `tools/build-pages.js`).
5. Commit the generated page and cover.

### Updating the social preview

`assets/og/og-cover.png` is generated from `assets/og/og-cover.svg` with headless Chrome:

```bash
chrome --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --screenshot=assets/og/og-cover.png tools/og-render.html
```

On Windows:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --headless=new --disable-gpu --hide-scrollbars `
  --force-device-scale-factor=1 --window-size=1200,630 `
  --screenshot="assets/og/og-cover.png" "tools/og-render.html"
```

## Testing notes

Useful manual checks after a change:

- Load `/` and `/work/` and confirm the loading screen finishes, including with `?webgl=off`.
- Confirm the hero responds to pointer movement and scroll.
- Filter the Work index by 3D, Web3D, and Web; the URL should update with `?category=...`.
- Open a case study, scroll, and confirm the reading-progress line and section navigation.
- Clear local storage, reload, and confirm the consent banner appears. Accept all, visit three projects, and check “Recently viewed” on Work.
- Choose “Essential only” and confirm `fnpsi-recent-work-v1` is removed.
- Use the footer **Cookie settings** button to reopen the banner.
- Enable reduced motion at the OS level and confirm animations are suppressed.
- Check keyboard navigation: skip link, mobile menu, filters, and footer links.
- Check 404 handling with a missing path.
- Confirm every page has the header, footer, privacy, terms, and social links.

## Browser support

Modern evergreen browsers with ES modules, import maps, `IntersectionObserver`, and CSS custom properties. The WebGL hero requires WebGL 2 or WebGL 1; without it, the CSS fallback is shown. The rest of the site is designed to remain usable without JavaScript, though the loading screen and motion layer are hidden.

## Privacy and consent

The site sets no advertising or analytics cookies. It stores:

- `fnpsi-consent-v1` — your consent choice (essential).
- `fnpsi-recent-work-v1` — the last three projects you viewed (optional, only after “Accept all”).

The full details, including third-party font and CDN processing, are in [`privacy.html`](privacy.html). The site’s terms are in [`terms.html`](terms.html).

## Credits

- Design and development: **Rendani Manugeni / Function Psi**
- Typefaces: Instrument Serif, Bricolage Grotesque, DM Mono via Google Fonts
- Libraries: [Three.js](https://threejs.org), [GSAP](https://gsap.com), [Lenis](https://lenis.darkroom.engineering)

## Copyright

© 2026 Rendani Manugeni. All rights reserved. Function Psi is an independent practice. The project concepts on this site are self-initiated and illustrative unless stated otherwise.
