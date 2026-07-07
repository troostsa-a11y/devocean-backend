# DEVOCEAN Lodge – Room Availability

Check room availability and nightly pricing at DEVOCEAN Lodge, Ponta do Ouro, Mozambique.

## Endpoint

GET https://devoceanlodge.com/api/booking/availability

## Query Parameters

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| checkIn   | string | yes      | Check-in date (YYYY-MM-DD)           |
| checkOut  | string | yes      | Check-out date (YYYY-MM-DD)          |

## Response

JSON array of available room offers, each with:
- `roomId` — internal room identifier
- `roomName` — display name (e.g. "Safari Tent", "Comfort Tent")
- `pricePerNight` — nightly rate in USD
- `totalPrice` — total for the stay in USD
- `offerId` — pass to the quote endpoint to initiate booking

## Example

```
GET /api/booking/availability?checkIn=2026-08-01&checkOut=2026-08-05
```

## Notes

- Prices are in USD. Use the /api/fx endpoint to convert to the guest's local currency.
- Availability is live from the Beds24 property management system (property 297012).
- Minimum stay may apply during peak season (December–January).
