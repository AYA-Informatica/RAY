# RAY — Custom Domain Setup Guide

## Overview

This guide walks you through buying a custom domain and connecting it to your Vercel deployment. We use the **DNS Records method** (not nameservers) so you retain full control at Hostinger for future email setup.

**Estimated time:** 15-20 minutes (plus up to 48 hours for DNS propagation, usually under 30 minutes)

---

## Step 1: Choose and buy your domain

### Where to buy
- **Hostinger**: https://www.hostinger.com/domain-name-search
- Alternative registrars: Namecheap, Google Domains, Cloudflare Registrar

### Domain name tips
- Keep it short: 3-8 characters ideal
- Match your brand: `ray.rw`, `getray.rw`, `raymarket.rw`
- `.rw` is the Rwanda country TLD — great for local SEO and trust
- `.com` works too if `.rw` is unavailable or expensive
- Avoid hyphens and numbers
- Check the name isn't trademarked

### What to buy
- Just the domain registration (cheapest plan)
- You do NOT need hosting, website builder, or SSL from Hostinger — Vercel provides all of that for free
- Enable auto-renewal so you don't lose the domain

---

## Step 2: Add the domain to Vercel

1. Go to https://vercel.com/dashboard
2. Select the **RAY** project
3. Go to **Settings** > **Domains**
4. Click **Add Domain**
5. Enter your domain (e.g. `ray.rw`)
6. Vercel will show you the DNS records you need to add — keep this page open

Vercel will give you something like:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

> **Note:** `@` means the root domain (e.g. `ray.rw`). `www` is the subdomain (e.g. `www.ray.rw`). You want both to work.

---

## Step 3: Add DNS records at Hostinger

1. Log into https://www.hostinger.com
2. Go to **Domains** > select your domain
3. Go to **DNS / Nameservers** > **DNS Records** (or "DNS Zone Editor")
4. **Do NOT change nameservers** — keep Hostinger's default nameservers

### Add the A record (root domain)

| Field | Value |
|-------|-------|
| Type | A |
| Name | `@` |
| Points to | `76.76.21.21` |
| TTL | 3600 (or Auto) |

> If there's already a default A record pointing to Hostinger's IP, **delete it first** or update it to `76.76.21.21`.

### Add the CNAME record (www subdomain)

| Field | Value |
|-------|-------|
| Type | CNAME |
| Name | `www` |
| Points to | `cname.vercel-dns.com` |
| TTL | 3600 (or Auto) |

> If there's already a default CNAME for `www`, update it.

### Keep or add email records (for future email setup)

If you plan to use Hostinger email or any email provider later, make sure these records exist (they usually do by default):

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| MX | `@` | (Hostinger mail servers) | Email delivery |
| TXT | `@` | `v=spf1 ...` | Email authentication |

> **Do not delete MX or TXT records.** The DNS Records method lets your website point to Vercel while email stays with Hostinger.

---

## Step 4: Wait for DNS propagation

- Usually takes **5-30 minutes**
- Can take up to **48 hours** in rare cases
- Check propagation status: https://dnschecker.org (enter your domain, select A record)
- Once it shows `76.76.21.21` globally, you're good

### Verify in Vercel
- Go back to **Settings** > **Domains** in your Vercel project
- The domain should show a green checkmark
- Vercel automatically provisions a free SSL certificate (HTTPS)
- If it shows "Invalid Configuration", the DNS records haven't propagated yet — wait and refresh

---

## Step 5: Update RAY environment variables

Once the domain is verified in Vercel:

### In Vercel Dashboard

Go to **Settings** > **Environment Variables** and update:

| Variable | Old value | New value |
|----------|-----------|-----------|
| `NEXT_PUBLIC_SITE_URL` | `https://ray-production.vercel.app` | `https://yourdomain.rw` |
| `ALLOWED_ORIGINS` | `https://ray-production.vercel.app,...` | `https://yourdomain.rw,https://www.yourdomain.rw,https://ray-production.vercel.app` |

> Keep the old `vercel.app` URL in `ALLOWED_ORIGINS` as a fallback — Vercel still serves from it.

### Trigger a redeploy

After updating env vars, redeploy so the app picks up the new values:
- Go to **Deployments** tab > click the three dots on the latest deploy > **Redeploy**

---

## Step 6: Update Supabase OAuth redirect

Google OAuth needs to know about your new domain, otherwise login will fail.

1. Go to https://supabase.com/dashboard
2. Select your RAY project
3. Go to **Authentication** > **URL Configuration**
4. Update **Site URL** to `https://yourdomain.rw`
5. Under **Redirect URLs**, add:
   - `https://yourdomain.rw/auth/callback`
   - `https://www.yourdomain.rw/auth/callback`
   - Keep the old `https://ray-production.vercel.app/auth/callback` as well
6. Click **Save**

### Update Google OAuth consent screen

