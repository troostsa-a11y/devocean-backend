# DEVOCEAN Lodge – Currency Conversion

Convert lodge pricing from USD to any supported currency using live exchange rates.

## Endpoint

GET https://devoceanlodge.com/api/fx

## Query Parameters

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| from      | string | yes      | Source currency code (e.g. USD)      |
| to        | string | yes      | Target currency code (e.g. ZAR, EUR) |
| amount    | number | yes      | Amount to convert                    |

## Response

JSON object with:
- `rate` — exchange rate at time of request
- `result` — converted amount
- `from` / `to` — currency codes
- `timestamp` — Unix timestamp of the rate

## Example

```
GET /api/fx?from=USD&to=ZAR&amount=150
```

## Notes

- Rates are fetched live and cached for a short period.
- Common target currencies: ZAR (South Africa), EUR, GBP, MZN (Mozambique), USD.
- Lodge pricing is always settled in USD; this endpoint is for display purposes only.
