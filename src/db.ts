import { getSQL } from "./config.js";
import type {
  Identity,
  Thread,
  ThreadWithPreview,
  Message,
} from "./types.js";

// ─── Identities ─────────────────────────────────────────────────────

export async function getIdentities(): Promise<Identity[]> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM identities ORDER BY created_at ASC`;
  return rows as unknown as Identity[];
}

export async function createIdentity(data: {
  name: string;
  email: string;
  role?: string;
  avatar_url?: string;
}): Promise<Identity> {
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO identities (name, email, role, avatar_url)
    VALUES (${data.name}, ${data.email}, ${data.role ?? null}, ${data.avatar_url ?? null})
    RETURNING *
  `;
  return rows[0] as unknown as Identity;
}

export async function deleteIdentity(id: string): Promise<boolean> {
  const sql = getSQL();
  const rows = await sql`DELETE FROM identities WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

// ─── Threads ────────────────────────────────────────────────────────

export async function getThreads(identityId?: string): Promise<Thread[]> {
  const sql = getSQL();
  if (identityId) {
    const rows = await sql`
      SELECT * FROM threads
      WHERE identity_id = ${identityId}
      ORDER BY last_message_at DESC
    `;
    return rows as unknown as Thread[];
  }
  const rows = await sql`SELECT * FROM threads ORDER BY last_message_at DESC`;
  return rows as unknown as Thread[];
}

export async function createThread(data: {
  subject: string;
  identity_id: string;
  status?: string;
  labels?: string[];
}): Promise<Thread> {
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
  return rows[0] as unknown as Thread;
}

export async function getThreadsWithPreview(
  identityId?: string
): Promise<ThreadWithPreview[]> {
  const sql = getSQL();

  const rows = identityId
    ? await sql`
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
      `
    : await sql`
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

  return rows as unknown as ThreadWithPreview[];
}

export async function getThread(threadId: string): Promise<Thread | null> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM threads WHERE id = ${threadId} LIMIT 1`;
  return rows.length > 0 ? (rows[0] as unknown as Thread) : null;
}

export async function getThreadWithIdentity(
  threadId: string
): Promise<(Thread & { identity_name: string; identity_email: string }) | null> {
  const sql = getSQL();
  const rows = await sql`
    SELECT t.*, i.name AS identity_name, i.email AS identity_email
    FROM threads t
    JOIN identities i ON i.id = t.identity_id
    WHERE t.id = ${threadId}
    LIMIT 1
  `;
  return rows.length > 0
    ? (rows[0] as unknown as Thread & { identity_name: string; identity_email: string })
    : null;
}

// ─── Messages ───────────────────────────────────────────────────────

export async function getThreadMessages(threadId: string): Promise<Message[]> {
  const sql = getSQL();
  const rows = await sql`
    SELECT * FROM messages
    WHERE thread_id = ${threadId}
    ORDER BY received_at ASC
  `;
  return rows as unknown as Message[];
}

export async function createMessage(data: {
  thread_id: string;
  resend_id?: string;
  direction: "inbound" | "outbound";
  from_email: string;
  from_name?: string;
  to_email: string;
  cc?: string[];
  subject?: string;
  body_html?: string;
  body_text?: string;
  attachments?: Record<string, unknown>[];
}): Promise<Message> {
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

  // Bump the thread's last_message_at
  await sql`
    UPDATE threads SET last_message_at = NOW()
    WHERE id = ${data.thread_id}
  `;

  return rows[0] as unknown as Message;
}
