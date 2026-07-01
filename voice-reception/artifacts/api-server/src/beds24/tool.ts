import {
  checkAvailability,
  formatAvailabilityForModel,
  Beds24NotConfiguredError,
  type AvailabilityResult,
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
          description: "Number of adults sharing. Defaults to 2 if unknown.",
        },
        numChildren: {
          type: "integer",
          description:
            "Number of children aged 4–12 sharing the unit. " +
            "Children aged 0–3 are free — do NOT count them here. " +
            "Always ask the child's age before passing this value. Defaults to 0.",
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
  numChildren?: number;
}): Promise<string> {
  if (!args.checkIn || !args.checkOut) {
    return JSON.stringify({
      error: "missing_dates",
      note: "Ask the guest for both a check-in and a check-out date (YYYY-MM-DD) before checking availability.",
    });
  }

  const numAdults = args.numAdults ? Number(args.numAdults) : 2;
  const numChildren = args.numChildren ? Number(args.numChildren) : 0;
  const checkIn = String(args.checkIn);
  const checkOut = String(args.checkOut);

  try {
    // When the group exceeds per-unit capacity, probe the actual occupancy split:
    // - fullUnitProbe: pricing for a unit with MAX_ADULTS_PER_UNIT adults
    // - remainderProbe: pricing for a unit with the leftover adult(s), if any
    // This gives correct rates instead of doubling the 2-adult price.
    // e.g. 3 adults → 1 unit @ 2 adults + 1 unit @ 1 adult (different, lower rate)
    if (numAdults > MAX_ADULTS_PER_UNIT) {
      const fullUnits = Math.floor(numAdults / MAX_ADULTS_PER_UNIT);
      const remainder = numAdults % MAX_ADULTS_PER_UNIT;
      const unitsNeeded = Math.ceil(numAdults / MAX_ADULTS_PER_UNIT);

      // Children travel with the main group (full unit); the solo-adult partial unit has no child.
      const probePromises: Promise<AvailabilityResult>[] = [
        checkAvailability(checkIn, checkOut, numAdults, numChildren),           // [0] over-cap (expected empty)
        checkAvailability(checkIn, checkOut, MAX_ADULTS_PER_UNIT, numChildren), // [1] full unit pricing
      ];
      if (remainder > 0) {
        probePromises.push(checkAvailability(checkIn, checkOut, remainder, 0)); // [2] partial unit, no child
      }

      const probeResults = await Promise.all(probePromises);
      const result = probeResults[0];
      const fullProbe = probeResults[1];
      const partialProbe = remainder > 0 ? probeResults[2] : undefined;

      const fullAvailable = fullProbe.offers.filter((o) => o.available);

      if (fullAvailable.length > 0) {
        const partialAvailable = partialProbe?.offers.filter((o) => o.available) ?? [];

        const pricing = fullAvailable.map((fullOffer) => {
          const partialOffer = partialAvailable.find((p) => p.roomName === fullOffer.roomName);

          const unitBreakdown: {
            adults: number;
            units: number;
            totalPricePerUnit?: number;
            perPersonPerNight?: number;
            currency: string;
          }[] = [
            {
              adults: MAX_ADULTS_PER_UNIT,
              units: fullUnits,
              totalPricePerUnit: fullOffer.totalPrice,
              perPersonPerNight: fullOffer.perPersonPerNight,
              currency: fullOffer.currency ?? "USD",
            },
          ];

          if (remainder > 0) {
            unitBreakdown.push({
              adults: remainder,
              units: 1,
              totalPricePerUnit: partialOffer?.totalPrice,
              perPersonPerNight: partialOffer?.perPersonPerNight,
              currency: partialOffer?.currency ?? fullOffer.currency ?? "USD",
            });
          }

          const fullTotal = (fullOffer.totalPrice ?? 0) * fullUnits;
          const partialTotal = remainder > 0 ? (partialOffer?.totalPrice ?? 0) : 0;
          const estimatedGroupTotal = fullTotal + partialTotal;

          return {
            room: fullOffer.roomName,
            unitsAvailable: fullOffer.unitsAvailable,
            unitBreakdown,
            estimatedGroupTotal: estimatedGroupTotal > 0 ? estimatedGroupTotal : undefined,
            currency: fullOffer.currency ?? "USD",
          };
        });

        return JSON.stringify({
          checkIn,
          checkOut,
          nights: result.nights,
          numAdults,
          anyAvailable: false,
          reason: "over_occupancy",
          maxAdultsPerUnit: MAX_ADULTS_PER_UNIT,
          unitsNeeded,
          singleUnitPricing: pricing,
          note:
            `Each unit sleeps max ${MAX_ADULTS_PER_UNIT} adults (plus 1 child under 12 free). ` +
            `For ${numAdults} adults, ${unitsNeeded} units are needed. ` +
            `YOU MUST quote the rates from singleUnitPricing. Each room has a unitBreakdown ` +
            `showing the price per unit at each occupancy level — quote these naturally ` +
            `(e.g. "one unit for 2 adults at $X total, one unit for 1 adult at $Y total") ` +
            `and give the estimatedGroupTotal as the combined figure for the whole group. ` +
            `Then offer to have the reservations team arrange the multi-unit booking. ` +
            `Finally ask whether any guests are children under 12, since one child under 12 ` +
            `can share a unit with 2 adults without triggering the occupancy limit.`,
        });
      }

      // Both probes returned no availability — genuinely sold out for these dates.
      return formatAvailabilityForModel(result);
    }

    const result = await checkAvailability(checkIn, checkOut, numAdults, numChildren);
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
