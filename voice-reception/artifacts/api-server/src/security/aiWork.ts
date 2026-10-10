import type { RequestHandler } from "express";
import { acquireWork, AbuseLimitError, AI_DEADLINE_MS, MAX_HISTORY_CHARACTERS } from "./abuse";
import { clientAddress } from "./origins";

export const guardAiWork: RequestHandler = async (req, res, next) => {
  try {
    const release = await acquireWork(clientAddress(req), res.locals.conversationId, AI_DEADLINE_MS);
    if (res.destroyed) { await release(); return; }
    const controller = new AbortController();
    res.locals.aiSignal = controller.signal;
    const timer = setTimeout(() => {
      controller.abort();
      if (!res.headersSent) res.status(504).json({ error: "AI response timed out. Please try again." });
      else {
        res.write(`data: ${JSON.stringify({ error: "AI response timed out. Please try again." })}\n\n`);
        res.end();
      }
    }, AI_DEADLINE_MS);
    timer.unref();
    res.once("close", () => {
      controller.abort();
      clearTimeout(timer);
      void release().catch(() => {}); // Slots also expire after the hard deadline.
    });
    next();
  } catch (err) {
    if (err instanceof AbuseLimitError) {
      res.setHeader("Retry-After", err.retryAfter);
      res.status(429).json({ error: err.message });
    } else res.status(503).json({ error: "Abuse protection temporarily unavailable" });
  }
};

export function boundedHistory<T extends { content: string }>(rows: T[]): T[] {
  let characters = 0;
  const result: T[] = [];
  for (const row of [...rows].reverse()) {
    if (characters + row.content.length > MAX_HISTORY_CHARACTERS) break;
    characters += row.content.length;
    result.unshift(row);
  }
  return result;
}
