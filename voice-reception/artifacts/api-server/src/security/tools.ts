import { z } from "zod/v4";
import { normalizeCurrency } from "../currency/client";
import { isAvailabilityDate, resolveAvailabilityDates } from "../beds24/dates";
import { NEAREST_ROOM_TYPES } from "../beds24/nearest";

const singleLine = (max: number) => z.string().trim().min(1).max(max).regex(/^[^\u0000-\u001f\u007f]+$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
const dateRange = (value: { checkIn: string; checkOut: string }) => {
  const days = (Date.parse(value.checkOut) - Date.parse(value.checkIn)) / 86_400_000;
  return days > 0 && days <= 60;
};
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => value === "" || value === null ? undefined : value, schema.optional());

const stayArguments = z.strictObject({
  checkIn: z.string().refine(isAvailabilityDate),
  checkOut: z.string().refine(isAvailabilityDate),
  numAdults: z.number().int().min(1).max(30).default(2),
  numChildren: z.number().int().min(0).max(30).default(0),
  numInfants: z.number().int().min(0).max(30).default(0),
});
function resolveStay<T extends { checkIn: string; checkOut: string }>(value: T, context: z.RefinementCtx) {
  const dates = resolveAvailabilityDates(value.checkIn, value.checkOut);
  if (!dates) {
    context.addIssue({ code: "custom", message: "Invalid booking dates" });
    return z.NEVER;
  }
  return { ...value, ...dates };
}
const validParty = (value: { numAdults: number; numChildren: number; numInfants: number }) =>
  value.numAdults + value.numChildren + value.numInfants <= 60;

export const toolArgumentSchemas = {
  check_availability: stayArguments.transform(resolveStay).refine(dateRange).refine(validParty),
  check_nearest_availability: stayArguments.extend({
    roomType: z.enum(NEAREST_ROOM_TYPES).default("any"),
    guestAgreed: z.literal(true),
  }).transform(resolveStay).refine(dateRange).refine(validParty),
  convert_currency: z.strictObject({
    amountUsd: z.number().finite().min(0).max(1_000_000),
    targetCurrency: singleLine(32).refine((value) => /^[A-Z]{3}$/.test(normalizeCurrency(value))),
  }),
  get_weather: z.strictObject({}),
  save_booking_enquiry: z.strictObject({
    guestName: singleLine(120),
    guestEmail: optional(singleLine(254).pipe(z.email())),
    guestPhone: optional(singleLine(40).regex(/^[+\d() .-]+$/)),
    checkIn: optional(date), checkOut: optional(date),
    guests: optional(z.number().int().min(1).max(60)),
    notes: optional(z.string().trim().max(2000).regex(/^[^\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]*$/)),
  }).refine((value) => !value.checkIn || !value.checkOut || dateRange({
    checkIn: value.checkIn, checkOut: value.checkOut,
  })),
};

export type LodgeToolName = keyof typeof toolArgumentSchemas;

export function validateToolArguments(name: string, argsJson: unknown):
  | { ok: true; name: LodgeToolName; args: Record<string, unknown> }
  | { ok: false; error: "unknown_tool" | "bad_arguments" } {
  if (!Object.prototype.hasOwnProperty.call(toolArgumentSchemas, name)) return { ok: false, error: "unknown_tool" };
  if (typeof argsJson !== "string" || argsJson.length > 8192) return { ok: false, error: "bad_arguments" };
  try {
    const toolName = name as LodgeToolName;
    const result = toolArgumentSchemas[toolName].safeParse(JSON.parse(argsJson));
    return result.success ? { ok: true, name: toolName, args: result.data } : { ok: false, error: "bad_arguments" };
  } catch {
    return { ok: false, error: "bad_arguments" };
  }
}
