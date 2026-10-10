import type { RequestHandler } from "express";
import { randomBytes } from "node:crypto";
import { db, conversations } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashSecret, isAdminAuthorization, secretsEqual } from "./secrets";
import { AbuseLimitError, consumeLimits, aiLimits, creationLimits, loginLimits } from "./abuse";
import { clientAddress } from "./origins";

export const PUBLIC_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const TOKEN_LIFETIME_MS = 24 * 60 * 60_000;

export function newConversationCredential(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashSecret(token) };
}

// A numeric identifier is accepted only for authenticated staff. Guests use
// opaque UUIDs plus a 256-bit capability; neither the UUID nor number is auth.
export async function authorizeConversation(
  identifier: string, token: unknown, authorization?: string,
): Promise<number | null> {
  const admin = isAdminAuthorization(authorization);
  if (!PUBLIC_ID_PATTERN.test(identifier) && !(admin && /^[1-9]\d{0,9}$/.test(identifier))) return null;
  if (!admin && (typeof token !== "string" || !TOKEN_PATTERN.test(token))) return null;
  const [conversation] = await db.select({
    id: conversations.id, hash: conversations.accessTokenHash, createdAt: conversations.createdAt,
  }).from(conversations).where(PUBLIC_ID_PATTERN.test(identifier)
    ? eq(conversations.publicId, identifier) : eq(conversations.id, Number(identifier))).limit(1);
  if (!conversation) return null;
  if (admin) return conversation.id;
  if (!conversation.hash || Date.now() - conversation.createdAt.getTime() >= TOKEN_LIFETIME_MS) return null;
  return secretsEqual(hashSecret(token as string), conversation.hash) ? conversation.id : null;
}

export const conversationAuth: RequestHandler = async (req, res, next) => {
  try {
    const id = await authorizeConversation(String(req.params.id), req.headers["x-conversation-token"], req.headers.authorization);
    if (id === null) {
      res.status(401).json({ error: "Conversation authorization required" });
      return;
    }
    res.locals.conversationId = id;
    next();
  } catch {
    res.status(503).json({ error: "Conversation authorization temporarily unavailable" });
  }
};

function rateLimit(limits: (ip: string, id: number, voice: boolean) => ReturnType<typeof creationLimits>): RequestHandler {
  return async (req, res, next) => {
    try {
      await consumeLimits(limits(clientAddress(req), res.locals.conversationId, req.path.endsWith("/voice-messages")));
      next();
    } catch (err) {
      if (err instanceof AbuseLimitError) {
        res.setHeader("Retry-After", err.retryAfter);
        res.status(429).json({ error: err.message });
      } else {
        res.status(503).json({ error: "Abuse protection temporarily unavailable" });
      }
    }
  };
}

export const limitCreation = rateLimit((ip) => creationLimits(ip));
export const limitLogin = rateLimit((ip) => loginLimits(ip));
export const limitAi = rateLimit((ip, id, voice) => aiLimits(ip, id, voice ? "voice" : "text"));
