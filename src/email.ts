import { getSQL } from "./config.js";
import {
  getIdentities,
  createThread,
  createMessage,
} from "./db.js";
import type {
  Identity,
  Thread,
  InboundEmailPayload,
  ProcessResult,
} from "./types.js";

// ─── Header helpers ──────────────────────────────────────────────────

/** Pull a single header value by name (case-insensitive). */
function getHeader(
  headers: Record<string, string>,
  name: string
): string | undefined {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) return value;
  }
  return undefined;
}

/** Strip Re:/Fwd: prefixes and trim whitespace for subject comparison. */
export function normalizeSubject(subject: string): string {
  return subject
    .replace(/^(?:re|fwd?)\s*:\s*/gi, "")
    .trim();
}

/** Extract raw email address from "Name <addr>" format. */
export function parseEmailAddress(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return match ? match[1].toLowerCase() : raw.trim().toLowerCase();
}

// ─── Identity matching ──────────────────────────────────────────────

/**
 * Match an identity by checking each address in the `to` field.
 * Resend may deliver to a comma-separated list.
 */
export async function matchIdentity(
  toField: string
): Promise<Identity | null> {
  const identities = await getIdentities();
  const toAddresses = toField
    .split(",")
    .map((a) => parseEmailAddress(a));

  for (const addr of toAddresses) {
    const identity = identities.find((i) => i.email.toLowerCase() === addr);
    if (identity) return identity;
  }
  return null;
}

// ─── Thread matching ─────────────────────────────────────────────────

/**
 * Try to find an existing thread by:
 *  1. In-Reply-To / References headers → match a resend_id on an existing message
 *  2. Normalized subject line → match an open thread for the same identity
 */
export async function matchThread(
  headers: Record<string, string>,
  subject: string,
  identityId: string
): Promise<Thread | null> {
  const sql = getSQL();

  // Strategy 1: Message-ID header matching
  const inReplyTo = getHeader(headers, "In-Reply-To");
  const references = getHeader(headers, "References");

  const candidateIds: string[] = [];
  if (inReplyTo) {
    candidateIds.push(inReplyTo.replace(/[<>]/g, "").trim());
  }
  if (references) {
    for (const ref of references.split(/\s+/)) {
      const clean = ref.replace(/[<>]/g, "").trim();
      if (clean) candidateIds.push(clean);
    }
  }

  if (candidateIds.length > 0) {
    const rows = await sql`
      SELECT t.* FROM threads t
      JOIN messages m ON m.thread_id = t.id
      WHERE m.resend_id = ANY(${candidateIds})
      LIMIT 1
    `;
    if (rows.length > 0) return rows[0] as unknown as Thread;
  }

  // Strategy 2: Subject line matching
  const normalized = normalizeSubject(subject);
  if (normalized) {
    const rows = await sql`
      SELECT * FROM threads
      WHERE identity_id = ${identityId}
        AND status = 'open'
        AND LOWER(TRIM(
          REGEXP_REPLACE(subject, '^(?:(?:Re|Fwd?)\\s*:\\s*)+', '', 'gi')
        )) = LOWER(${normalized})
      ORDER BY last_message_at DESC
      LIMIT 1
    `;
    if (rows.length > 0) return rows[0] as unknown as Thread;
  }

  return null;
}

// ─── Main handler ────────────────────────────────────────────────────

/**
 * Process a single inbound email:
 *  - Match identity by `to` address
 *  - Find or create thread
 *  - Store message
 */
export async function processInboundEmail(
  payload: InboundEmailPayload
): Promise<ProcessResult> {
  // 1. Match identity
  const identity = await matchIdentity(payload.to);
  if (!identity) {
    throw new Error(
      `No identity found for recipient address: ${payload.to}`
    );
  }

  // 2. Match or create thread
  let thread = await matchThread(
    payload.headers,
    payload.subject,
    identity.id
  );
  let isNewThread = false;

  if (!thread) {
    thread = await createThread({
      subject: payload.subject,
      identity_id: identity.id,
    });
    isNewThread = true;
  }

  // 3. Build attachments metadata
  const attachmentsMeta = (payload.attachments ?? []).map((a) => ({
    filename: a.filename,
    mimeType: a.content_type,
    size: a.size,
  }));

  // 4. Store message
  const message = await createMessage({
    thread_id: thread.id,
    direction: "inbound",
    from_email: parseEmailAddress(payload.from),
    from_name: payload.from.match(/^([^<]+)</)?.[1]?.trim() ?? undefined,
    to_email: identity.email,
    subject: payload.subject,
    body_html: payload.html ?? undefined,
    body_text: payload.text ?? undefined,
    attachments: attachmentsMeta,
  });

  return {
    threadId: thread.id,
    messageId: message.id,
    isNewThread,
  };
}
