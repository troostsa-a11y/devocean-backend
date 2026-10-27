import {
  Beds24ApiError, Beds24NotConfiguredError, checkAvailability, findNearestAvailable,
  formatAvailabilityForModel, type AvailabilityResult, type RoomOffer,
} from "./client";
import { getLodgeToday } from "./dates";
import { formatGroupAvailability } from "./group";
import { logger } from "../lib/logger";

export const NEAREST_ROOM_TYPES = ["any", "safari_tent", "comfort_tent", "chalet", "cottage"] as const;
type RoomType = typeof NEAREST_ROOM_TYPES[number];

export const nearestAvailabilityTool = {
  type: "function" as const,
  function: {
    name: "check_nearest_availability",
    description:
      "Use the SAME nearest-available-date search as the lodge booking page. Only call after " +
      "the guest agrees to check nearby dates, or explicitly requests this search. Preserve the " +
      "original stay length, guest counts and room preference. Searches up to 21 days earlier " +
      "and 84 days later, excluding past dates; rechecks live availability before suggesting a stay. " +
      "Read-only: never creates, holds or confirms a reservation.",
    parameters: {
      type: "object",
      properties: {
        checkIn: {
          type: "string",
          description: "Original preferred arrival, YYYY-MM-DD; use MM-DD only if no year was given.",
        },
        checkOut: {
          type: "string",
          description: "Original preferred departure, YYYY-MM-DD; use MM-DD only if no year was given.",
        },
        numAdults: { type: "integer", description: "Keep the same adult count as the original search." },
        numChildren: { type: "integer", description: "Keep the same number of children aged 4–12." },
        numInfants: { type: "integer", description: "Keep the same number of infants aged 0–3." },
        roomType: {
          type: "string", enum: [...NEAREST_ROOM_TYPES],
          description: "Preserve the guest's preferred room type; use any only if they have no preference.",
        },
        guestAgreed: {
          type: "boolean", enum: [true],
          description: "Must be true. The guest has agreed to check nearby dates or explicitly requested it.",
        },
      },
      required: ["checkIn", "checkOut", "guestAgreed"],
    },
  },
};

interface NearestArguments {
  checkIn?: string;
  checkOut?: string;
  numAdults?: number;
  numChildren?: number;
  numInfants?: number;
  roomType?: RoomType;
  guestAgreed?: boolean;
}

const roomPatterns = {
  safari_tent: /safari/i,
  comfort_tent: /comfort/i,
  chalet: /chalet/i,
  cottage: /cottage/i,
};

function scopedRooms(result: AvailabilityResult, preference: RoomType): RoomOffer[] {
  return preference === "any" ? result.offers :
    result.offers.filter((room) => roomPatterns[preference].test(room.roomName));
}

function canHost(room: RoomOffer): boolean {
  return room.available && room.capacityAvailable !== false &&
    Number.isInteger(room.requiredUnits) && room.requiredUnits! > 0 &&
    Number.isInteger(room.unitsAvailable) && room.unitsAvailable! >= room.requiredUnits!;
}

function modelSummary(result: AvailabilityResult, preference: RoomType) {
  const scoped = { ...result, offers: scopedRooms(result, preference) };
  return JSON.parse(result.numAdults > 2 || (result.numChildren ?? 0) + (result.numInfants ?? 0) > 0
    ? formatGroupAvailability(scoped) : formatAvailabilityForModel(scoped));
}

function verifiedStay(result: AvailabilityResult, preference: RoomType, roomId?: string): boolean {
  const rooms = scopedRooms(result, preference);
  if (roomId && !rooms.some((room) => room.roomId === roomId && canHost(room))) return false;
  const summary = modelSummary(result, preference);
  return summary.groupCapacityPossible === true ||
    (summary.groupCapacityPossible === undefined && rooms.some(canHost));
}

