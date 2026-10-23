---
name: Public map abuse controls
description: Security scope and visitor-experience tradeoff for the public lodge map preview.
---
Keep the brochure's lodge map accessible anonymously. Prefer restricting the paid operation to the site's actual preview requirements over adding authentication or CAPTCHA.

**Why:** The security task explicitly prioritizes hardening existing behavior rather than introducing new flows. Visitors do not need a general-purpose map-generation service.

**How to apply:** If future work needs additional preview variants, assess the resulting upstream cost surface explicitly. Fixed upstream URLs and edge caching reduce abuse but are not an account-wide spending cap; worker-local request coalescing and retry cooldowns are not distributed rate limits.
