# Assentum — institutional landing page

A single, discreet institutional landing page for **assentum.io**. Static, dependency-free,
and built to feel like the web presence of a private investment office rather than a crypto
product. No build step, no framework, no analytics, no third-party requests.

- **Stack:** plain HTML + CSS + a little vanilla JS. Fonts (Syne, DM Sans) are self-hosted.
- **Hosting:** GitHub Pages with a custom domain (same approach as the Nyx site).
- **Privacy:** no cookies, no trackers, no external network calls at runtime.

---

## Project structure

```
.
├── index.html        # the page (header, hero, mandate, capability, process, contact, footer)
├── styles.css        # all styles; design tokens defined as CSS variables at the top
├── main.js           # sticky header, mobile menu, scroll-reveal, contact form
├── robots.txt        # ships closed to crawlers (private by default) — see "Indexing"
├── CNAME             # custom domain for GitHub Pages (assentum.io)
├── .nojekyll         # tell GitHub Pages to serve files as-is (no Jekyll)
├── fonts/            # self-hosted Syne + DM Sans (woff2, latin subset)
└── assets/
    ├── favicon.svg   # navy seal mark
    ├── og-image.png  # 1200×630 social share card
    └── og-image.svg  # editable source for the share card
```

---

## Local preview

No tooling required — serve the folder with any static server:

```bash
# Python (built in on macOS)
python3 -m http.server 4173
# then open http://localhost:4173

# or Node
npx serve .
```

---

## Deploy to GitHub Pages

1. **Create a repository** (e.g. `assentum-website`) under the chosen GitHub account/org.
2. **Push these files** to the default branch:
   ```bash
   git init
   git add -A
   git commit -m "Initial Assentum landing page"
   git branch -M main
   git remote add origin git@github.com:<owner>/assentum-website.git
   git push -u origin main
   ```
3. **Enable Pages:** repo **Settings → Pages → Build and deployment**, set **Source = Deploy
   from a branch**, **Branch = `main` / root**. The committed `CNAME` file sets the custom
   domain automatically.
4. **Enforce HTTPS:** once the certificate is issued (a few minutes), tick **Enforce HTTPS**.

> The `CNAME` file already contains `assentum.io`. If you deploy to a different domain, update it.

---

## DNS for assentum.io

Point the apex and `www` at GitHub Pages. If DNS is managed at **Cloudflare** (recommended in
the launch pack), add these records and set them to **DNS only** (grey cloud) so GitHub can
issue and serve its own certificate:

| Type  | Name | Value                       |
|-------|------|-----------------------------|
| A     | `@`  | `185.199.108.153`           |
| A     | `@`  | `185.199.109.153`           |
| A     | `@`  | `185.199.110.153`           |
| A     | `@`  | `185.199.111.153`           |
| AAAA  | `@`  | `2606:50c0:8000::153`       |
| AAAA  | `@`  | `2606:50c0:8001::153`       |
| AAAA  | `@`  | `2606:50c0:8002::153`       |
| AAAA  | `@`  | `2606:50c0:8003::153`       |
| CNAME | `www`| `<owner>.github.io`         |

Then, in repo **Settings → Pages**, confirm the custom domain shows `assentum.io` and the DNS
check passes. GitHub redirects `www` → apex automatically once `www` resolves.

> Want `www` (or `assentum.com`) to be canonical instead? Change the `CNAME` file to that host
> and flip the records accordingly. To redirect a second domain (e.g. `assentum.com`) to this
> one, add a redirect rule at the registrar/Cloudflare — GitHub Pages itself serves one domain.

---

## Contact form

The form works with **zero backend**: on submit it validates client-side (required fields +
email format, plus a honeypot) and opens the visitor's mail client pre-addressed to
`contact@assentum.io`.

To switch to a hosted form service (e.g. **Formspree**) so submissions arrive without the
visitor's mail client:

1. Create a form endpoint and copy its URL.
2. In `main.js`, set:
   ```js
   var FORM_ENDPOINT = "https://formspree.io/f/xxxxxxx";
   ```

That's the only change — the same validation and honeypot apply, and the submission is POSTed
as JSON. The contact email used throughout is set by `CONTACT_EMAIL` in `main.js`.

---

## Indexing (private by default)

`robots.txt` ships with `Disallow: /` so search engines don't index the site before the copy
has legal/comms sign-off (per the launch-pack acceptance criteria). **To allow indexing after
approval,** replace the body of `robots.txt` with:

```
User-agent: *
Allow: /
Sitemap: https://assentum.io/sitemap.xml
```

---

## Optional affiliation line

The footer contains a commented-out credibility line:

```html
<!-- <p class="footer__affiliation">A member of the Fasset Group.</p> -->
```

Uncomment it **only with legal/comms approval**. It is styled and ready; removing it again is
just re-commenting the one line.

---

## Design tokens

Defined as CSS variables at the top of `styles.css`:

| Token | Value     | Use                                   |
|-------|-----------|---------------------------------------|
| Navy  | `#071827` | Hero, contact, footer, primary fields |
| Ivory | `#FAF9F4` | Page background                       |
| Cream | `#F4EFE6` | Cards, process band                   |
| Gold  | `#A06A15` | Section labels, accents, CTA          |
| Ink   | `#11131A` | Primary text                          |

Headings use **Syne**; body uses **DM Sans** (Inter / system sans fallback).

---

## Pre-launch checklist

- [ ] `assentum.io` resolves over HTTPS with **Enforce HTTPS** on.
- [ ] `www` redirects to the canonical host.
- [ ] (If acquired) `assentum.com` redirects to the canonical host.
- [ ] Contact path tested from desktop **and** mobile.
- [ ] No console errors; no third-party requests in the Network tab.
- [ ] Copy approved by legal/comms; affiliation line decision made.
- [ ] `robots.txt` opened up only after that approval.
- [ ] Repo, domain and DNS ownership documented in the ops handover.
```
