// ─── Types ──────────────────────────────────────────────────────────
export type {
  Identity,
  Thread,
  ThreadWithPreview,
  Message,
  InboundEmailPayload,
  InboundAttachment,
  ProcessResult,
  SqlExecutor,
  SendboxConfig,
  HandlerOptions,
} from "./types.js";

// ─── Configuration ──────────────────────────────────────────────────
export { configureSendbox } from "./config.js";

// ─── Resend Client ──────────────────────────────────────────────────
export { getResend } from "./resend.js";

// ─── Database ───────────────────────────────────────────────────────
export {
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
} from "./db.js";

// ─── Email Processing ───────────────────────────────────────────────
export {
  processInboundEmail,
  matchIdentity,
  matchThread,
  normalizeSubject,
  parseEmailAddress,
} from "./email.js";
