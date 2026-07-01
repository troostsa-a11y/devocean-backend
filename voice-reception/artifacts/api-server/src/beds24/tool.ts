import {
  checkAvailability,
  formatAvailabilityForModel,
  Beds24NotConfiguredError,
} from "./client";
import { convertFromUsd, CurrencyUnavailableError } from "../currency/client";
import { getWeather } from "../weather/client";
import { logger } from "../lib/logger";

/** OpenAI tool definition exposing read-only live availability to Mia. */
export const availabilityTool = {
  type: "function" as const,
  function: {
    name: "check_availability",
    description:
      "Check LIVE room availability and current prices at DEVOCEAN Lodge for a specific stay. " +
      "Call this whenever a guest asks whether rooms are free for particular dates, or wants the " +
      "price for specific dates. Returns the rooms that are actually bookable with live prices. " +
      "This is read-only: it never creates or changes a booking.",
    parameters: {
      type: "object",
      properties: {
        checkIn: { type: "string", description: "Check-in date in YYYY-MM-DD format" },
        checkOut: { type: "string", description: "Check-out date in YYYY-MM-DD format" },
        numAdults: {
          type: "integer",
          description: "Number of guests/adults sharing. Defaults to 2 if unknown.",
        },
      },
      required: ["checkIn", "checkOut"],
    },
  },
};

/** OpenAI tool definition for live currency conversion from USD. */
export const currencyTool = {
  type: "function" as const,
  function: {
    name: "convert_currency",
    description:
      "Convert a US dollar (USD) amount into another currency using LIVE exchange rates. " +
      "Lodge prices are quoted in USD, so call this when a guest asks what a price is in their own " +
      "currency (e.g. South African Rand, Euro, British Pound). Returns the converted amount and the rate. " +
      "Always present the result as an approximate guide.",
    parameters: {
      type: "object",
      properties: {
        amountUsd: { type: "number", description: "The amount in US dollars to convert." },
        targetCurrency: {
          type: "string",
          description:
            "Target currency as an ISO code or common name, e.g. 'ZAR', 'rand', 'EUR', 'euro', 'GBP', 'pound'.",
        },
      },
      required: ["amountUsd", "targetCurrency"],
    },
  },
};

