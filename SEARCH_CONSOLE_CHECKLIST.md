# Search Console Checklist — Carmit Therapy Site
## Post-Deploy Actions (after GitHub push → Netlify auto-deploy)

---

### Step 1 — Verify Site Is Live
- [ ] Open https://carmit-therapy.netlify.app/ in a browser
- [ ] Check all 5 pages load correctly:
  - https://carmit-therapy.netlify.app/
  - https://carmit-therapy.netlify.app/therapy-children-petah-tikva.html
  - https://carmit-therapy.netlify.app/psychotherapist-children-petah-tikva.html
  - https://carmit-therapy.netlify.app/cbt-children-petah-tikva.html
  - https://carmit-therapy.netlify.app/privacy.html
- [ ] Verify sitemap: https://carmit-therapy.netlify.app/sitemap.xml (should show 5 URLs as valid XML)
- [ ] Verify footer cross-links work on landing pages

---

### Step 2 — Submit Sitemap to Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Select your property: `https://carmit-therapy.netlify.app/`
3. In the left sidebar → **Sitemaps**
4. Enter: `sitemap.xml`
5. Click **Submit**
6. Status should change to "Success" within minutes

---

### Step 3 — Request Indexing for Key Pages
1. In Search Console → **URL Inspection** tool
2. Paste each URL and click **Request Indexing**:
   - `https://carmit-therapy.netlify.app/`
   - `https://carmit-therapy.netlify.app/therapy-children-petah-tikva.html`
   - `https://carmit-therapy.netlify.app/psychotherapist-children-petah-tikva.html`
   - `https://carmit-therapy.netlify.app/cbt-children-petah-tikva.html`

---

### Step 4 — Validate Schema (Rich Results)
1. Go to [Rich Results Test](https://search.google.com/test/rich-results)
2. Test each page URL
3. Confirm: **ProfessionalService** and **FAQPage** schemas appear without errors
4. If errors appear, check the JSON-LD blocks in the `<head>` of the relevant page

---

### Step 5 — Validate Coverage
- In Search Console → **Pages** (Coverage report)
- Wait 1–3 days after indexing requests
- All 5 pages should appear under "Indexed"
- If any appear under "Not indexed" or "Crawled – currently not indexed" → re-submit via URL Inspection

---

### Step 6 — Monitor
- **Weekly**: Check Search Console → **Performance** for impressions and clicks
- **Monthly**: Check for crawl errors in **Pages** tab
- **On content change**: Re-submit affected page via URL Inspection

---

### Step 7 — Verify Security Headers (Optional)
After deploy, run in terminal:
```bash
curl -I https://carmit-therapy.netlify.app/
```
Response should include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: ...`

---

> [!NOTE]
> The Google verification file `google16a87e731ef7633e.html` should remain in the root — never delete it.
