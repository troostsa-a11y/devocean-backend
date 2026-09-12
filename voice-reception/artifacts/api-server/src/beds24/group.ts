import type { AvailabilityResult } from "./client";

/** Stock-aware suggestions, not quotes: mixed occupancies require a cart quote. */
export function formatGroupAvailability(result: AvailabilityResult): string {
  const adults = result.numAdults;
  const dependants = (result.numChildren ?? 0) + (result.numInfants ?? 0);
  const rooms = result.offers.filter(r => r.available && (r.unitsAvailable ?? 0) > 0);
  const combinations: Array<Array<{ room: string; units: number }>> = [];
  function visit(index: number, adultCapacity: number, totalCapacity: number,
    selected: Array<{ room: string; units: number }>, units: number) {
    if (adultCapacity >= adults && totalCapacity >= adults + dependants) {
      combinations.push(selected);
      return;
    }
    if (index === rooms.length || units >= adults) return;
    const room = rooms[index];
    // Unknown capacity is not evidence that a room can hold the group.
    if (!room.maxAdults || !room.maxPeople) return visit(index + 1, adultCapacity, totalCapacity, selected, units);
    for (let n = 0; n <= Math.min(room.unitsAvailable ?? 0, adults - units); n++) {
      visit(index + 1, adultCapacity + n * room.maxAdults,
        totalCapacity + n * room.maxPeople,
        n ? [...selected, { room: room.roomName, units: n }] : selected, units + n);
    }
  }
  visit(0, 0, 0, [], 0);
  combinations.sort((a, b) => a.reduce((s, r) => s + r.units, 0) - b.reduce((s, r) => s + r.units, 0));
  return JSON.stringify({
    checkIn: result.checkIn, checkOut: result.checkOut,
    adults, children: result.numChildren ?? 0, infants: result.numInfants ?? 0,
    anyAvailable: rooms.length > 0,
    groupCapacityPossible: combinations.length > 0,
    suggestedCombinations: combinations.slice(0, 3),
    rooms: rooms.map(r => ({
      room: r.roomName, unitsAvailable: r.unitsAvailable,
      maxAdults: r.maxAdults, maxPeople: r.maxPeople,
      requiredUnits: r.requiredUnits, capacityAvailable: r.capacityAvailable,
    })),
    note: "These are stock-and-capacity suggestions, NOT confirmed reservations or group quotes. " +
      "Individual adult/child/infant allocation and rates must be checked in /book-direct before confirmation. " +
      "Do not invent, multiply or sum per-unit prices into a group total. " +
      "If groupCapacityPossible is false, do not claim the whole lodge is sold out: say a suitable combination could not be verified. " +
      "Answer concisely with at most one suitable combination; do not recite all rooms or policies.",
  });
}