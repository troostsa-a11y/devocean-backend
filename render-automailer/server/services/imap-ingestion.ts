// Raw RFC822 limits include all MIME parts and attachments, before MIME decoding.
export const IMAP_LIMITS = Object.freeze({
  scanMessages: 100,
  batchMessages: 25,
  messageBytes: 2 * 1024 * 1024,
  batchBytes: 8 * 1024 * 1024,
  fetchTimeoutMs: 15_000,
  batchTimeMs: 60_000,
});

interface Metadata {
  sequence: number;
  uid: number;
  size: number;
  flags: string[];
}

export interface IngestedMessage {
  attributes: { uid: number };
  parts: { which: ''; body: string }[];
}

/**
 * Use node-imap directly: imap-simple.search() buffers every matching body.
 * Every FETCH here has a bounded sequence range or a single UID. A stream byte
 * check also protects against incorrect RFC822.SIZE values from the server.
 */
function boundedFetch<T>(
  connection: any,
  start: () => any,
  collect: (message: any, sequence: number, fail: (error: Error) => void) => void,
  result: () => T,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      connection.removeListener('error', fail);
      reject(error);
      // Do not drain an unexpectedly large literal into memory or wait for it.
      connection.imap.destroy();
    };
    const timer = setTimeout(() => fail(new Error('IMAP fetch exceeded time limit')), IMAP_LIMITS.fetchTimeoutMs);
    connection.on('error', fail);
    try {
      const fetch = start();
      fetch.on('error', fail);
      fetch.on('message', (message: any, sequence: number) => {
        message.on('error', fail);
        collect(message, sequence, fail);
      });
      fetch.once('end', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        connection.removeListener('error', fail);
        resolve(result());
      });
    } catch (error) {
      fail(error as Error);
    }
  });
}

async function fetchMetadata(connection: any, start: number, end: number): Promise<Metadata[]> {
  const metadata: Metadata[] = [];
  return boundedFetch(connection,
    () => connection.imap.seq.fetch(`${start}:${end}`, { size: true }),
    (message, sequence, fail) => {
      if (sequence < start || sequence > end || metadata.length >= IMAP_LIMITS.scanMessages) {
        fail(new Error('IMAP metadata exceeded scan limit'));
        return;
      }
      message.once('attributes', (attrs: any) => {
        if (metadata.length >= IMAP_LIMITS.scanMessages) {
          fail(new Error('IMAP metadata exceeded scan limit'));
          return;
        }
        metadata.push({ sequence, uid: attrs.uid, size: attrs.size, flags: attrs.flags || [] });
      });
    },
    () => metadata.sort((a, b) => a.sequence - b.sequence),
  );
}

async function fetchRawMessage(connection: any, uid: number, maxBytes: number): Promise<{ body: string; rawBytes: number } | null> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  let bodies = 0;
  let complete = false;
  return boundedFetch(connection,
    () => connection.imap.fetch(uid, { bodies: [''], markSeen: false }),
    (message, _sequence, fail) => {
      message.on('body', (stream: any, info: any) => {
        if (++bodies !== 1 || info.size > maxBytes) {
          fail(new Error('IMAP message exceeded byte limit'));
          stream.resume();
          return;
        }
        stream.on('error', fail);
        stream.on('data', (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > maxBytes) {
            fail(new Error('IMAP message exceeded byte limit'));
            return;
          }
          chunks.push(chunk);
        });
        stream.once('end', () => { complete = true; });
      });
    },
    () => complete ? { body: Buffer.concat(chunks, bytes).toString('utf8'), rawBytes: bytes } : null,
  );
}

/**
 * Scan bounded mailbox windows, advancing even over oversized unread mail.
 * Skipped mail is left untouched for operator inspection. Unprocessed mail is
 * not marked Seen, and will be retried on subsequent scans (including restart).
 */
export async function fetchUnreadBatch(connection: any, total: number, nextSequence: number) {
  const messages: IngestedMessage[] = [];
  if (total === 0) return { messages, nextSequence: 1 };
  const start = nextSequence > total ? 1 : nextSequence;
  const end = Math.min(total, start + IMAP_LIMITS.scanMessages - 1);
  const deadline = Date.now() + IMAP_LIMITS.batchTimeMs;
  // Always inspect recent arrivals too: walking a large read-mail history must
  // not delay new booking emails for days. Both windows are bounded, and the
  // rotating historical window prevents a fixed oversized backlog blocking it.
  const recentStart = Math.max(1, total - IMAP_LIMITS.scanMessages + 1);
  const recent = end < total ? await fetchMetadata(connection, recentStart, total) : [];
  const historical = await fetchMetadata(connection, start, end);
  let batchBytes = 0;
  let downloads = 0;
  const downloadedUids = new Set<number>();
  let next = end + 1;
  // Recent mail may remain unread indefinitely (e.g. ordinary non-booking mail).
  // Reserve at least half the byte/time budget and 13 download slots for the
  // rotating historical scan instead of relying on recent mail being marked Seen.
  const windows = [
    { metadata: recent, maxDownloads: Math.floor(IMAP_LIMITS.batchMessages / 2),
      maxBytes: IMAP_LIMITS.batchBytes / 2, deadline: deadline - IMAP_LIMITS.batchTimeMs / 2, historical: false },
    { metadata: historical, maxDownloads: IMAP_LIMITS.batchMessages,
      maxBytes: IMAP_LIMITS.batchBytes, deadline, historical: true },
  ];
  for (const window of windows) {
    let windowDownloads = 0;
    let windowBytes = 0;
    for (const item of window.metadata) {
      if (item.flags.includes('\\Seen') || downloadedUids.has(item.uid)) continue;
      if (!Number.isSafeInteger(item.uid) || item.uid < 1 ||
          !Number.isSafeInteger(item.size) || item.size < 1 || item.size > IMAP_LIMITS.messageBytes) {
        console.warn(`[SECURITY] Skipping IMAP UID ${item.uid}: invalid or oversized RFC822 message`);
        continue;
      }
      if (downloads >= IMAP_LIMITS.batchMessages || windowDownloads >= window.maxDownloads ||
          batchBytes + item.size > IMAP_LIMITS.batchBytes ||
          windowBytes + item.size > window.maxBytes || Date.now() >= window.deadline) {
        if (window.historical) next = item.sequence;
        break;
      }
      const raw = await fetchRawMessage(connection, item.uid, Math.min(
        IMAP_LIMITS.messageBytes, IMAP_LIMITS.batchBytes - batchBytes, window.maxBytes - windowBytes,
      ));
      downloads++;
      windowDownloads++;
      downloadedUids.add(item.uid);
      if (raw === null) continue; // Message may have been expunged between FETCHes.
      batchBytes += raw.rawBytes;
      windowBytes += raw.rawBytes;
      // UTF-8 replacement characters can expand invalid input. Count actual wire
      // bytes even for rejected mail, and budget retained strings as well.
      const bytes = Buffer.byteLength(raw.body, 'utf8');
      const extraBytes = Math.max(0, bytes - raw.rawBytes);
      if (bytes > IMAP_LIMITS.messageBytes || batchBytes + extraBytes > IMAP_LIMITS.batchBytes ||
          windowBytes + extraBytes > window.maxBytes) {
        console.warn(`[SECURITY] Skipping IMAP UID ${item.uid}: decoded byte limit exceeded`);
        continue;
      }
      batchBytes += extraBytes;
      windowBytes += extraBytes;
      messages.push({ attributes: { uid: item.uid }, parts: [{ which: '', body: raw.body }] });
    }
  }
  return { messages, nextSequence: next > total ? 1 : next };
}
