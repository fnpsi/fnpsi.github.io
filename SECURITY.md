# Security Policy

## Supported versions

This repository is a static website. There are no versioned releases or long-term support branches. Security fixes are applied to the latest commit on `main`, which is the version deployed to [fnpsi.env.pm](https://fnpsi.env.pm) and [fnpsi.github.io](https://fnpsi.github.io).

| Version | Supported |
| --- | --- |
| Latest `main` | Yes |
| Older commits / tags | No |

## Reporting a vulnerability

Please **do not open a public issue** for a security problem. Report it privately through one of these routes:

1. **GitHub Security Advisories** — use the **Report a vulnerability** button at [github.com/fnpsi/fnpsi.github.io/security/advisories/new](https://github.com/fnpsi/fnpsi.github.io/security/advisories/new).
2. **X** — send a direct message to [@fnpsi_](https://x.com/fnpsi_) if you cannot use GitHub.

Include as much of the following as you can:

- A clear description of the issue and its potential impact.
- The URL, page, or file affected.
- Steps to reproduce, including browser and device details.
- Any proof-of-concept code or screenshots (please avoid including real personal data).
- Whether you would like to be credited, and the name or handle to use.

## What to expect

- I aim to acknowledge reports within **5 business days**.
- I will confirm whether the issue is in scope, ask for any missing details, and keep you updated on the fix.
- If the report is valid, I will fix it on `main`, deploy the fix, and credit you if you want credit.
- Please give me a reasonable opportunity to fix the issue before disclosing it publicly.

## Scope

In scope:

- The static site at `fnpsi.env.pm` and `fnpsi.github.io`.
- The HTML, CSS, JavaScript, and assets in this repository.
- Client-side issues such as DOM-based XSS, unsafe `innerHTML`, consent or storage handling, and link handling.

Out of scope:

- Third-party services and CDNs (GitHub Pages, Google Fonts, jsDelivr, Three.js, GSAP, Lenis). Report those to the provider.
- Social platforms linked from the site (X, Instagram, GitHub, YouTube).
- Denial-of-service attacks, automated scanning that degrades the site, or reports based only on missing security headers that have no demonstrated impact.
- Social engineering, physical attacks, or issues requiring access to a device or account that is not yours.

## Safe harbour

I will not pursue legal action against researchers who:

- Act in good faith and follow this policy.
- Avoid privacy violations, data destruction, and service disruption.
- Report findings privately and give reasonable time to fix them.
- Do not exploit a vulnerability beyond the minimum needed to demonstrate it.

## Copyright

© 2026 Rendani Manugeni. All rights reserved.
