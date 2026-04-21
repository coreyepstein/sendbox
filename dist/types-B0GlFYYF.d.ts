/** An email identity — a "from" address your app can send and receive as. */
interface Identity {
    id: string;
    name: string;
    email: string;
    role: string | null;
    avatar_url: string | null;
    created_at: string;
}
/** An email thread grouping related messages. */
interface Thread {
    id: string;
    subject: string;
    identity_id: string;
    last_message_at: string;
    status: string;
    labels: string[];
    created_at: string;
}
/** A thread with its latest message preview and identity info. */
interface ThreadWithPreview extends Thread {
    identity_name: string;
    identity_email: string;
    last_from_email: string | null;
    last_from_name: string | null;
    last_direction: "inbound" | "outbound" | null;
    preview: string | null;
}
/** A single email message within a thread. */
interface Message {
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
/** Attachment metadata from Resend inbound webhook. */
interface InboundAttachment {
    id: string;
    filename: string;
    content_type: string;
    size: number;
    content_disposition: string;
    content_id?: string;
}
/** Parsed inbound email payload passed to processInboundEmail. */
interface InboundEmailPayload {
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
interface ProcessResult {
    threadId: string;
    messageId: string;
    isNewThread: boolean;
}
/** SQL executor function — compatible with @neondatabase/serverless tagged template. */
type SqlExecutor = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;
/** Options for configureSendbox(). */
interface SendboxConfig {
    /** Custom SQL executor. Defaults to @neondatabase/serverless using DATABASE_URL. */
    sql?: SqlExecutor;
    /** Resend API key. Defaults to process.env.RESEND_API_KEY. */
    resendApiKey?: string;
    /** Database URL for Neon. Defaults to process.env.DATABASE_URL. */
    databaseUrl?: string;
}
/** Options for handler factories. */
interface HandlerOptions {
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

export type { HandlerOptions as H, Identity as I, Message as M, ProcessResult as P, SendboxConfig as S, Thread as T, ThreadWithPreview as a, InboundEmailPayload as b, InboundAttachment as c, SqlExecutor as d };