/** OpenAI tool definition for live weather at Ponta do Ouro. */
export const weatherTool = {
  type: "function" as const,
  function: {
    name: "get_weather",
    description:
      "Get the current weather conditions and a 3-day forecast for Ponta do Ouro, Mozambique. " +
      "Call this when a guest asks about today's weather, temperature, rain, wind, sea conditions, " +
      "what to pack, or what the weather will be like during their stay.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

/** All tools available to Mia. */
export const lodgeTools = [availabilityTool, currencyTool, weatherTool];

/** Execute a tool call by name and return a JSON string for the model. */
export async function runTool(name: string, argsJson: string): Promise<string> {
  let args: any;
  try {
    args = JSON.parse(argsJson || "{}");
  } catch {
    return JSON.stringify({ error: "bad_arguments", note: "Could not parse tool arguments." });
  }

  if (name === "check_availability") return runCheckAvailability(args);
  if (name === "convert_currency") return runConvertCurrency(args);
  if (name === "get_weather") return runGetWeather();
  return JSON.stringify({ error: "unknown_tool", note: `No tool named ${name}.` });
}

/** Maximum adults that fit in a single lodge unit (2 adults + optionally 1 child under 12). */
const MAX_ADULTS_PER_UNIT = 2;

async function runCheckAvailability(args: {
  checkIn?: string;
  checkOut?: string;
  numAdults?: number;
}): Promise<string> {
  if (!args.checkIn || !args.checkOut) {
    return JSON.stringify({
      error: "missing_dates",
      note: "Ask the guest for both a check-in and a check-out date (YYYY-MM-DD) before checking availability.",
    });
  }

  const numAdults = args.numAdults ? Number(args.numAdults) : 2;
  const checkIn = String(args.checkIn);
  const checkOut = String(args.checkOut);

  try {
    // When the requested group exceeds per-unit capacity, run a second probe with
    // numAdults=2 in parallel. This lets us distinguish "over-occupancy" (rooms
    // exist but can't fit the group in one unit) from "genuinely sold out".
    if (numAdults > MAX_ADULTS_PER_UNIT) {
      const [result, probeResult] = await Promise.all([
        checkAvailability(checkIn, checkOut, numAdults),
        checkAvailability(checkIn, checkOut, 2),
      ]);

      const singleUnitAvailable = probeResult.offers.filter((o) => o.available);

      if (singleUnitAvailable.length > 0) {
        // Rooms are available but a single unit can't accommodate the full group.
        const unitsNeeded = Math.ceil(numAdults / MAX_ADULTS_PER_UNIT);
        return JSON.stringify({
          checkIn,
          checkOut,
          nights: result.nights,
          numAdults,
          anyAvailable: false,
          reason: "over_occupancy",
          maxAdultsPerUnit: MAX_ADULTS_PER_UNIT,
          maxOccupancyNote:
            "Each unit sleeps a maximum of 2 adults (plus 1 child under 12 as a third occupant, free of charge). " +
            `${numAdults} adults cannot share a single unit — ${unitsNeeded} separate units would be required.`,
          unitsNeeded,
          singleUnitPricing: singleUnitAvailable.map((o) => ({
            room: o.roomName,
            unitsAvailable: o.unitsAvailable,
            totalPricePerUnit: o.totalPrice,
            perPersonPerNightAtTwoAdults: o.perPersonPerNight,
            currency: o.currency,
          })),
          note:
            "Tell the guest the max per unit is 2 adults, quote the per-unit price shown, " +
            `explain they would need ${unitsNeeded} units for ${numAdults} adults, and offer to have ` +
            "the reservations team arrange a multi-unit booking. Also ask if any guests are children under 12, " +
            "since one child under 12 can join two adults in a single unit without triggering the over-occupancy limit.",
        });
      }

      // Both calls returned no availability — genuinely sold out for these dates.
      return formatAvailabilityForModel(result);
    }

    const result = await checkAvailability(checkIn, checkOut, numAdults);
    return formatAvailabilityForModel(result);
  } catch (err) {
    if (err instanceof Beds24NotConfiguredError) {
      return JSON.stringify({
        error: "live_availability_unavailable",
        note: "Live availability is not connected right now. Quote the published rates and tell the guest the reservations team will confirm availability for these dates.",
      });
    }
    logger.error({ err }, "check_availability tool failed");
    return JSON.stringify({
      error: "availability_lookup_failed",
      note: "Could not reach the live booking system. Quote the published rates and tell the guest the reservations team will confirm availability for these dates.",
    });
  }
}

async function runGetWeather(): Promise<string> {
  try {
    const result = await getWeather();
    return JSON.stringify({
      location: "Ponta do Ouro, Mozambique",
      current: result.current,
      forecast_3_days: result.forecast,
      note: "Temperatures in °C, wind speed in km/h.",
    });
  } catch (err) {
    logger.error({ err }, "get_weather tool failed");
    return JSON.stringify({
      error: "weather_unavailable",
      note: "Live weather is not available right now. Suggest the guest check a weather app for Ponta do Ouro.",
    });
  }
}

async function runConvertCurrency(args: {
  amountUsd?: number;
  targetCurrency?: string;
}): Promise<string> {
  if (args.amountUsd == null || !args.targetCurrency) {
    return JSON.stringify({
      error: "missing_arguments",
      note: "Provide both a USD amount and a target currency.",
    });
  }

  const amount = Number(args.amountUsd);
  if (!Number.isFinite(amount) || amount < 0) {
    return JSON.stringify({
      error: "bad_amount",
      note: "The USD amount must be a non-negative number.",
    });
  }

  try {
    const result = await convertFromUsd(amount, String(args.targetCurrency));
    return JSON.stringify({
      ...result,
      note: "Live exchange rate — give this to the guest as an approximate guide; the lodge charges in USD.",
    });
  } catch (err) {
    if (err instanceof CurrencyUnavailableError) {
      return JSON.stringify({
        error: "currency_unavailable",
        note: "Live exchange rates aren't available right now (or that currency isn't supported). Quote the price in USD and let the guest know they can check their bank's current rate.",
      });
    }
    logger.error({ err }, "convert_currency tool failed");
    return JSON.stringify({
      error: "currency_conversion_failed",
      note: "Could not convert the currency right now. Quote the price in USD.",
    });
  }
}
