---
name: Beds24 live availability integration
description: How Mia's read-only live availability (Beds24 API v2) is authenticated and parsed; the gotchas that cost real time.
---

# Beds24 v2 (read-only live availability for Mia)

Beds24 has **no Replit integration** — the credential is supplied directly by the user as a secret.

## Auth: the credential type is ambiguous, so the client auto-detects
The secret may be any of three things and you cannot tell which by looking:
- a **long-life token** → used directly as the `token:` header (this is what the user ended up providing; scopes `read:inventory`, `read:properties`).
- a **refresh token** → exchange via `GET /authentication/token` (header `refreshToken`) for a 24h access token.
- a **one-time invite code** → exchange via `GET /authentication/setup` (header `code`) for `{token, refreshToken}`; the invite code is single-use so the refresh token must be persisted.

**Why this matters:** the user said "invite code" but the value was actually a long-life token, so the invite-code `setup` call returned `401 Token not valid`. The fix was to make `getValidAccessToken()` try, in order: stored refresh token (DB) → validate as direct token via `GET /authentication/details` → refresh-token exchange → invite-code bootstrap.

**How to apply:** never assume the credential type from the secret's name. Validate a candidate token with `GET /authentication/details` (returns `validToken` + `scopes`). Always wrap the stored-refresh-token path in try/catch and fall through to the env credential — a revoked DB token must not permanently break availability.

## Offers response shape (verified live)
`GET /inventory/rooms/offers?propertyId=&arrival=&departure=&numAdults=` returns:
`{ success, data: [ { roomId, propertyId, offers?: [ { offerId, offerName, price, unitsAvailable } ] } ] }`
- A room with **no `offers` array** = not available for those dates.
- Multiple offers per room (e.g. flexible `DIR-SF-OFR` vs cheaper `DIR-MS-OFR`); taking `offers[0]` gives the rack/flexible rate.
- `price` is the **stay total** (not per night); there is **no currency field** — the lodge quotes USD.
- Room names come from `GET /properties?id=&includeAllRooms=true` (roomId → name); cache them.

## Read-only guarantee
Only GET endpoints are called and the token scopes are read-only. Mia quotes availability/price but never creates or confirms a booking — the reservations team completes it. Keep it that way.
