import type { IncomingMessage } from "node:http";
import proxyaddr from "proxy-addr";

const LODGE_ORIGINS = [
  "https://devoceanlodge.com",
  "https://www.devoceanlodge.com",
  "https://mia-voice-receptionist.onrender.com",
  "https://code-optimizer-troostsa.replit.app",
];

export function allowedOrigins(): Set<string> {
  const origins = new Set(LODGE_ORIGINS);
  for (const value of (process.env.RECEPTION_ALLOWED_ORIGINS ?? "").split(",").filter(Boolean)) {
    const origin = value.trim();
    const parsed = new URL(origin);
    if (parsed.origin !== origin || parsed.protocol !== "https:") {
      throw new Error("RECEPTION_ALLOWED_ORIGINS must contain exact HTTPS origins, not patterns or paths");
    }
    origins.add(origin);
  }
  if (process.env.NODE_ENV !== "production") {
    for (const port of [5000, 5173, 8080]) {
      origins.add(`http://localhost:${port}`);
      origins.add(`http://127.0.0.1:${port}`);
    }
    for (const host of [process.env.REPLIT_DEV_DOMAIN, ...(process.env.REPLIT_DOMAINS ?? "").split(",")]) {
      if (host) origins.add(`https://${host}`);
    }
  }
  return origins;
}

export function originAllowed(origin: unknown): boolean {
  return typeof origin === "string" && allowedOrigins().has(origin);
}

// Trust only explicitly configured proxy addresses/subnets, never arbitrary
// X-Forwarded-For or numeric hop counts. The safe default ignores internet peers.
export function trustedProxies(): (address: string, index: number) => boolean {
  const addresses = (process.env.RECEPTION_TRUSTED_PROXIES ?? "loopback")
    .split(",").map((value) => value.trim()).filter(Boolean);
  if (addresses.some((value) => value === "0.0.0.0/0" || value === "::/0")) {
    throw new Error("RECEPTION_TRUSTED_PROXIES cannot trust every internet address");
  }
  return proxyaddr.compile(addresses);
}

export function clientAddress(req: IncomingMessage): string {
  return proxyaddr(req, trustedProxies());
}