/** Runs only after the common conversation, schema, consent and quota checks. */
export async function runNearestAvailability(
  args: NearestArguments,
  context: { conversationId: number; signal?: AbortSignal },
): Promise<string> {
  if (args.guestAgreed !== true) {
    return JSON.stringify({ error: "consent_required", note: "Ask whether the guest wants a nearest-date search, then wait for agreement." });
  }
  const checkIn = args.checkIn!;
  const checkOut = args.checkOut!;
  const numAdults = args.numAdults ?? 2;
  const numChildren = args.numChildren ?? 0;
  const numInfants = args.numInfants ?? 0;
  const preference = args.roomType ?? "any";
  const diagnostic = { conversationId: context.conversationId, checkIn, checkOut, numAdults, numChildren, numInfants, preference };
  if (checkIn < getLodgeToday()) {
    return JSON.stringify({
      error: "past_dates",
      note: "The preferred arrival is in the past. Use MM-DD if no year was given; otherwise clarify the explicit year. This is not a connection failure.",
    });
  }

  // Includes catalogue lookup, bounded room searches and the final recheck.
  const deadline = AbortSignal.timeout(40_000);
  const signal = context.signal ? AbortSignal.any([context.signal, deadline]) : deadline;
  const lookup = (arrival: string, departure: string) =>
    checkAvailability(arrival, departure, numAdults, numChildren, numInfants, signal);
  const success = (result: AvailabilityResult, complete: boolean, original = false) => {
    const query = new URLSearchParams({
      checkIn: result.checkIn, checkOut: result.checkOut, adults: String(numAdults),
      children: String(numChildren), infants: String(numInfants),
    });
    return JSON.stringify({
      found: true, checkIn: result.checkIn, checkOut: result.checkOut, nights: result.nights,
      preferredDatesNowAvailable: original, searchComplete: complete, roomPreference: preference,
      availability: modelSummary(result, preference),
      bookingUrl: `https://devoceanlodge.com/book-direct?${query}`,
      note: (original ? "The preferred dates are available now; no date change is needed. " :
        complete ? "This is the closest verified room-type alternative returned by the booking page's search. " :
          "This alternative is verified, but some room-type searches failed; do not claim it is the closest across the whole lodge. ") +
        "State the full dates and unchanged stay length. Use only the returned live pricing; convert USD with convert_currency if needed. " +
        "For groups/families, the capacity suggestions are not a confirmed group quote: do not multiply per-unit prices. " +
        "Offer bookingUrl with these dates and guest counts. Do not claim a reservation is held or confirmed.",
    });
  };

  try {
    const original = await lookup(checkIn, checkOut);
    const rooms = scopedRooms(original, preference);
    if (!rooms.length || rooms.some((room) => !room.roomId) || rooms.length > 4) {
      throw new Error("Room catalogue is unavailable for a bounded nearest-date search");
    }
    if (verifiedStay(original, preference)) return success(original, true, true);

    const searches = await Promise.allSettled(rooms.map(async (room) => ({
      room,
      result: await findNearestAvailable({
        roomId: room.roomId!, fromDate: checkIn, nights: original.nights,
        adults: numAdults, children: numChildren, infants: numInfants,
      }, signal),
    })));
    let failures = searches.filter((result) => result.status === "rejected").length;
    const candidates: Array<{ roomId: string; checkIn: string; checkOut: string; offset: number }> = [];
    for (const search of searches) {
      if (search.status !== "fulfilled" || !search.value.result.found) continue;
      const result = search.value.result;
      const offset = Math.round((Date.parse(result.checkIn) - Date.parse(checkIn)) / 86_400_000);
      if (result.checkIn < getLodgeToday() || offset < -21 || offset > 84) {
        failures++;
        continue;
      }
      candidates.push({ roomId: search.value.room.roomId!, checkIn: result.checkIn, checkOut: result.checkOut, offset });
    }
    // Match the booking engine: closest on either side, earlier arrival wins a tie.
    candidates.sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset) || a.offset - b.offset);
    const rechecks = new Map<string, AvailabilityResult>();
    for (const candidate of candidates) {
      let current = rechecks.get(candidate.checkIn);
      if (!current) {
        current = await lookup(candidate.checkIn, candidate.checkOut);
        rechecks.set(candidate.checkIn, current);
      }
      if (verifiedStay(current, preference, candidate.roomId)) return success(current, failures === 0);
    }
    logger.info({ ...diagnostic, failures, candidates: candidates.length }, "Nearest-date search completed without a verified alternative");
    if (failures) {
      return JSON.stringify({
        error: "nearest_search_incomplete",
        note: "Some room-type searches could not complete. Do not claim there are no alternatives or that the whole lodge is sold out. Offer to retry or use /book-direct.",
      });
    }
    return JSON.stringify({
      found: false, checkIn, checkOut, nights: original.nights,
      reason: candidates.length ? "availability_changed" : "no_matching_dates",
      searched: { daysBefore: 21, daysAfter: 84, excludesPast: true, roomTypes: rooms.map((room) => room.roomName) },
      note: candidates.length
        ? "The suggested dates could not be confirmed on a fresh lookup. Do not present them as available; offer to retry or use /book-direct."
        : "No matching same-length stay was found in the checked room-type searches (up to 21 days earlier and 84 days later, excluding past dates). " +
          "For groups, mixed-room combinations may still be possible; do not say the whole lodge is sold out. Offer another date range or a staff enquiry.",
    });
  } catch (err) {
    if (context.signal?.aborted) return JSON.stringify({ error: "session_ended" });
    logger.error({ err, ...diagnostic }, "Nearest-date availability tool failed");
    const invalid = err instanceof Beds24ApiError && [400, 422].includes(err.status);
    return JSON.stringify({
      error: err instanceof Beds24NotConfiguredError ? "live_availability_unavailable" :
        invalid ? "invalid_stay" : "availability_lookup_failed",
      note: invalid ? "Check or clarify the dates and guest counts; a rejected request is not a booking-system outage." :
        "The nearest-date search could not be completed. Do not invent alternative dates or prices, and do not claim no rooms are available. Suggest trying again or /book-direct.",
    });
  }
}
