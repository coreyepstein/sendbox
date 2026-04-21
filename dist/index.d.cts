import { S as SendboxConfig, I as Identity, M as Message, T as Thread, a as ThreadWithPreview, b as InboundEmailPayload, P as ProcessResult } from './types-B0GlFYYF.cjs';
export { H as HandlerOptions, c as InboundAttachment, d as SqlExecutor } from './types-B0GlFYYF.cjs';
import { Resend } from 'resend';

/**
 * Configure sendbox with custom SQL executor or API keys.
 * Call this once at app startup before any sendbox operations.
 *
 * If not called, sendbox defaults to:
 * - @neondatabase/serverless using process.env.DATABASE_URL
 * - Resend using process.env.RESEND_API_KEY
 */
declare function configureSendbox(config: SendboxConfig): void;

/** Get the Resend client singleton. */
declare function getResend(): Resend;

declare function getIdentities(): Promise<Identity[]>;
declare function createIdentity(data: {
    name: string;
    email: string;
    role?: string;
    avatar_url?: string;
}): Promise<Identity>;
declare function deleteIdentity(id: string): Promise<boolean>;
declare function getThreads(identityId?: string): Promise<Thread[]>;
declare function createThread(data: {
    subject: string;
    identity_id: string;
    status?: string;
    labels?: string[];
}): Promise<Thread>;
declare function getThreadsWithPreview(identityId?: string): Promise<ThreadWithPreview[]>;
declare function getThread(threadId: string): Promise<Thread | null>;
declare function getThreadWithIdentity(threadId: string): Promise<(Thread & {
    identity_name: string;
    identity_email: string;
}) | null>;
declare function getThreadMessages(threadId: string): Promise<Message[]>;
declare function createMessage(data: {
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
}): Promise<Message>;

/** Strip Re:/Fwd: prefixes and trim whitespace for subject comparison. */
declare function normalizeSubject(subject: string): string;
/** Extract raw email address from "Name <addr>" format. */
declare function parseEmailAddress(raw: string): string;
/**
 * Match an identity by checking each address in the `to` field.
 * Resend may deliver to a comma-separated list.
 */
declare function matchIdentity(toField: string): Promise<Identity | null>;
/**
 * Try to find an existing thread by:
 *  1. In-Reply-To / References headers → match a resend_id on an existing message
 *  2. Normalized subject line → match an open thread for the same identity
 */
declare function matchThread(headers: Record<string, string>, subject: string, identityId: string): Promise<Thread | null>;
/**
 * Process a single inbound email:
 *  - Match identity by `to` address
 *  - Find or create thread
 *  - Store message
 */
declare function processInboundEmail(payload: InboundEmailPayload): Promise<ProcessResult>;

export { Identity, InboundEmailPayload, Message, ProcessResult, SendboxConfig, Thread, ThreadWithPreview, configureSendbox, createIdentity, createMessage, createThread, deleteIdentity, getIdentities, getResend, getThread, getThreadMessages, getThreadWithIdentity, getThreads, getThreadsWithPreview, matchIdentity, matchThread, normalizeSubject, parseEmailAddress, processInboundEmail };
