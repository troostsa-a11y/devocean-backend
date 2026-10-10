import type { RequestHandler } from "express";
import { clientAddress } from "./origins";
import { hashSecret } from "./secrets";

// Cheap process-local flood guard before JSON parsing and database access.
// Durable money/notification quotas are separate and shared across replicas.
export function ingressGuard(): RequestHandler {
  const clients = new Map<string, { count: number; until: number }>();
  let global = { count: 0, until: 0 };
  return (req, res, next) => {
    if (req.method === "GET" && ["/health", "/healthz"].includes(req.path)) return next();
    const now = Date.now();
    if (global.until <= now) {
      global = { count: 0, until: now + 60_000 };
      for (const [key, client] of clients) if (client.until <= now) clients.delete(key);
    }
    const key = hashSecret(clientAddress(req));
    let client = clients.get(key);
    if (client && client.until <= now) { clients.delete(key); client = undefined; }
    if (!client && clients.size < 10_000) {
      client = { count: 0, until: now + 60_000 };
      clients.set(key, client);
    }
    if (!client || ++client.count > 60 || ++global.count > 500) {
      res.setHeader("Retry-After", "60");
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }
    next();
  };
}
