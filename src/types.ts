// ─── Core Types ──────────────────────────────────────────────────────

/** An email identity — a "from" address your app can send and receive as. */
export interface Identity {
  id: string;
  name: string;
  email: string;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
}

/** An email thread grouping related messages. */
export interface Thread {
  id: string;
  subject: string;
  identity_id: string;
  last_message_at: string;
  status: string;
  labels: string[];
  created_at: string;
}

/** A thread with its latest message preview and identity info. */
export interface ThreadWithPreview extends Thread {
  identity_name: string;
  identity_email: string;
  last_from_email: string | null;
  last_from_name: string | null;
  last_direction: "inbound" | "outbound" | null;
  preview: string | null;
}

/** A single email message within a thread. */
export interface Message {
  id: string;
  thread_id: string;
  resend_id: string | null;
  direction: "inbound" | "outbound";
  from_email: string;
  from_name: string | null;
  to_email: string;
  cc: string[];
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  attachments: Record<string, unknown>[];
  received_at: string;
}

// ─── Email Processing Types ─────────────────────────────────────────

/** Attachment metadata from Resend inbound webhook. */
export interface InboundAttachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  content_disposition: string;
  content_id?: string;
}

/** Parsed inbound email payload passed to processInboundEmail. */
export interface InboundEmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string | null;
  text: string | null;
  headers: Record<string, string>;
  attachments: InboundAttachment[];
  message_id?: string;
}

/** Result of processing an inbound email. */
export interface ProcessResult {
  threadId: string;
  messageId: string;
  isNewThread: boolean;
}

// ─── Configuration ──────────────────────────────────────────────────

/** SQL executor function — compatible with @neondatabase/serverless tagged template. */
export type SqlExecutor = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

/** Options for configureSendbox(). */
export interface SendboxConfig {
  /** Custom SQL executor. Defaults to @neondatabase/serverless using DATABASE_URL. */
  sql?: SqlExecutor;
  /** Resend API key. Defaults to process.env.RESEND_API_KEY. */
  resendApiKey?: string;
  /** Database URL for Neon. Defaults to process.env.DATABASE_URL. */
  databaseUrl?: string;
}

// ─── Handler Options ────────────────────────────────────────────────

/** Options for handler factories. */
export interface HandlerOptions {
  /** Optional auth check — throw to reject the request. */
  authorize?: (req: Request) => Promise<void> | void;
  /** Called after a message is successfully sent. */
  onMessageSent?: (data: {
    threadId: string;
    messageId: string;
    resendId: string;
  }) => Promise<void> | void;
  /** Called after an inbound message is processed. */
  onMessageReceived?: (data: ProcessResult) => Promise<void> | void;
}