1. Go to https://console.cloud.google.com
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Edit your OAuth 2.0 Client
5. Under **Authorized redirect URIs**, add:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - (This should already be there — just verify it)
6. Under **Authorized JavaScript origins**, add:
   - `https://yourdomain.rw`
   - `https://www.yourdomain.rw`
7. Save

---

## Step 7: Update Content Security Policy

The CSP header in `next.config.js` has `connect-src` and `img-src` that reference allowed origins. After switching domains, verify the CSP still works:

- The CSP uses `'self'` which automatically adapts to the serving domain
- Supabase and Upstash URLs are hardcoded and don't change
- No code changes needed unless you add third-party services

---

## Step 8: Verify everything works

### Checklist

- [ ] `https://yourdomain.rw` loads the RAY home page
- [ ] `https://www.yourdomain.rw` redirects to `https://yourdomain.rw` (or vice versa)
- [ ] HTTPS padlock shows in the browser (SSL working)
- [ ] Google OAuth login works (sign in → callback → redirects to /home)
- [ ] `https://yourdomain.rw/sitemap.xml` returns the sitemap
- [ ] `https://yourdomain.rw/robots.txt` returns correct rules
- [ ] OG tags use the new domain when sharing links
- [ ] Listing images load correctly (Supabase storage URLs, unaffected by domain change)

### Update Google Search Console

1. Go to https://search.google.com/search-console
2. Add a new property for `https://yourdomain.rw`
3. Verify ownership (HTML tag method — add the meta tag to `layout.tsx`)
4. Submit sitemap: `https://yourdomain.rw/sitemap.xml`
5. Keep the old `vercel.app` property — it shows historical data

### Update SEO Launch Guide

After the domain switch, update `SEO_LAUNCH_GUIDE.md` to reference your new domain instead of `ray-production.vercel.app`.

---

## Step 9: Set up business email (optional, do later)

Once your domain is working with Vercel, you can add professional email addresses like `hello@yourdomain.rw`.

### Option A: Hostinger Email (included in some plans)
1. In Hostinger, go to **Emails** > set up email for your domain
2. MX records should already be pointing to Hostinger (we kept them in Step 3)
3. Create mailboxes: `hello@`, `support@`, `info@`

### Option B: Google Workspace ($6/user/month)
1. Sign up at https://workspace.google.com
2. Verify domain ownership
3. Update MX records at Hostinger to point to Google:
   - `ASPMX.L.GOOGLE.COM` (priority 1)
   - `ALT1.ASPMX.L.GOOGLE.COM` (priority 5)
   - `ALT2.ASPMX.L.GOOGLE.COM` (priority 5)
4. Add SPF, DKIM, and DMARC TXT records as Google instructs

### Option C: Zoho Mail (free for 5 users)
1. Sign up at https://www.zoho.com/mail/
2. Similar setup to Google Workspace — update MX and TXT records

> The DNS Records method we chose in Step 3 makes all of this possible without touching your Vercel setup.

---

## Troubleshooting

### Domain shows "Invalid Configuration" in Vercel
- DNS records haven't propagated yet — wait 30 min and refresh
- Double-check the A record points to `76.76.21.21` (not Hostinger's default IP)
- Check https://dnschecker.org for your domain

### SSL certificate not issuing
- Vercel provisions SSL automatically after DNS verification
- Can take up to 24 hours in rare cases
- If stuck, remove and re-add the domain in Vercel

### Google login fails after domain switch
- Check Supabase Auth > URL Configuration > Site URL matches new domain
- Check redirect URLs include `https://yourdomain.rw/auth/callback`
- Clear browser cookies and try again

### Old vercel.app URL still works
- This is normal and expected — Vercel keeps serving from both URLs
- The old URL won't hurt SEO since your sitemap and canonical URLs point to the new domain
- To force redirect, enable "Redirect" for the `vercel.app` domain in Vercel Settings > Domains

### www vs non-www
- Pick one as primary (recommended: non-www, e.g. `ray.rw`)
- In Vercel Settings > Domains, set the non-primary one to redirect
- Vercel handles this automatically when you add both `ray.rw` and `www.ray.rw`

---

## Summary

| Step | What | Where | Time |
|------|------|-------|------|
| 1 | Buy domain | Hostinger | 5 min |
| 2 | Add domain to project | Vercel Dashboard | 2 min |
| 3 | Add A + CNAME records | Hostinger DNS Editor | 5 min |
| 4 | Wait for propagation | dnschecker.org | 5-30 min |
| 5 | Update env vars + redeploy | Vercel Dashboard | 5 min |
| 6 | Update OAuth redirects | Supabase + Google Cloud | 5 min |
| 7 | Verify CSP | No changes needed | 0 min |
| 8 | Test everything | Browser | 10 min |
| 9 | Business email (optional) | Hostinger/Google/Zoho | 15 min |
