import { neon } from "@neondatabase/serverless";
import type { SqlExecutor, SendboxConfig } from "./types.js";

let _sql: SqlExecutor | null = null;
let _resendApiKey: string | null = null;

/**
 * Configure sendbox with custom SQL executor or API keys.
 * Call this once at app startup before any sendbox operations.
 *
 * If not called, sendbox defaults to:
 * - @neondatabase/serverless using process.env.DATABASE_URL
 * - Resend using process.env.RESEND_API_KEY
 */
export function configureSendbox(config: SendboxConfig): void {
  if (config.sql) {
    _sql = config.sql;
  }
  if (config.resendApiKey) {
    _resendApiKey = config.resendApiKey;
  }
  if (config.databaseUrl) {
    _sql = neon(config.databaseUrl) as unknown as SqlExecutor;
  }
}

/** Get the SQL executor — uses configured one or creates from DATABASE_URL. */
export function getSQL(): SqlExecutor {
  if (_sql) return _sql;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set. Call configureSendbox() or set DATABASE_URL.");
  return neon(url) as unknown as SqlExecutor;
}

/** Get the Resend API key. */
export function getResendApiKey(): string {
  if (_resendApiKey) return _resendApiKey;

  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set. Call configureSendbox() or set RESEND_API_KEY.");
  return key;
}
