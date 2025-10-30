# Keep Email Automation Server Alive - Setup Guide

## The Problem
Replit puts inactive servers to sleep after about 1 hour of no activity. This prevents your scheduled cron jobs from running at 08:00, 14:00, and 20:00 UTC.

## The Solution
Use a free external service to "ping" your server every 30 minutes to keep it awake.

---

## Option 1: Cron-job.org (Recommended - Simple & Free)

### Step 1: Get Your Health Check URL
Your email automation server health check URL is:
```
https://[your-replit-username]-[repl-name].replit.app:3003/health
```

Or you can use the base URL:
```
https://[your-replit-username]-[repl-name].replit.app:3003/
```

### Step 2: Sign Up at Cron-job.org
1. Go to https://cron-job.org
2. Create a free account (no credit card required)
3. Verify your email address

### Step 3: Create a Cron Job
1. Click "Create cronjob"
2. Fill in the details:
   - **Title:** "DEVOCEAN Email Server Keep-Alive"
   - **URL:** Your health check URL from Step 1
   - **Schedule:**
     - **Every 30 minutes** (select "Every 30 minutes" from dropdown)
     - Or custom: `*/30 * * * *` (every 30 minutes)
   - **Enable notifications:** Optional (you can get email alerts if the ping fails)

3. Click "Create cronjob"

### Step 4: Test It
- Click "Execute now" to test the ping
- You should see a successful response (status 200)
- The job will now run automatically every 30 minutes

---

## Option 2: UptimeRobot (Alternative)

### Step 1: Sign Up
1. Go to https://uptimerobot.com
2. Create a free account

### Step 2: Add Monitor
1. Click "+ Add New Monitor"
2. Configure:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** "DEVOCEAN Email Server"
   - **URL:** Your health check URL
   - **Monitoring Interval:** 30 minutes (free tier allows this)
3. Click "Create Monitor"

---

## Option 3: Better Stack (Formerly Better Uptime)

### Step 1: Sign Up
1. Go to https://betterstack.com/uptime
2. Create a free account

### Step 2: Create Monitor
1. Add a new monitor
2. Set URL to your health check endpoint
3. Set check interval to 30 minutes

---

## Verification

Once set up, you can verify it's working by:

1. **Check your Replit logs** - You should see regular requests to `/health` every 30 minutes
2. **Monitor the service** - The ping service will show if your server is responding
3. **Check cron execution** - Your scheduled email checks should run at 08:00, 14:00, and 20:00 UTC

---

## Important Notes

- **30 minutes is optimal** - It keeps the server alive without excessive pings
- **Don't use 5-minute intervals** - This creates unnecessary load
- **Free tier is sufficient** - All these services offer free tiers that work perfectly
- **SSL/HTTPS** - Make sure to use the HTTPS URL for your Replit server

---

## Troubleshooting

**Q: My cron jobs still aren't running**
A: Check the Replit logs to confirm the ping service is hitting your server every 30 minutes

**Q: The ping service shows errors**
A: Make sure your Replit server is running and the URL is correct (port 3003)

**Q: Can I use a different interval?**
A: Yes, but 30 minutes is recommended. Don't go below 15 minutes (excessive) or above 45 minutes (server might sleep)

---

## Current Schedule

Your email automation checks run at:
- **08:00 UTC** (Morning check)
- **14:00 UTC** (Afternoon check + Daily report)
- **20:00 UTC** (Evening check)

With the keep-alive service running, these will execute reliably every day! 🌊
