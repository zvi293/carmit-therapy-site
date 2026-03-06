# SEO AUDIT — Carmit Therapy Site
> Generated: 2026-03-06 | Domain: `https://carmit-therapy.netlify.app`

---

## DOMAIN CONSTANT
**Production URL:** `https://carmit-therapy.netlify.app`  
All canonical, og:url, and sitemap.xml entries use this base. If a custom domain is obtained later, do a global find-and-replace.

---

## Phase 0: Page Inventory

| File | Title (current) | H1 | Primary Keyword | Canonical | Issues |
|------|----------------|-----|-----------------|-----------|--------|
| `index.html` | טיפול רגשי לילדים נוער ומבוגרים \| כרמית משה – פסיכותרפיסטית הוליסטית | מה אם היה מקום שבו הילד שלך יכול פשוט להיות עצמו? | Home / Brand | /  (without trailing slash) | Canonical missing trailing slash; no `theme-color` for PWA; form inputs lack `<label>` tags; hero uses CSS background (no `<img>` tag so no LCP img optimization possible); `og:image` references `/image/og-cover.jpg` which does NOT exist |
| `therapy-children-petah-tikva.html` | טיפול רגשי לילדים פתח תקווה \| כרמית משה – … | טיפול רגשי לילדים פתח תקווה | טיפול רגשי לילדים פתח תקווה | ✅ | Missing `theme-color`; footer missing cross-SEO-links to other landing pages; service schema `url` field points to page URL, not homepage; no `@id` on schemas |
| `cbt-children-petah-tikva.html` | CBT לילדים פתח תקווה \| כרמית משה – … | CBT לילדים פתח תקווה | CBT לילדים פתח תקווה | ✅ | Same as above |
| `psychotherapist-children-petah-tikva.html` | פסיכותרפיסטית ילדים פתח תקווה \| כרמית משה – … | פסיכותרפיסטית ילדים פתח תקווה | פסיכותרפיסטית לילדים פתח תקווה | ✅ | Same as above |
| `privacy.html` | מדיניות פרטיות ותנאי שימוש \| כרמית משה | מדיניות פרטיות ותנאי שימוש | ✅ | Missing OG tags, Twitter card, `theme-color`, no schema; `robots` directive is just `index,follow` (missing `max-image-preview:large`) |

---

## Priority Action List

### P0 — Critical (must fix before indexing)

| # | Issue | Files | Fix |
|---|-------|-------|-----|
| 1 | `og:image` references non-existent `/image/og-cover.jpg` | all pages | Point to an existing image (`/image/salon.jpg.jpeg` or logo) |
| 2 | Sitemap missing `privacy.html` | sitemap.xml | Add entry |
| 3 | `index.html` canonical missing trailing slash | index.html | `https://carmit-therapy.netlify.app/` |
| 4 | Form inputs lack `<label>` (accessibility + SEO) | index.html | Add visually-hidden `<label>` elements |
| 5 | `privacy.html` missing OG, Twitter, `theme-color` | privacy.html | Add full head block |
| 6 | Landing pages footer missing cross-links to sibling SEO pages | 3 landing pages | Add `footer-seo-links` section |

### P1 — High importance

| # | Issue | Files | Fix |
|---|-------|-------|-----|
| 7 | No `theme-color` meta on landing pages + privacy | 4 pages | Add `#5e7bff` |
| 8 | Schema has no `@id` fields (weak entity binding) | all pages | Add `@id` using canonical URL |
| 9 | Landing page schemas: `url` points to page itself, not main entity | 3 landing pages | Best practice: add `mainEntityOfPage` with page URL |
| 10 | No `referrerpolicy` meta on most pages | all | Add `<meta name="referrer" content="strict-origin-when-cross-origin">` |
| 11 | Logo image (`עיצוב.png`) missing `width`/`height` on landing pages | 3 landing pages | Add `width="42" height="42" decoding="async" loading="lazy"` |
| 12 | No caching headers for static assets | all | Add Netlify `_headers` file |

### P2 — Nice to have

| # | Issue | Files | Fix |
|---|-------|-------|-----|
| 13 | Index schema missing `WebSite` + `SearchAction` (Sitelinks Search Box) | index.html | Add WebSite schema |
| 14 | No `hreflang` for alternate language versions | all | Skip — site is Hebrew-only |
| 15 | `merry-christmas.jpg` (4 MB!) in `/image/` folder | image/ | Not referenced in any HTML; safe to ignore unless referenced later |
| 16 | Sitemap `lastmod` dates are consistent `2026-03-05` | sitemap.xml | Update to `2026-03-06` for today's deploy |

---

## Baseline Notes

- **Robots.txt**: ✅ Correct — `User-agent: *`, `Allow: /`, `Sitemap:` reference is correct.
- **Sitemap**: Mostly correct; missing `privacy.html`; `xmlns` uses `https` (should be `http` per spec) — will fix.
- **Internal linking**: `index.html` links to all 3 landing pages via `footer-seo-links`; landing pages do NOT cross-link to siblings.
- **Fonts**: Correct preconnect + `display=swap` in Google Fonts URL. ✅
- **Skip links**: Present on all pages. ✅
- **ARIA**: `main-nav` has `aria-label`; map iframe has `title`; WhatsApp btn has `aria-label`. ✅
- **Schema**: ProfessionalService JSON-LD on all pages with real NAP data. ✅  FAQPage schema on 3 landing pages. ✅
- **CLS risk**: Hero uses CSS `background-image` (no `<img>`), so no CLS from hero. Clinic photos are decorative CSS blocks. Logo image missing dimensions on landing pages — low CLS risk but should be fixed.
- **LCP**: Hero `background-image` is CSS, so not directly measurable by Lighthouse as LCP candidate image; font is `display:swap`.

---

## Changes To Be Implemented

The following sections of this audit are addressed in code changes applied to the repository.

1. **`sitemap.xml`** — Add `privacy.html`, fix xmlns to `http`, update lastmod to `2026-03-06`.
2. **`index.html`** — Fix canonical trailing slash; add `theme-color`; add `referrerpolicy`; fix `og:image` to use existing image; add form `<label>` elements; add `WebSite` schema; add `@id` to schema.
3. **`therapy-children-petah-tikva.html`** — Add `theme-color`; fix `og:image`; add `referrerpolicy`; add footer cross-links; add `@id`/`mainEntityOfPage`; add logo dimensions.
4. **`cbt-children-petah-tikva.html`** — Same as above.
5. **`psychotherapist-children-petah-tikva.html`** — Same as above.
6. **`privacy.html`** — Add OG/Twitter block; add `theme-color`; add `referrerpolicy`; update robots to include `max-image-preview:large`.
7. **`_headers`** (new file) — Netlify caching headers for CSS, images, and security headers.

---

*End of SEO_AUDIT.md*
