# DEVOCEAN Lodge - Cloudflare Deployment Guide

## Overview
This guide will help you deploy your website to Cloudflare Pages (frontend) and Cloudflare Workers (backend API).

---

## Part 1: Deploy Frontend to Cloudflare Pages

### Step 1: Build Your Frontend
On your local PC, navigate to WebsiteProject and build:
```bash
cd WebsiteProject
npm run build
```
This creates the `dist/` folder.

### Step 2: Sign Up for Cloudflare
1. Go to https://www.cloudflare.com
2. Click "Sign Up" (it's FREE)
3. Complete registration

### Step 3: Create Cloudflare Pages Project
1. Log into Cloudflare Dashboard
2. Click "Workers & Pages" in the left sidebar
3. Click "Create application"
4. Select "Pages" tab
5. Click "Upload assets"

### Step 4: Upload Your Built Frontend
1. Give your project a name: `devocean-lodge`
2. Drag and drop your entire `dist/` folder
3. Click "Deploy site"
4. Cloudflare will give you a URL like: `https://devocean-lodge.pages.dev`

**✅ Frontend is now live!**

---

## Part 2: Deploy Backend to Cloudflare Workers

### Step 5: Install Wrangler (Cloudflare CLI)
On your local PC, open terminal/command prompt:
```bash
npm install -g wrangler
```

### Step 6: Login to Cloudflare via Wrangler
```bash
wrangler login
```
This opens a browser window - click "Allow" to authorize.

### Step 7: Create Worker Project
1. Create a new folder for your worker:
```bash
mkdir devocean-worker
cd devocean-worker
```

2. Copy the `cloudflare-worker.js` file I created to this folder

3. Create a `wrangler.toml` configuration file:
```toml
name = "devocean-api"
main = "cloudflare-worker.js"
compatibility_date = "2024-01-01"

[vars]
MAIL_DOMAIN = "devoceanlodge.com"
```

### Step 8: Set Environment Secrets
Run these commands (replace with your actual values):

```bash
wrangler secret put RECAPTCHA_SECRET_KEY
# Paste your secret when prompted

wrangler secret put MAIL_FROM_EMAIL
# Enter: info@devoceanlodge.com

wrangler secret put MAIL_FROM_NAME
# Enter: DEVOCEAN Lodge

wrangler secret put MAIL_TO_EMAIL
# Enter: your-email@example.com

wrangler secret put MAIL_TO_NAME
# Enter: DEVOCEAN Lodge
```

**Note:** Cloudflare Workers use MailChannels (free email API) instead of traditional SMTP.

### Step 9: Deploy the Worker
```bash
wrangler deploy
```

Cloudflare will give you a Worker URL like:
```
https://devocean-api.your-subdomain.workers.dev
```

**✅ Backend API is now live!**

---

## Part 3: Connect Frontend to Backend

### Step 10: Update Frontend Contact Form
On your local PC, edit `WebsiteProject/src/components/ContactSection.jsx`

Find this line (around line 66):
```javascript
const response = await fetch('/api/contact', {
```

Change it to your Worker URL:
```javascript
const response = await fetch('https://devocean-api.your-subdomain.workers.dev/api/contact', {
```

### Step 11: Rebuild and Redeploy Frontend
```bash
cd WebsiteProject
npm run build
```

Then upload the new `dist/` folder to Cloudflare Pages:
1. Go to Cloudflare Dashboard → Workers & Pages
2. Click on your `devocean-lodge` project
3. Click "Create deployment"
4. Upload the new `dist/` folder

---

## Part 4: Add Your Custom Domain

### Step 12: Connect devoceanlodge.com
1. In Cloudflare Dashboard, go to your Pages project
2. Click "Custom domains" tab
3. Click "Set up a custom domain"
4. Enter: `devoceanlodge.com` (and `www.devoceanlodge.com`)
5. Follow the DNS instructions Cloudflare provides

**If your domain is NOT registered with Cloudflare:**
- Update your domain's nameservers to point to Cloudflare
- OR add CNAME records as Cloudflare instructs

---

## Summary

✅ **Frontend:** Hosted on Cloudflare Pages at `devoceanlodge.com`
✅ **Backend API:** Cloudflare Worker at `devocean-api.workers.dev`
✅ **Custom Domain:** Your own domain pointing to Cloudflare
✅ **Email:** Free via MailChannels (no SMTP server needed!)
✅ **SSL/HTTPS:** Automatic and free
✅ **Global CDN:** Lightning fast worldwide
✅ **Cost:** $0 (completely FREE)

---

## Testing

After deployment, test your contact form at:
- https://devoceanlodge.com

The form should:
1. Submit successfully
2. You receive the enquiry email
3. Customer receives the auto-reply with your signature

---

## Troubleshooting

**If emails don't send:**
- Verify all secrets are set: `wrangler secret list`
- Check Worker logs: In Cloudflare Dashboard → Workers & Pages → Your worker → Logs

**If form shows network error:**
- Check the Worker URL is correct in ContactSection.jsx
- Verify CORS is enabled (it's in the worker code)

---

## Important Files

- `cloudflare-worker.js` - Your backend API code
- `wrangler.toml` - Worker configuration
- `dist/` - Your built frontend files

---

**Need help?** Cloudflare has excellent documentation at: https://developers.cloudflare.com
