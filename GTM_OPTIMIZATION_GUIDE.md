# Google Tag Manager Optimization Guide
## Reduce 270 KiB of Unused JavaScript

This guide shows you how to configure your Google Tag Manager container to only load heavy tracking scripts (Google Ads, Facebook Pixel) when users are actually engaged with your site.

---

## 🎯 What This Fixes

**Current Problem:**
- GTM loads after 4 seconds ✅
- But then immediately loads ALL tracking scripts (Google Ads, Analytics, Facebook)
- This loads 592 KiB of JavaScript, with 270 KiB unused

**After This Fix:**
- GTM loads after 4 seconds ✅
- Heavy marketing scripts (Ads, Facebook) only load when user engages ✅
- Google Analytics loads immediately (for bounce rate tracking)
- **Expected Savings: ~150-200 KiB**

---

## 📋 How It Works

The code I added to your website now fires a `user_engaged` event when:
1. User scrolls past 25% of the page, OR
2. User clicks anywhere, OR  
3. User stays on page for 10 seconds

You'll configure GTM tags to wait for this event before loading heavy scripts.

---

## 🔧 GTM Configuration Steps

### Step 1: Create the User Engaged Trigger

1. **Log into Google Tag Manager** (https://tagmanager.google.com)
2. Go to your **GTM-532W3HH2** container
3. Click **Triggers** → **New**
4. Name it: `User Engaged`
5. **Trigger Configuration:**
   - Trigger Type: **Custom Event**
   - Event name: `user_engaged`
   - This trigger fires on: **All Custom Events**
6. **Save**

---

### Step 2: Identify Tags to Optimize

Go to **Tags** and find these tags (they're loading the heavy scripts):

**Tags to modify:**
1. **Google Ads Conversion Tracking** (AW-110...)
2. **Google Ads Remarketing**
3. **Facebook Pixel** (if you have one)

**Tags to KEEP as-is:**
- Google Analytics (needed for bounce rate)
- Any conversion tags that fire on specific events (like form submissions)

---

### Step 3: Update Tag Triggers

For EACH tag identified above:

1. **Open the tag**
2. **Look at the Triggering section**
3. If it says "All Pages" or "Container Loaded":
   - Click the trigger
   - **Change to:** `User Engaged` (the trigger you created)
4. **Save**

**Example for Google Ads tag:**
- Before: Fires on "All Pages"  
- After: Fires on "User Engaged"

**Example for Facebook Pixel:**
- Before: Fires on "Container Loaded"
- After: Fires on "User Engaged"

---

### Step 4: Publish Changes

1. Click **Submit** (top right)
2. Add version name: "Optimize heavy scripts - user engagement trigger"
3. Click **Publish**

---

## ✅ Verify It's Working

### In GTM Preview Mode:

1. **Open GTM** → Click **Preview**
2. **Enter your site URL:** https://devoceanlodge.com
3. **Observe the timeline:**
   - ✅ Google Analytics fires immediately (good)
   - ✅ Google Ads/Facebook tags are "Not Fired" initially
   - **Scroll down 25%** or **click something**
   - ✅ `user_engaged` event fires
   - ✅ Google Ads/Facebook tags fire after engagement

### In PageSpeed Insights:

1. **Run test:** https://pagespeed.web.dev/
2. **Check "Reduce unused JavaScript"**
   - Should see ~150-200 KiB reduction in `/nik2/` scripts
   - Facebook Pixel also reduced

---

## 📊 Expected Results

**Before optimization:**
- 592 KiB GTM-loaded scripts on page load
- 270 KiB unused JavaScript
- Performance score: ~58

**After optimization:**
- ~200-300 KiB GTM-loaded scripts on initial load
- ~70-120 KiB unused JavaScript (much better!)
- **Performance score: ~70-75** 🎯

---

## ⚠️ Important Notes

### Don't Delay These Tags:
- ❌ Google Analytics base tag (needed for bounce rate)
- ❌ Consent Mode updates (already configured correctly)
- ❌ Any tags firing on specific events (form submissions, button clicks)

### Only Delay These:
- ✅ Google Ads conversion tracking
- ✅ Google Ads remarketing
- ✅ Facebook Pixel base code
- ✅ Any other marketing/remarketing scripts

### What About Conversions?
- **Conversions are NOT affected** - they fire on specific events (button clicks, form submissions)
- Only the base remarketing/audience building scripts are delayed
- This actually IMPROVES conversion tracking by reducing page load time

---

## 🔍 Troubleshooting

### "My Facebook Pixel events aren't firing"
- Make sure you're testing with actual user engagement (scroll, click)
- Check GTM Preview to see if `user_engaged` fired
- Verify the Facebook Pixel tag trigger is set to `User Engaged`

### "Google Ads conversions not tracking"
- Conversion tags should fire on specific events (like clicks)
- Don't change triggers for conversion tags - only for remarketing/audience tags
- Conversion tracking is separate from the base remarketing tag

### "Analytics looks wrong"
- Google Analytics base tag should NOT use `User Engaged` trigger
- Keep it on "All Pages" or "Container Loaded"
- Only delay Ads and Facebook Pixel

---

## 📈 Alternative: More Aggressive Optimization

If you want even more savings, you can delay Facebook Pixel longer:

**Create another trigger:**
- Name: `User Highly Engaged`
- Type: Custom Event
- Event name: Create a new event that fires after 20 seconds or 50% scroll

Then use this for Facebook Pixel instead of `User Engaged`.

---

## Need Help?

If you're not comfortable making these changes in GTM:
1. Share this guide with your marketing team
2. Or hire a GTM specialist to implement
3. The changes are reversible - you can always revert in GTM

**Total estimated time:** 10-15 minutes  
**Technical skill needed:** Basic GTM knowledge  
**Risk:** Low (easily reversible)
