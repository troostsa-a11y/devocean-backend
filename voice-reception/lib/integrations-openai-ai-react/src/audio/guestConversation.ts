export interface GuestConversation {
  id: number;
  publicId: string;
  conversationToken: string;
}

export class GuestApiError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export async function guestRequestError(response: Response): Promise<GuestApiError> {
  let detail = "";
  try {
    const body = await response.json();
    if (typeof body.error === "string") detail = body.error;
  } catch { /* Use the safe status-based message. */ }
  return new GuestApiError(response.status,
    response.status === 429 ? "Marin is busy. Please try again in a few minutes." :
    response.status === 401 ? "This conversation has expired. Please refresh to start a new chat." :
    detail || "The receptionist is temporarily unavailable. Please try again.");
}

export async function createGuestConversation(title: string, signal?: AbortSignal): Promise<GuestConversation> {
  const response = await fetch("/api/openai/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify({ title }),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10_000)]) : AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw await guestRequestError(response);
  const body = await response.json();
  if (!Number.isSafeInteger(body.id) || body.id <= 0 ||
    typeof body.publicId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.publicId) ||
    typeof body.conversationToken !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(body.conversationToken)) {
    throw new Error("The receptionist returned an invalid conversation credential.");
  }
  // Keep the capability in memory, not a URL, cookie, localStorage, or logs.
  return { id: body.id, publicId: body.publicId, conversationToken: body.conversationToken };
}

export function conversationHeaders(conversation: GuestConversation): Record<string, string> {
  return { "Content-Type": "application/json", "X-Conversation-Token": conversation.conversationToken };
}

export function trustedParentMessage(event: MessageEvent): boolean {
  if (event.source !== window.parent) return false;
  try {
    const origin = document.referrer ? new URL(document.referrer).origin : window.location.origin;
    return event.origin === origin;
  } catch { return false; }
}
