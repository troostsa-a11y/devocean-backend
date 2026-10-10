import { createHash, timingSafeEqual } from "node:crypto";

export function hashSecret(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

// Hashing first makes both buffers the same length, including for wrong-length
// input. Never use string equality to compare a credential.
export function secretsEqual(candidate: unknown, expected: string): boolean {
  const value = typeof candidate === "string" ? candidate : "";
  const a = createHash("sha256").update(value, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b) && typeof candidate === "string" && value.length > 0;
}

export function isAdminAuthorization(authorization: unknown): boolean {
  const key = process.env.ADMIN_API_KEY;
  return typeof authorization === "string" && authorization.startsWith("Bearer ") &&
    !!key && secretsEqual(authorization.slice(7), key);
}
