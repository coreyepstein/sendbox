// src/config.ts
import { neon } from "@neondatabase/serverless";
var _sql = null;
var _resendApiKey = null;
function configureSendbox(config) {
  if (config.sql) {
    _sql = config.sql;
  }
  if (config.resendApiKey) {
    _resendApiKey = config.resendApiKey;
  }
  if (config.databaseUrl) {
    _sql = neon(config.databaseUrl);
  }
}
function getSQL() {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set. Call configureSendbox() or set DATABASE_URL.");
  return neon(url);
}
function getResendApiKey() {
  if (_resendApiKey) return _resendApiKey;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set. Call configureSendbox() or set RESEND_API_KEY.");
  return key;
}

// src/resend.ts
import { Resend } from "resend";
var _client = null;
function getResend() {
  if (!_client) {
    _client = new Resend(getResendApiKey());
  }
  return _client;
}

// src/db.ts
async function getIdentities() {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM identities ORDER BY created_at ASC`;
  return rows;
}
async function createIdentity(data) {
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO identities (name, email, role, avatar_url)
    VALUES (${data.name}, ${data.email}, ${data.role ?? null}, ${data.avatar_url ?? null})
    RETURNING *
  `;
  return rows[0];
}
async function deleteIdentity(id) {
  const sql = getSQL();
  const rows = await sql`DELETE FROM identities WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
async function getThreads(identityId) {
  const sql = getSQL();
  if (identityId) {
    const rows2 = await sql`
      SELECT * FROM threads
      WHERE identity_id = ${identityId}
      ORDER BY last_message_at DESC
    `;
    return rows2;
  }
  const rows = await sql`SELECT * FROM threads ORDER BY last_message_at DESC`;
  return rows;
}
async function createThread(data) {
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO threads (subject, identity_id, status, labels)
    VALUES (
      ${data.subject},
      ${data.identity_id},
      ${data.status ?? "open"},
      ${data.labels ?? []}
    )
    RETURNING *
  `;
  return rows[0];
}
async function getThreadsWithPreview(identityId) {
  const sql = getSQL();
  const rows = identityId ? await sql`
        SELECT
          t.*,
          i.name   AS identity_name,
          i.email  AS identity_email,
          lm.from_email  AS last_from_email,
          lm.from_name   AS last_from_name,
          lm.direction    AS last_direction,
          LEFT(lm.body_text, 100) AS preview
        FROM threads t
        JOIN identities i ON i.id = t.identity_id
        LEFT JOIN LATERAL (
          SELECT m.from_email, m.from_name, m.direction, m.body_text
          FROM messages m
          WHERE m.thread_id = t.id
          ORDER BY m.received_at DESC
          LIMIT 1
        ) lm ON true
        WHERE t.identity_id = ${identityId}
        ORDER BY t.last_message_at DESC
      ` : await sql`
        SELECT
          t.*,
          i.name   AS identity_name,
          i.email  AS identity_email,
          lm.from_email  AS last_from_email,
          lm.from_name   AS last_from_name,
          lm.direction    AS last_direction,
          LEFT(lm.body_text, 100) AS preview
        FROM threads t
        JOIN identities i ON i.id = t.identity_id
        LEFT JOIN LATERAL (
          SELECT m.from_email, m.from_name, m.direction, m.body_text
          FROM messages m
          WHERE m.thread_id = t.id
          ORDER BY m.received_at DESC
          LIMIT 1
        ) lm ON true
        ORDER BY t.last_message_at DESC
      `;
  return rows;
}
async function getThread(threadId) {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM threads WHERE id = ${threadId} LIMIT 1`;
  return rows.length > 0 ? rows[0] : null;
}
async function getThreadWithIdentity(threadId) {
  const sql = getSQL();
  const rows = await sql`
    SELECT t.*, i.name AS identity_name, i.email AS identity_email
    FROM threads t
    JOIN identities i ON i.id = t.identity_id
    WHERE t.id = ${threadId}
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0] : null;
}
async function getThreadMessages(threadId) {
  const sql = getSQL();
  const rows = await sql`
    SELECT * FROM messages
    WHERE thread_id = ${threadId}
    ORDER BY received_at ASC
  `;
  return rows;
}
async function createMessage(data) {
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO messages (
      thread_id, resend_id, direction, from_email, from_name,
      to_email, cc, subject, body_html, body_text, attachments
    )
    VALUES (
      ${data.thread_id},
      ${data.resend_id ?? null},
      ${data.direction},
      ${data.from_email},
      ${data.from_name ?? null},
      ${data.to_email},
      ${data.cc ?? []},
      ${data.subject ?? null},
      ${data.body_html ?? null},
      ${data.body_text ?? null},
      ${JSON.stringify(data.attachments ?? [])}
    )
    RETURNING *
  `;
  await sql`
    UPDATE threads SET last_message_at = NOW()
    WHERE id = ${data.thread_id}
  `;
  return rows[0];
}

// src/email.ts
function getHeader(headers, name) {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) return value;
  }
  return void 0;
}
function normalizeSubject(subject) {
  return subject.replace(/^(?:re|fwd?)\s*:\s*/gi, "").trim();
}
function parseEmailAddress(raw) {
  const match = raw.match(/<([^>]+)>/);
  return match ? match[1].toLowerCase() : raw.trim().toLowerCase();
}
async function matchIdentity(toField) {
  const identities = await getIdentities();
  const toAddresses = toField.split(",").map((a) => parseEmailAddress(a));
  for (const addr of toAddresses) {
    const identity = identities.find((i) => i.email.toLowerCase() === addr);
    if (identity) return identity;
  }
  return null;
}
async function matchThread(headers, subject, identityId) {
  const sql = getSQL();
  const inReplyTo = getHeader(headers, "In-Reply-To");
  const references = getHeader(headers, "References");
  const candidateIds = [];
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
    if (rows.length > 0) return rows[0];
  }
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
    if (rows.length > 0) return rows[0];
  }
  return null;
}
async function processInboundEmail(payload) {
  const identity = await matchIdentity(payload.to);
  if (!identity) {
    throw new Error(
      `No identity found for recipient address: ${payload.to}`
    );
  }
  let thread = await matchThread(
    payload.headers,
    payload.subject,
    identity.id
  );
  let isNewThread = false;
  if (!thread) {
    thread = await createThread({
      subject: payload.subject,
      identity_id: identity.id
    });
    isNewThread = true;
  }
  const attachmentsMeta = (payload.attachments ?? []).map((a) => ({
    filename: a.filename,
    mimeType: a.content_type,
    size: a.size
  }));
  const message = await createMessage({
    thread_id: thread.id,
    direction: "inbound",
    from_email: parseEmailAddress(payload.from),
    from_name: payload.from.match(/^([^<]+)</)?.[1]?.trim() ?? void 0,
    to_email: identity.email,
    subject: payload.subject,
    body_html: payload.html ?? void 0,
    body_text: payload.text ?? void 0,
    attachments: attachmentsMeta
  });
  return {
    threadId: thread.id,
    messageId: message.id,
    isNewThread
  };
}

export {
  configureSendbox,
  getResend,
  getIdentities,
  createIdentity,
  deleteIdentity,
  getThreads,
  createThread,
  getThreadsWithPreview,
  getThread,
  getThreadWithIdentity,
  getThreadMessages,
  createMessage,
  normalizeSubject,
  parseEmailAddress,
  matchIdentity,
  matchThread,
  processInboundEmail
};
