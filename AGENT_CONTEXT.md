PROJECT CONTEXT — CARMIT THERAPY WEBSITE

This project is a Hebrew-language therapy website for a holistic emotional therapist who works with children and families.

The website is primarily a marketing / informational site designed to:

- Present therapy services
- Provide information about emotional therapy for children
- Allow parents to contact the therapist
- Generate leads through WhatsApp and contact forms

PRIMARY AUDIENCE

Hebrew-speaking parents in Israel seeking emotional therapy support for their children.

TECH STACK

Frontend:

- HTML
- CSS
- JavaScript

Hosting:

- Netlify

Form Handling:

- Google Apps Script connected to Google Sheets

External Integrations:

- WhatsApp contact button
- Google Sheets form submission endpoint

FILE LAYOUT (as of July 2026)

Pages:
  index.html, accessibility.html, privacy.html, terms.html, 404.html,
  therapy-children-petah-tikva.html, psychotherapist-children-petah-tikva.html,
  cbt-children-petah-tikva.html

Assets:
  style.css              single stylesheet; @font-face block at the top
  js/a11y-init.js        SYNCHRONOUS in <head>. Applies saved accessibility
                         settings before first paint and adds the `js-reveal`
                         class that gates the scroll animations.
  js/site.js             nav, scroll reveal, reading progress, smooth scroll
  js/contact.js          contact form + thank-you modal (index.html only)
  js/a11y.js             accessibility widget UI
  fonts/                 self-hosted Heebo + Frank Ruhl Libre (variable woff2)
  image/                 photographs; .webp with .jpg/.png fallbacks

IMPORTANT INVARIANTS

1. There must be NO inline <script> and NO inline event handlers anywhere.
   The Content-Security-Policy in _headers uses `script-src 'self'`, so any
   inline script will simply not run. Put new code in js/ instead.

2. `.reveal` elements are hidden ONLY while <html> carries `js-reveal`.
   Never move the `opacity: 0` rule back out from under that class — without
   the gate, a JS failure leaves the entire page blank.

3. style.css, and every file in js/, are served with a one-year immutable
   cache. They are requested with a `?v=YYYYMMDD` query string. After editing
   either, bump that version in EVERY html file or returning visitors keep
   the old copy.

4. The colour corrections at the bottom of style.css keep the site at
   WCAG 2.1 AA. Re-check contrast before changing any colour value.

5. Files matching *.md and /.claude/ are returned as 404 by _redirects so
   internal notes stay off the public site.

SITE STRUCTURE

Typical structure includes:

- Hero section
- About the therapist
- Therapy approach / philosophy
- Information about emotional therapy for children
- Parent guidance content
- Contact section
- WhatsApp contact button
- Contact form connected to Google Sheets

CRITICAL RULES

AI agents working on this project MUST follow these rules:

1. Do NOT modify Hebrew text content unless explicitly requested.
2. Do NOT change therapist name, contact information, or therapy descriptions.
3. Do NOT break the contact form submission logic.
4. Preserve Google Sheets integration used by the form.
5. Do NOT remove or alter the WhatsApp contact button.
6. Do NOT remove section IDs used for navigation or anchor links.
7. Preserve SEO structure and heading hierarchy.

UI / DESIGN RULES

- Maintain the existing layout and design style.
- Preserve responsive behavior for mobile and desktop.
- Maintain animations and visual transitions where present.
- Do not introduce heavy frameworks or libraries.

CODE MODIFICATION POLICY

When making code changes:

1. Prefer minimal, targeted fixes.
2. Avoid unnecessary refactoring.
3. Maintain existing CSS class structure.
4. Ensure all JavaScript continues to function correctly.
5. Test that form submission still works after changes.

SEO AND CONTENT SAFETY

Do not modify:

- Page titles
- Meta descriptions
- Structured content hierarchy
- Hebrew wording used for therapy messaging

unless explicitly requested.

AI WORKFLOW EXPECTATION

Before modifying code:

1. Analyze project structure.
2. Identify relevant files.
3. Confirm changes will not break form integration.
4. Ensure changes maintain responsiveness and accessibility.

If unsure about content or wording — do NOT modify it automatically.

GOAL

Preserve a professional, calm, and trustworthy therapy website experience while making safe technical improvements when required..
