import { logger } from "../lib/logger";

// Free, no-key FX rates (base USD). Returns { result, base_code, rates: { ZAR, EUR, ... } }.
const FX_API = "https://open.er-api.com/v6/latest/USD";
const CACHE_TTL_MS = 60 * 60 * 1000; // rates change slowly; refresh hourly

/** Thrown when live FX rates cannot be loaded. */
export class CurrencyUnavailableError extends Error {
  constructor() {
    super("Live currency rates are not available right now.");
    this.name = "CurrencyUnavailableError";
  }
}

// Common spoken names/symbols -> ISO 4217 code. Mia often gets "rand", "euros", "£".
const CURRENCY_ALIASES: Record<string, string> = {
  rand: "ZAR",
  rands: "ZAR",
  zar: "ZAR",
  euro: "EUR",
  euros: "EUR",
  eur: "EUR",
  "€": "EUR",
  pound: "GBP",
  pounds: "GBP",
  "pound sterling": "GBP",
  sterling: "GBP",
  gbp: "GBP",
  "£": "GBP",
  dollar: "USD",
  dollars: "USD",
  usd: "USD",
  "us dollar": "USD",
  "us dollars": "USD",
  "$": "USD",
  metical: "MZN",
  meticais: "MZN",
  meticals: "MZN",
  mzn: "MZN",
  rupee: "INR",
  rupees: "INR",
  inr: "INR",
  "australian dollar": "AUD",
  aud: "AUD",
};

/** Normalize a user/model-supplied currency token to an ISO 4217 code. */
export function normalizeCurrency(input: string): string {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  if (CURRENCY_ALIASES[lower]) return CURRENCY_ALIASES[lower];
  return trimmed.toUpperCase();
}

let ratesCache: { rates: Record<string, number>; fetchedAt: number; lastUpdate?: string } | null = null;

async function getRates(): Promise<{ rates: Record<string, number>; lastUpdate?: string }> {
  const now = Date.now();
  if (ratesCache && now - ratesCache.fetchedAt < CACHE_TTL_MS) {
    return { rates: ratesCache.rates, lastUpdate: ratesCache.lastUpdate };
  }
  const res = await fetch(FX_API, { headers: { accept: "application/json" } });
  const text = await res.text();
  if (!res.ok) {
    throw new CurrencyUnavailableError();
  }
  const json = JSON.parse(text) as {
    result?: string;
    rates?: Record<string, number>;
    time_last_update_utc?: string;
  };
  if (json.result !== "success" || !json.rates) {
    throw new CurrencyUnavailableError();
  }
  ratesCache = { rates: json.rates, fetchedAt: now, lastUpdate: json.time_last_update_utc };
  logger.info({ count: Object.keys(json.rates).length }, "Currency: refreshed live FX rates (base USD)");
  return { rates: json.rates, lastUpdate: json.time_last_update_utc };
}

export interface ConversionResult {
  amountUsd: number;
  targetCurrency: string;
  rate: number;
  converted: number;
  asOf?: string;
}

/** Convert a USD amount to a target currency using live rates. */
export async function convertFromUsd(amountUsd: number, targetCurrency: string): Promise<ConversionResult> {
  const code = normalizeCurrency(targetCurrency);
  const { rates, lastUpdate } = await getRates();
  if (code === "USD") {
    return { amountUsd, targetCurrency: "USD", rate: 1, converted: amountUsd, asOf: lastUpdate };
  }
  const rate = rates[code];
  if (rate == null) {
    throw new CurrencyUnavailableError();
  }
  const converted = Math.round(amountUsd * rate * 100) / 100;
  return { amountUsd, targetCurrency: code, rate, converted, asOf: lastUpdate };
}
