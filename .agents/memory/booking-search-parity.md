---
name: Booking search parity
description: Alternative-date suggestions must exercise the real optimized search path, not just primary availability.
---
Test alternative-date suggestions through the actual nearest-date entry point and verify suggested stays against primary availability.

**Why:** A restriction fix covered primary search, checkout and confirmation but missed a separate optimized calendar scan. A test named for nearest-date search only called primary availability, so it passed while suggestions remained invalid.

**How to apply:** Share calendar and rate-plan eligibility across search paths. Keep the single-window optimization, but never replace eligibility with a stock-only scan. Regression tests must call the actual suggestion method and cover both backward and forward candidates.