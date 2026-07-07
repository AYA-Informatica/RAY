# RAY — SEO Launch Guide

## What's already done (code-level)

- [x] Page titles: `[Page] · RAY` on all routes
- [x] Meta descriptions: dynamic per listing (title, price, location)
- [x] Open Graph tags: title, description, image, type on listing pages
- [x] Twitter cards: summary_large_image with listing-specific data
- [x] JSON-LD structured data: `Product` schema on every listing detail page
- [x] `robots.txt`: allows all crawlers, blocks /admin /api /profile /sell /chat /favorites
- [x] `sitemap.xml`: auto-generated with home, search, and category pages
- [x] Canonical URLs: `alternates.canonical` set on listing pages
- [x] Mobile-first responsive design (dark mode)
- [x] Semantic HTML: proper heading hierarchy, `<main>`, `<section>`, `<nav>`
- [x] Skip-to-content link for accessibility
- [x] Fast TTFB: Vercel region co-located with DB, categories cached, bundle optimized

---

## Step 1: Google Search Console (do this first)

1. Go to https://search.google.com/search-console
2. Click "Add property"
3. Choose "URL prefix" and enter `https://www.raymarkets.co` (or your custom domain)
4. Verify ownership — easiest method is "HTML tag":
   - Google gives you a `<meta name="google-site-verification" content="..." />` tag
   - Add it to `src/app/layout.tsx` inside the `metadata` export:
     ```ts
     verification: { google: "your-verification-code-here" },
     ```
   - Deploy and click "Verify" in Search Console
5. Go to Sitemaps > enter `sitemap.xml` > Submit
6. Go to URL Inspection > enter `https://your-domain/home` > Request Indexing

---

## Step 2: Google Business Profile (optional but valuable)

If RAY has a physical business presence in Rwanda:

1. Go to https://business.google.com
2. Create a profile for "RAY Marketplace"
3. Category: "Online marketplace" or "Shopping service"
4. Link to your website
5. This helps with local search visibility in Rwanda/East Africa

---

## Step 3: Submit to Bing and Yandex

1. **Bing Webmaster Tools**: https://www.bing.com/webmasters
   - Add your site, verify, submit sitemap
   - Bing also powers DuckDuckGo and Yahoo search
2. **Yandex Webmaster**: https://webmaster.yandex.com (optional, covers Russian-speaking markets)

---

## Step 4: Social sharing setup

Every time a listing is shared on WhatsApp, Twitter, or Facebook, the OG tags render a rich preview card. Encourage sellers to share their listings — each share is a free backlink.

Test your OG tags:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

---

## Step 5: Backlink building

Priority targets for RAY in Rwanda/East Africa:

- [ ] Rwandan tech blogs and news sites (The New Times, KT Press, Igihe)
- [ ] African startup directories (Disrupt Africa, WeeTracker, Techpoint Africa)
- [ ] Local business directories (Rwanda Yellow Pages, RwandaPages)
- [ ] University and community boards (if relevant to student sellers)
- [ ] Social media: create accounts on Twitter/X, Instagram, Facebook, TikTok
- [ ] WhatsApp Business: set up a channel for announcements and new feature updates

---

## Step 6: Monitor and iterate

### Weekly (5 minutes)
- Check Google Search Console > Performance tab
- Note which queries bring impressions and clicks
- Check for crawl errors under Pages > Not indexed

### Monthly (15 minutes)
- Review top-performing pages — consider adding more content to high-impression pages
- Check Core Web Vitals report in Search Console
- Run Lighthouse audit on the listing detail page (target: Performance > 80, SEO > 90)
- Look for 404 errors from deleted/expired listings — consider adding a "This listing has expired" page instead of a generic 404

### Ongoing
- Every new category or feature page should have a unique title and meta description
- Blog/content pages (if added later) should target long-tail keywords like "buy iPhone Kigali" or "rent apartment Musanze"

---

## Step 7: Future SEO improvements (post-launch)

- [ ] Add a custom domain (e.g., `ray.rw` or `raymarket.rw`) — custom domains rank better than `.vercel.app`
- [ ] Add individual listing URLs to the sitemap (currently only has category pages)
- [ ] Add `hreflang` tags when i18n has distinct URLs per locale
- [ ] Create a blog section targeting search queries like "best places to buy X in Kigali"
- [ ] Add breadcrumb structured data (`BreadcrumbList` schema) to listing pages
- [ ] Consider AMP for listing pages if mobile search traffic is a priority

---

## Quick reference: key URLs

| Resource | URL |
|----------|-----|
| Your sitemap | `https://www.raymarkets.co/sitemap.xml` |
| Your robots.txt | `https://www.raymarkets.co/robots.txt` |
| Google Search Console | https://search.google.com/search-console |
| Rich Results Test | https://search.google.com/test/rich-results |
| PageSpeed Insights | https://pagespeed.web.dev |
| Facebook OG Debugger | https://developers.facebook.com/tools/debug/ |
